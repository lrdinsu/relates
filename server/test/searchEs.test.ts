import {
  ElasticsearchContainer,
  StartedElasticsearchContainer,
} from '@testcontainers/elasticsearch';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/db';
import { getEsClient } from '../src/search/esClient';
import { handleChangeEvent } from '../src/search/indexer';
import {
  POST_INDEX,
  ensurePostIndex,
  reindexAllPosts,
} from '../src/search/postIndex';
import { createPost, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

// Elasticsearch is heavy, so it's started only for this file (not in the global
// setup that the rest of the suite shares).
let container: StartedElasticsearchContainer;

beforeAll(async () => {
  container = await new ElasticsearchContainer(
    'docker.elastic.co/elasticsearch/elasticsearch:9.0.3',
  )
    .withEnvironment({ 'xpack.security.enabled': 'false' })
    .start();
  process.env.ELASTICSEARCH_URL = container.getHttpUrl();
}, 180_000);

afterAll(async () => {
  delete process.env.ELASTICSEARCH_URL;
  await container?.stop();
});

async function refresh() {
  await getEsClient().indices.refresh({ index: POST_INDEX });
}

// A synthetic Debezium change event (schemas disabled, so op/after/before are at
// the top level) for a given post id.
function change(op: 'c' | 'u' | 'd', id: number): string {
  return JSON.stringify({
    op,
    after: op === 'd' ? undefined : { id },
    before: op === 'd' ? { id } : undefined,
  });
}

async function searchIds(q: string): Promise<number[]> {
  const res = await request(app).get('/api/v1/search/posts').query({ q });
  return res.body.posts.map((post: { id: number }) => post.id);
}

describe('Elasticsearch-backed search via the CDC indexer', () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    await getEsClient()
      .indices.delete({ index: POST_INDEX })
      .catch(() => {});
    await ensurePostIndex();
    token = (await signup()).body.accessToken;
  });

  it('indexes a created post so it is searchable through the ES path', async () => {
    const postId = (await createPost(token, { text: 'kangaroo facts' })).body.post
      .id;

    await handleChangeEvent(change('c', postId));
    await refresh();

    expect(await searchIds('kangaroo')).toContain(postId);
  });

  it('reflects an edit in the index', async () => {
    const postId = (await createPost(token, { text: 'original walrus text' }))
      .body.post.id;
    await handleChangeEvent(change('c', postId));
    await refresh();

    await prisma.post.update({
      where: { id: postId },
      data: { text: 'updated narwhal text' },
    });
    await handleChangeEvent(change('u', postId));
    await refresh();

    expect(await searchIds('narwhal')).toContain(postId);
    expect(await searchIds('walrus')).not.toContain(postId);
  });

  it('drops a soft-deleted post from the index', async () => {
    const postId = (await createPost(token, { text: 'temporary platypus post' }))
      .body.post.id;
    await handleChangeEvent(change('c', postId));
    await refresh();
    expect(await searchIds('platypus')).toContain(postId);

    // Soft-delete is an UPDATE in Postgres; Debezium emits 'u' with the new row.
    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
    await handleChangeEvent(change('u', postId));
    await refresh();

    expect(await searchIds('platypus')).not.toContain(postId);
  });

  it('removes a post on a delete change event', async () => {
    const postId = (await createPost(token, { text: 'doomed armadillo post' }))
      .body.post.id;
    await handleChangeEvent(change('c', postId));
    await refresh();
    expect(await searchIds('armadillo')).toContain(postId);

    await handleChangeEvent(change('d', postId));
    await refresh();
    expect(await searchIds('armadillo')).not.toContain(postId);
  });

  it('rebuilds the whole index from Postgres', async () => {
    const a = (await createPost(token, { text: 'reindex otter one' })).body.post
      .id;
    const b = (await createPost(token, { text: 'reindex otter two' })).body.post
      .id;

    // Nothing indexed incrementally; a full reindex reproduces the index.
    const count = await reindexAllPosts();
    expect(count).toBeGreaterThanOrEqual(2);

    const ids = await searchIds('otter');
    expect(ids).toContain(a);
    expect(ids).toContain(b);
  });
});
