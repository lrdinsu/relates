import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { createPost, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

describe('post full-text search', () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    token = (await signup()).body.accessToken;
  });

  it('finds a post by a word in its text', async () => {
    await createPost(token, { text: 'learning about kafka streaming today' });

    const res = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'kafka' });

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].text).toContain('kafka');
  });

  it('ranks a stronger text match above an incidental mention', async () => {
    const weak = (
      await createPost(token, {
        text: 'we discussed kafka briefly during the long meeting yesterday',
      })
    ).body.post.id;
    const strong = (
      await createPost(token, {
        text: 'kafka kafka kafka event streaming with kafka',
      })
    ).body.post.id;

    const res = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'kafka' });

    const ids = res.body.posts.map((post: { id: number }) => post.id);
    expect(ids[0]).toBe(strong);
    expect(ids).toContain(weak);
    expect(ids.indexOf(strong)).toBeLessThan(ids.indexOf(weak));
  });

  it('does not return soft-deleted posts', async () => {
    const postId = (await createPost(token, { text: 'a unique zebra post' })).body
      .post.id;
    await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const res = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'zebra' });

    expect(res.body.posts).toHaveLength(0);
  });

  it('paginates ranked results with an offset cursor', async () => {
    for (let i = 0; i < 3; i++) {
      await createPost(token, { text: `penguin sighting number ${i}` });
    }

    const page1 = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'penguin', limit: '2' });
    expect(page1.body.posts).toHaveLength(2);
    expect(page1.body.nextCursor).toBe(2);

    const page2 = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'penguin', limit: '2', cursor: String(page1.body.nextCursor) });
    expect(page2.body.posts).toHaveLength(1);
    expect(page2.body.nextCursor).toBeNull();
  });

  it('returns nothing for a non-matching query', async () => {
    await createPost(token, { text: 'completely unrelated content here' });

    const res = await request(app)
      .get('/api/v1/search/posts')
      .query({ q: 'dinosaur' });

    expect(res.body.posts).toHaveLength(0);
    expect(res.body.nextCursor).toBeNull();
  });
});
