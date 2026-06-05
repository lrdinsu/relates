import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import {
  RedpandaContainer,
  StartedRedpandaContainer,
} from '@testcontainers/redpanda';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

// Connection strings are handed to the worker process through these files,
// because environment variables set here do not cross the process boundary.
const URL_FILE = join(tmpdir(), 'relates-test-db-url');
const REDIS_URL_FILE = join(tmpdir(), 'relates-test-redis-url');
const KAFKA_FILE = join(tmpdir(), 'relates-test-kafka-brokers');

let container: StartedPostgreSqlContainer;
let redisContainer: StartedTestContainer;
let redpandaContainer: StartedRedpandaContainer;

export async function setup() {
  container = await new PostgreSqlContainer('postgres:16').start();
  const url = container.getConnectionUri();

  // Apply the real migrations to the fresh database.
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });

  writeFileSync(URL_FILE, url);

  redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();
  const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
  writeFileSync(REDIS_URL_FILE, redisUrl);

  // Redpanda (Kafka-API-compatible) for the event-pipeline tests.
  redpandaContainer = await new RedpandaContainer(
    'redpandadata/redpanda:v24.2.7',
  ).start();
  writeFileSync(KAFKA_FILE, redpandaContainer.getBootstrapServers());
}

export async function teardown() {
  rmSync(URL_FILE, { force: true });
  rmSync(REDIS_URL_FILE, { force: true });
  rmSync(KAFKA_FILE, { force: true });
  await container?.stop();
  await redisContainer?.stop();
  await redpandaContainer?.stop();
}
