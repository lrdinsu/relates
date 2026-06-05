import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/db';
import { handleEvent } from '../src/events/consumer';
import { disconnectProducer } from '../src/events/kafka';
import { publishPendingEvents } from '../src/events/publisher';
import { createPost, secondUser, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

function bearer(token: string) {
  return `Bearer ${token}`;
}

// Replay the outbox rows through the consumer logic the way a delivered Kafka
// message would, so we can assert the end result deterministically without
// depending on consumer-group timing.
async function deliverPendingOutbox() {
  const events = await prisma.outbox.findMany({ orderBy: { createdAt: 'asc' } });
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

describe('notifications pipeline', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectProducer();
  });

  it('writes a LIKE_CREATED outbox event in the same transaction as the like, but not for a self-like', async () => {
    const author = (await signup()).body;
    const liker = (await signup(secondUser)).body;
    const postId = (await createPost(author.accessToken, { text: 'hi' })).body
      .post.id;

    // Author likes their own post: no notification event.
    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(author.accessToken))
      .expect(204);
    expect(await prisma.outbox.count()).toBe(0);

    // Another user likes it: exactly one LIKE_CREATED event with the right payload.
    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(liker.accessToken))
      .expect(204);

    const events = await prisma.outbox.findMany();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('LIKE_CREATED');
    expect(events[0].payload).toMatchObject({
      actorId: liker.userId,
      recipientId: author.userId,
      postId,
    });
    expect(events[0].publishedAt).toBeNull();
  });

  it('writes a FOLLOW_CREATED outbox event when a user follows another', async () => {
    const alice = (await signup()).body;
    const bob = (await signup(secondUser)).body;

    await request(app)
      .put(`/api/v1/users/follow/${bob.userId}`)
      .set('Authorization', bearer(alice.accessToken))
      .expect(204);

    const events = await prisma.outbox.findMany();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('FOLLOW_CREATED');
    expect(events[0].payload).toMatchObject({
      actorId: alice.userId,
      recipientId: bob.userId,
    });
  });

  it('publishes pending outbox events to the broker and marks them published', async () => {
    const author = (await signup()).body;
    const liker = (await signup(secondUser)).body;
    const postId = (await createPost(author.accessToken, { text: 'hi' })).body
      .post.id;
    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(liker.accessToken))
      .expect(204);

    const published = await publishPendingEvents();
    expect(published).toBe(1);

    const events = await prisma.outbox.findMany();
    expect(events[0].publishedAt).not.toBeNull();

    // Nothing left to publish on a second pass.
    expect(await publishPendingEvents()).toBe(0);
  });

  it('creates one notification per event and is idempotent on redelivery', async () => {
    const author = (await signup()).body;
    const liker = (await signup(secondUser)).body;
    const postId = (await createPost(author.accessToken, { text: 'hi' })).body
      .post.id;
    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(liker.accessToken))
      .expect(204);

    const [event] = await prisma.outbox.findMany();
    const message = JSON.stringify({
      id: event.id,
      eventType: event.eventType,
      payload: event.payload,
    });

    await handleEvent(message);
    expect(await prisma.notification.count()).toBe(1);

    // At-least-once redelivery of the same event id must not duplicate.
    await handleEvent(message);
    expect(await prisma.notification.count()).toBe(1);
  });

  it('surfaces a like as a notification through GET /notifications', async () => {
    const author = (await signup()).body;
    const liker = (await signup(secondUser)).body;
    const postId = (await createPost(author.accessToken, { text: 'hello' })).body
      .post.id;

    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(liker.accessToken))
      .expect(204);

    await publishPendingEvents();
    await deliverPendingOutbox();

    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', bearer(author.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(1);
    const note = res.body.notifications[0];
    expect(note.type).toBe('LIKE');
    expect(note.actor.id).toBe(liker.userId);
    expect(note.post.id).toBe(postId);
    expect(note.read).toBe(false);
  });
});
