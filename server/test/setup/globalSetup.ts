import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

// Connection strings are handed to the worker process through these files,
// because environment variables set here do not cross the process boundary.
const URL_FILE = join(tmpdir(), 'relates-test-db-url');
const REDIS_URL_FILE = join(tmpdir(), 'relates-test-redis-url');

let container: StartedPostgreSqlContainer;
let redisContainer: StartedTestContainer;

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
}

export async function teardown() {
  rmSync(URL_FILE, { force: true });
  rmSync(REDIS_URL_FILE, { force: true });
  await container?.stop();
  await redisContainer?.stop();
}
