import { Redis } from 'ioredis';

// Single shared client. ioredis reconnects in the background, and commands
// fail after a few retries (rather than hanging) so the auth layer can decide
// what to do when Redis is unavailable.
export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});
