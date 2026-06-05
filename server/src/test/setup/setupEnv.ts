import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Runs in the worker before any test module is imported, so the database
// client picks up the test container's connection string.
const URL_FILE = join(tmpdir(), 'relates-test-db-url');
const REDIS_URL_FILE = join(tmpdir(), 'relates-test-redis-url');

process.env.DATABASE_URL = readFileSync(URL_FILE, 'utf8').trim();
process.env.REDIS_URL = readFileSync(REDIS_URL_FILE, 'utf8').trim();

// Test-only signing secrets, so the auth flow can issue and verify tokens.
process.env.ACCESS_TOKEN_SECRET ||= 'test-access-token-secret';
process.env.REFRESH_TOKEN_SECRET ||= 'test-refresh-token-secret';
