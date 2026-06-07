import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/db';
import { createPost, secondUser, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

function bearer(token: string) {
  return `Bearer ${token}`;
}

function forYou(token: string) {
  return request(app)
    .get('/api/v1/posts/for-you?limit=10')
    .set('Authorization', bearer(token));
}

function forYouPage(token: string, limit: number, cursor?: string) {
  return request(app)
    .get('/api/v1/posts/for-you')
    .query({ limit, cursor })
    .set('Authorization', bearer(token));
}

describe('for-you ranking', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('serves recent public posts to a new user with no follows', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;

    const bobPostId = (await createPost(bob.accessToken, { text: 'from bob' }))
      .body.post.id;

    const res = await forYou(alice.accessToken);

    expect(res.status).toBe(200);
    expect(res.body.posts.map((post: { id: number }) => post.id)).toContain(
      bobPostId,
    );
  });

  it('includes posts liked by people the viewer follows', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;
    const carol = (
      await signup({
        username: 'carol',
        email: 'carol@example.com',
        name: 'Carol',
      })
    ).body;

    await request(app)
      .put(`/api/v1/users/follow/${bob.userId}`)
      .set('Authorization', bearer(alice.accessToken))
      .expect(204);

    const carolPostId = (
      await createPost(carol.accessToken, { text: 'liked by followed user' })
    ).body.post.id;

    await request(app)
      .put(`/api/v1/posts/${carolPostId}/like`)
      .set('Authorization', bearer(bob.accessToken))
      .expect(204);

    const res = await forYou(alice.accessToken);

    expect(res.status).toBe(200);
    expect(res.body.posts.map((post: { id: number }) => post.id)).toContain(
      carolPostId,
    );
  });

  it('excludes comments from the candidate pool', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;

    const parentPostId = (await createPost(bob.accessToken, { text: 'parent' }))
      .body.post.id;
    const commentId = (
      await request(app)
        .post(`/api/v1/posts/${parentPostId}`)
        .set('Authorization', bearer(bob.accessToken))
        .send({ text: 'popular comment' })
    ).body.post.id;

    await prisma.post.update({
      where: { id: commentId },
      data: { likesCount: 100, commentsCount: 100, repostsCount: 100 },
    });

    const res = await forYou(alice.accessToken);

    expect(res.status).toBe(200);
    expect(res.body.posts.map((post: { id: number }) => post.id)).not.toContain(
      commentId,
    );
  });

  it('paginates by ranking cursor without duplicating posts', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;

    for (let i = 0; i < 6; i += 1) {
      await createPost(bob.accessToken, { text: `ranked post ${i}` });
    }

    const firstPage = await forYouPage(alice.accessToken, 3);
    expect(firstPage.status).toBe(200);
    expect(firstPage.body.posts).toHaveLength(3);
    expect(typeof firstPage.body.nextCursor).toBe('string');

    const secondPage = await forYouPage(
      alice.accessToken,
      3,
      firstPage.body.nextCursor as string,
    );
    expect(secondPage.status).toBe(200);
    expect(secondPage.body.posts).toHaveLength(3);

    const firstIds = firstPage.body.posts.map((post: { id: number }) => post.id);
    const secondIds = secondPage.body.posts.map(
      (post: { id: number }) => post.id,
    );

    expect(new Set([...firstIds, ...secondIds]).size).toBe(6);
  });
});
