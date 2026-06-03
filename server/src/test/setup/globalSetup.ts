import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

// The connection string is handed to the worker process through this file,
// because environment variables set here do not cross the process boundary.
const URL_FILE = join(tmpdir(), 'relates-test-db-url');

let container: StartedPostgreSqlContainer;

export async function setup() {
  container = await new PostgreSqlContainer('postgres:16').start();
  const url = container.getConnectionUri();

  // Apply the real migrations to the fresh database.
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });

  writeFileSync(URL_FILE, url);
}

export async function teardown() {
  rmSync(URL_FILE, { force: true });
  await container?.stop();
}
