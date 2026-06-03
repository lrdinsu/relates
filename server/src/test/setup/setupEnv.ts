import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Runs in the worker before any test module is imported, so the database
// client picks up the test container's connection string.
const URL_FILE = join(tmpdir(), 'relates-test-db-url');

process.env.DATABASE_URL = readFileSync(URL_FILE, 'utf8').trim();
