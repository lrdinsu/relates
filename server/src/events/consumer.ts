import { Consumer } from 'kafkajs';

import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../db';
import { fanOutPost } from '../feed/feedStore.js';
import { isPrismaErrorCode } from '../utils/prismaError.js';
import {
  FOLLOW_CREATED,
  FollowCreatedPayload,
  LIKE_CREATED,
  LikeCreatedPayload,
  POST_CREATED,
  PostCreatedPayload,
} from './events.js';
import { TOPIC, kafka } from './kafka.js';

// Reads the event topic as a consumer group and turns each event into a
// notification. The group lets us scale to more consumer instances later
// (Kafka splits partitions across the group) without changing this code.
export const consumer: Consumer = kafka.consumer({ groupId: 'notifications' });

// The shape the publisher writes to each message value.
type OutboxMessage = {
  id: string;
  eventType: string;
  payload: unknown;
};

// Turn one event into a notification, idempotently. Exported so tests can drive
// it directly without standing up a running consumer.
//
// Idempotency: Notification.eventId is unique and holds the originating event
// id. Kafka delivery is at-least-once, so the same event can arrive more than
// once; the second insert hits the unique constraint (P2002) and we treat it as
// already handled. That is why the consumer can be redelivered safely.
export async function handleEvent(raw: string): Promise<void> {
  const message = JSON.parse(raw) as OutboxMessage;

  // A new post fans out to follower feeds rather than creating a notification.
  if (message.eventType === POST_CREATED) {
    const payload = message.payload as PostCreatedPayload;
    await fanOutPost(payload.postId, payload.authorId);
    return;
  }

  let data: Prisma.NotificationUncheckedCreateInput;
  if (message.eventType === LIKE_CREATED) {
    const payload = message.payload as LikeCreatedPayload;
    data = {
      eventId: message.id,
      type: 'LIKE',
      recipientId: payload.recipientId,
      actorId: payload.actorId,
      postId: payload.postId,
    };
  } else if (message.eventType === FOLLOW_CREATED) {
    const payload = message.payload as FollowCreatedPayload;
    data = {
      eventId: message.id,
      type: 'FOLLOW',
      recipientId: payload.recipientId,
      actorId: payload.actorId,
    };
  } else {
    // Unknown event type: ignore rather than crash the consumer.
    return;
  }

  try {
    await prisma.notification.create({ data });
  } catch (err) {
    // Already processed this event id (a redelivery): no-op.
    if (!isPrismaErrorCode(err, 'P2002')) throw err;
  }
}

let running = false;

export async function startNotificationConsumer(): Promise<void> {
  if (running) return;
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      await handleEvent(message.value.toString());
    },
  });
  running = true;
}

export async function stopNotificationConsumer(): Promise<void> {
  if (running) {
    await consumer.disconnect();
    running = false;
  }
}
