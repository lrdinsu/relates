import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/db';
import { handleEvent } from '../src/events/consumer';
import {
  CELEBRITY_FOLLOWER_THRESHOLD,
  getFeedPage,
} from '../src/feed/feedStore';
import { createPost, secondUser, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

function bearer(token: string) {
  return `Bearer ${token}`;
}

// Replay the POST_CREATED outbox events through the consumer the way a delivered
// Kafka message would, so fan-out runs deterministically without a live loop.
async function deliverPostEvents() {
  const events = await prisma.outbox.findMany({
    where: { eventType: 'POST_CREATED' },
    orderBy: { createdAt: 'asc' },
  });
  for (const event of events) {
    await handleEvent(
      JSON.stringify({
        id: event.id,
        eventType: event.eventType,
        payload: event.payload,
      }),
    );
  }
}

function follow(token: string, targetUserId: number) {
  return request(app)
    .put(`/api/v1/users/follow/${targetUserId}`)
    .set('Authorization', bearer(token))
    .expect(204);
}

describe('feed fan-out', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("fans a new post into the followers' feeds and the author's own, but not others'", async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;
    const carol = (
      await signup({
        username: 'carol',
        email: 'carol@example.com',
        name: 'Carol',
      })
    ).body;

    await follow(bob.accessToken, alice.userId);

    const postId = (await createPost(alice.accessToken, { text: 'hi' })).body.post
      .id;
    await deliverPostEvents();

    expect(await getFeedPage(bob.userId, undefined, 10)).toContain(postId);
    expect(await getFeedPage(alice.userId, undefined, 10)).toContain(postId);
    expect(await getFeedPage(carol.userId, undefined, 10)).not.toContain(postId);
  });

  it('does not fan out a celebrity post, but merges it at read time', async () => {
    const alice = (await signup()).body; // will be the celebrity
    const dave = (
      await signup({
        username: 'dave',
        email: 'dave@example.com',
        name: 'Dave',
      })
    ).body;
    const bob = (await signup(secondUser)).body; // follows both

    await follow(bob.accessToken, alice.userId);
    await follow(bob.accessToken, dave.userId);

    // Make alice a celebrity.
    await prisma.user.update({
      where: { id: alice.userId },
      data: { followersCount: CELEBRITY_FOLLOWER_THRESHOLD },
    });

    const davePostId = (await createPost(dave.accessToken, { text: 'from dave' }))
      .body.post.id;
    const alicePostId = (
      await createPost(alice.accessToken, { text: 'from celebrity' })
    ).body.post.id;
    await deliverPostEvents();

    // Bob's Redis feed has dave's post (fanned out) but not the celebrity's.
    const feed = await getFeedPage(bob.userId, undefined, 10);
    expect(feed).toContain(davePostId);
    expect(feed).not.toContain(alicePostId);

    // But the served feed merges the celebrity's post in at read time.
    const res = await request(app)
      .get('/api/v1/posts/following')
      .set('Authorization', bearer(bob.accessToken));
    expect(res.status).toBe(200);
    const ids = res.body.posts.map((post: { id: number }) => post.id);
    expect(ids).toContain(davePostId);
    expect(ids).toContain(alicePostId);
  });

  it('does not duplicate a post in a feed when its event is redelivered', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;
    await follow(bob.accessToken, alice.userId);

    const postId = (await createPost(alice.accessToken, { text: 'hi' })).body.post
      .id;

    await deliverPostEvents();
    await deliverPostEvents(); // redelivery

    const feed = await getFeedPage(bob.userId, undefined, 10);
    expect(feed.filter((id) => id === postId)).toHaveLength(1);
  });

  it('rebuilds a cold feed from Postgres when serving', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;
    await follow(bob.accessToken, alice.userId);

    // Post exists but is never fanned out (no deliverPostEvents), so bob's feed
    // is cold. Serving should rebuild it from Postgres and return the post.
    const postId = (await createPost(alice.accessToken, { text: 'hi' })).body.post
      .id;

    const res = await request(app)
      .get('/api/v1/posts/following')
      .set('Authorization', bearer(bob.accessToken));

    expect(res.status).toBe(200);
    const ids = res.body.posts.map((post: { id: number }) => post.id);
    expect(ids).toContain(postId);
  });
});
