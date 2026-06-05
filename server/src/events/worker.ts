import {
  startNotificationConsumer,
  stopNotificationConsumer,
} from './consumer.js';
import { disconnectProducer } from './kafka.js';
import { publishPendingEvents } from './publisher.js';

// Runs the two background pieces of the pipeline: the publisher on a poll timer
// (it pulls unpublished outbox rows and ships them) and the consumer (kafkajs
// pushes messages to it). Kept separate from the pure publish/consume functions
// so those stay easy to test without timers or a running broker.

const PUBLISH_INTERVAL_MS = Number(
  process.env.OUTBOX_PUBLISH_INTERVAL_MS ?? 1000,
);

let publishTimer: NodeJS.Timeout | null = null;
let stopped = false;

// Self-rescheduling timer (not setInterval) so a slow publish can't overlap the
// next run.
async function publishLoop(): Promise<void> {
  if (stopped) return;
  try {
    await publishPendingEvents();
  } catch (err) {
    console.error('Outbox publish failed:', err);
  } finally {
    if (!stopped) {
      publishTimer = setTimeout(() => void publishLoop(), PUBLISH_INTERVAL_MS);
    }
  }
}

export async function startEventWorker(): Promise<void> {
  stopped = false;
  await startNotificationConsumer();
  void publishLoop();
  console.log('Event worker started (outbox publisher + notifications consumer)');
}

export async function stopEventWorker(): Promise<void> {
  stopped = true;
  if (publishTimer) clearTimeout(publishTimer);
  await stopNotificationConsumer();
  await disconnectProducer();
}
