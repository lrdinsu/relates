import { NextFunction, Request, RequestHandler, Response } from 'express';

import { redis } from '../db/redis.js';

type RateLimitOptions = {
  name: string;
  max: number;
  windowMs: number;
  key?: (req: Request) => string;
};

const SECOND_MS = 1000;

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function defaultKey(req: Request): string {
  if (req.user?.id != null) {
    return `user:${req.user.id}`;
  }

  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

export function createRateLimit({
  name,
  max,
  windowMs,
  key = defaultKey,
}: RateLimitOptions): RequestHandler {
  const windowSeconds = Math.ceil(windowMs / SECOND_MS);

  return async (req: Request, res: Response, next: NextFunction) => {
    const redisKey = `rate-limit:${name}:${key(req)}`;

    try {
      const count = await redis.incr(redisKey);

      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      const ttl = await redis.ttl(redisKey);
      const resetSeconds = ttl > 0 ? ttl : windowSeconds;
      const remaining = Math.max(max - count, 0);

      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader(
        'X-RateLimit-Reset',
        String(Math.ceil(Date.now() / SECOND_MS) + resetSeconds),
      );

      if (count > max) {
        res.setHeader('Retry-After', String(resetSeconds));
        res.status(429).json({
          message: 'Too many requests, please try again later.',
        });
        return;
      }

      next();
    } catch (error) {
      console.error(`Rate limit skipped for ${name}:`, error);
      next();
    }
  };
}

export const generalApiRateLimit: RequestHandler = createRateLimit({
  name: 'general',
  max: envNumber('GENERAL_RATE_LIMIT_MAX', 300),
  windowMs: envNumber('GENERAL_RATE_LIMIT_WINDOW_MS', 15 * 60 * SECOND_MS),
});

export const authRateLimit: RequestHandler = createRateLimit({
  name: 'auth',
  max: envNumber('AUTH_RATE_LIMIT_MAX', 10),
  windowMs: envNumber('AUTH_RATE_LIMIT_WINDOW_MS', 10 * 60 * SECOND_MS),
});

export const writeActionRateLimit: RequestHandler = createRateLimit({
  name: 'write-action',
  max: envNumber('WRITE_RATE_LIMIT_MAX', 60),
  windowMs: envNumber('WRITE_RATE_LIMIT_WINDOW_MS', 60 * SECOND_MS),
});

export const searchRateLimit: RequestHandler = createRateLimit({
  name: 'search',
  max: envNumber('SEARCH_RATE_LIMIT_MAX', 30),
  windowMs: envNumber('SEARCH_RATE_LIMIT_WINDOW_MS', 60 * SECOND_MS),
});
