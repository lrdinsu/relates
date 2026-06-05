import { prisma } from '../db';
import { TOPIC, connectProducer, producer } from './kafka.js';

// The relay side of the outbox pattern. It reads outbox rows that haven't been
// shipped yet, publishes them to Kafka, then stamps publishedAt so they aren't
// sent again. Pulled out as a plain function so a loop can call it on a timer
// and tests can call it directly and assert on the result.
//
// Ordering note: we publish oldest-first. Delivery is at-least-once: if the
// send succeeds but the publishedAt update fails, the next pass re-sends the
// same event. That is fine because the consumer is idempotent (it dedupes on
// the event id), so a duplicate send can't create a duplicate notification.
export async function publishPendingEvents(batchSize = 100): Promise<number> {
  const pending = await prisma.outbox.findMany({
    where: { publishedAt: null },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  if (pending.length === 0) return 0;

  await connectProducer();
  await producer.send({
    topic: TOPIC,
    messages: pending.map((event) => ({
      // Group an event type onto one partition; ordering within a type is kept.
      key: event.eventType,
      // The id travels with the message and is the consumer's idempotency key.
      value: JSON.stringify({
        id: event.id,
        eventType: event.eventType,
        payload: event.payload,
        createdAt: event.createdAt,
      }),
    })),
  });

  await prisma.outbox.updateMany({
    where: { id: { in: pending.map((event) => event.id) } },
    data: { publishedAt: new Date() },
  });

  return pending.length;
}
