import { prisma } from '../db/index.js';
import { getEsClient } from './esClient.js';

export const POST_INDEX = 'posts';

// The minimal post shape the indexer and reindex need.
export interface IndexablePost {
  id: number;
  text: string | null;
  postedById: number;
  createdAt: Date | string;
  isDeleted: boolean;
}

// Create the index with an explicit mapping if it isn't there yet.
export async function ensurePostIndex(): Promise<void> {
  const es = getEsClient();
  const exists = await es.indices.exists({ index: POST_INDEX });
  if (exists) return;

  await es.indices.create({
    index: POST_INDEX,
    mappings: {
      properties: {
        text: { type: 'text' },
        postedById: { type: 'integer' },
        createdAt: { type: 'date' },
      },
    },
  });
}

// Remove a post from the index; a missing doc is fine (idempotent).
export async function removePost(postId: number): Promise<void> {
  const es = getEsClient();
  try {
    await es.delete({ index: POST_INDEX, id: String(postId) });
  } catch (err) {
    const statusCode = (err as { meta?: { statusCode?: number } })?.meta
      ?.statusCode;
    if (statusCode !== 404) throw err;
  }
}

// Upsert a post into the index. A soft-deleted post is removed instead, so the
// index never serves deleted content.
export async function indexPost(post: IndexablePost): Promise<void> {
  if (post.isDeleted) {
    await removePost(post.id);
    return;
  }

  const es = getEsClient();
  await es.index({
    index: POST_INDEX,
    id: String(post.id),
    document: {
      text: post.text ?? '',
      postedById: post.postedById,
      createdAt:
        typeof post.createdAt === 'string'
          ? post.createdAt
          : post.createdAt.toISOString(),
    },
  });
}

// Search the index, returning matching post ids ranked by relevance.
export async function searchPostIds(
  q: string,
  from: number,
  size: number,
): Promise<number[]> {
  const es = getEsClient();
  const result = await es.search({
    index: POST_INDEX,
    from,
    size,
    query: { match: { text: q } },
    _source: false,
  });
  return result.hits.hits.map((hit) => Number(hit._id));
}

// Rebuild the whole index from Postgres. The index is a derived view, so this
// is how we recover from a cold start or a lost index.
export async function reindexAllPosts(): Promise<number> {
  const es = getEsClient();
  await ensurePostIndex();

  const posts = await prisma.post.findMany({
    where: { isDeleted: false },
    select: { id: true, text: true, postedById: true, createdAt: true },
  });
  if (posts.length === 0) return 0;

  const operations = posts.flatMap((post) => [
    { index: { _index: POST_INDEX, _id: String(post.id) } },
    {
      text: post.text ?? '',
      postedById: post.postedById,
      createdAt: post.createdAt.toISOString(),
    },
  ]);
  await es.bulk({ operations, refresh: true });
  return posts.length;
}
