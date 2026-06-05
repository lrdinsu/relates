import { randomUUID } from 'node:crypto';

import { redis } from '../db/redis.js';

// Sessions expire on their own after the refresh-token lifetime.
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const sessionKey = (userId: number, sid: string) => `session:${userId}:${sid}`;

export function newId(): string {
  return randomUUID();
}

// Records the currently-valid refresh-token id (jti) for a session.
export async function storeSession(
  userId: number,
  sid: string,
  jti: string,
): Promise<void> {
  await redis.set(sessionKey(userId, sid), jti, 'EX', TTL_SECONDS);
}

export async function getSessionJti(
  userId: number,
  sid: string,
): Promise<string | null> {
  return redis.get(sessionKey(userId, sid));
}

export async function deleteSession(
  userId: number,
  sid: string,
): Promise<void> {
  await redis.del(sessionKey(userId, sid));
}

// Removes every session for a user (log out everywhere).
export async function deleteAllSessions(userId: number): Promise<void> {
  const pattern = sessionKey(userId, '*');
  const keys: string[] = [];
  let cursor = '0';
  do {
    const [next, batch] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
