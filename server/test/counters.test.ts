import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/db';
import { createPost, secondUser, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

function bearer(token: string) {
  return `Bearer ${token}`;
}

// These tests guard the denormalized counters (likesCount, repostsCount,
// followersCount/followingCount, commentsCount) against drifting away from the
// rows they summarize. The signature assertion is "counter === actual row
// count": it holds no matter how concurrent toggles interleave, and it is what
// would have caught the original non-transactional dual-write bug.
describe('counter integrity', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('keeps likesCount equal to the Like row count under concurrent likes', async () => {
    const { accessToken } = (await signup()).body;
    const postId = (await createPost(accessToken, { text: 'hi' })).body.post.id;

    // Fire many identical likes at once (a double-tap race). None should 500.
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        request(app)
          .put(`/api/v1/posts/${postId}/like`)
          .set('Authorization', bearer(accessToken)),
      ),
    );
    for (const res of results) expect(res.status).toBe(204);

    const rows = await prisma.like.count({ where: { postId } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    expect(post?.likesCount).toBe(rows);
  });

  it('keeps repostsCount equal to the Repost row count under concurrent reposts', async () => {
    const { accessToken } = (await signup()).body;
    const postId = (await createPost(accessToken, { text: 'hi' })).body.post.id;

    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        request(app)
          .put(`/api/v1/posts/${postId}/repost`)
          .set('Authorization', bearer(accessToken)),
      ),
    );
    for (const res of results) expect(res.status).toBe(204);

    const rows = await prisma.repost.count({ where: { postId } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    expect(post?.repostsCount).toBe(rows);
  });

  it('keeps follower/following counts equal to the edge count under concurrent follows', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;

    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        request(app)
          .put(`/api/v1/users/follow/${bob.userId}`)
          .set('Authorization', bearer(alice.accessToken)),
      ),
    );
    for (const res of results) expect(res.status).toBe(204);

    const edges = await prisma.userFollows.count({
      where: { followerId: alice.userId, followingId: bob.userId },
    });
    const target = await prisma.user.findUnique({ where: { id: bob.userId } });
    const follower = await prisma.user.findUnique({
      where: { id: alice.userId },
    });
    expect(target?.followersCount).toBe(edges);
    expect(follower?.followingCount).toBe(edges);
  });

  it('keeps commentsCount equal to the live reply count as replies are added and deleted', async () => {
    const { accessToken } = (await signup()).body;
    const parentId = (await createPost(accessToken, { text: 'parent' })).body.post
      .id;

    // Add three replies under the parent.
    const replyIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post(`/api/v1/posts/${parentId}`)
        .set('Authorization', bearer(accessToken))
        .send({ text: `reply ${i}` });
      expect(res.status).toBe(201);
      replyIds.push(res.body.post.id);
    }

    async function liveReplyCount() {
      return prisma.post.count({
        where: { parentPostId: parentId, isDeleted: false },
      });
    }
    async function parentCommentsCount() {
      const parent = await prisma.post.findUnique({ where: { id: parentId } });
      return parent?.commentsCount;
    }

    expect(await parentCommentsCount()).toBe(3);
    expect(await parentCommentsCount()).toBe(await liveReplyCount());

    // Delete one reply: the count drops to match.
    await request(app)
      .delete(`/api/v1/posts/${replyIds[0]}`)
      .set('Authorization', bearer(accessToken))
      .expect(204);

    expect(await parentCommentsCount()).toBe(2);
    expect(await parentCommentsCount()).toBe(await liveReplyCount());

    // Delete the same reply again: idempotent, the count must not drop twice.
    await request(app)
      .delete(`/api/v1/posts/${replyIds[0]}`)
      .set('Authorization', bearer(accessToken))
      .expect(204);

    expect(await parentCommentsCount()).toBe(2);
  });
});
