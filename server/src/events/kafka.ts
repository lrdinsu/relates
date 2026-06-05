import { Kafka, Producer, logLevel } from 'kafkajs';

// One Kafka client for the process. Use the Kafka protocol; the broker is
// Redpanda (Kafka-API-compatible, no JVM) locally. Brokers come from env so the
// same code points at a Testcontainers broker in tests and a compose broker in
// the demo stack.
export const TOPIC = 'relates.events';

export const kafka = new Kafka({
  clientId: 'relates',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  // We log lifecycle ourselves; silence kafkajs's own chatter.
  logLevel: logLevel.NOTHING,
});

export const producer: Producer = kafka.producer();

let producerConnected = false;

// Connect lazily and only once, so callers (the publisher loop, tests) don't
// each have to manage connection state.
export async function connectProducer(): Promise<void> {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
  }
}

export async function disconnectProducer(): Promise<void> {
  if (producerConnected) {
    await producer.disconnect();
    producerConnected = false;
  }
}
