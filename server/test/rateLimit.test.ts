import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../src/app';
import { redis } from '../src/db/redis';
import { createRateLimit } from '../src/middlewares/rateLimit';

import { signup, validUser } from './helpers';
import { resetDatabase } from './setup/resetDb';

function testApp() {
  const limitedApp = express();

  limitedApp.use((req: Request, _res: Response, next: NextFunction) => {
    const userId = req.header('x-user-id');
    if (userId) {
      req.user = { id: Number(userId) };
    }
    next();
  });

  limitedApp.get(
    '/limited',
    createRateLimit({
      name: 'test',
      max: 2,
      windowMs: 60_000,
    }),
    (_req, res) => {
      res.status(200).json({ ok: true });
    },
  );

  return limitedApp;
}

describe('rate limits', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 429 after the request budget is used', async () => {
    const limitedApp = testApp();

    const first = await request(limitedApp).get('/limited');
    const second = await request(limitedApp).get('/limited');
    const third = await request(limitedApp).get('/limited');

    expect(first.status).toBe(200);
    expect(first.headers['x-ratelimit-limit']).toBe('2');
    expect(first.headers['x-ratelimit-remaining']).toBe('1');

    expect(second.status).toBe(200);
    expect(second.headers['x-ratelimit-remaining']).toBe('0');

    expect(third.status).toBe(429);
    expect(third.headers['retry-after']).toBeDefined();
    expect(third.body.message).toBe(
      'Too many requests, please try again later.',
    );
  });

  it('uses the authenticated user id when one is available', async () => {
    const limitedApp = testApp();

    const firstUserFirst = await request(limitedApp)
      .get('/limited')
      .set('x-user-id', '1');
    const firstUserSecond = await request(limitedApp)
      .get('/limited')
      .set('x-user-id', '1');
    const firstUserThird = await request(limitedApp)
      .get('/limited')
      .set('x-user-id', '1');
    const secondUserFirst = await request(limitedApp)
      .get('/limited')
      .set('x-user-id', '2');

    expect(firstUserFirst.status).toBe(200);
    expect(firstUserSecond.status).toBe(200);
    expect(firstUserThird.status).toBe(429);
    expect(secondUserFirst.status).toBe(200);
  });

  it('fails open when Redis is unavailable', async () => {
    vi.spyOn(redis, 'incr').mockRejectedValueOnce(
      new Error('redis unavailable'),
    );

    const res = await request(testApp()).get('/limited');

    expect(res.status).toBe(200);
  });

  it('applies the auth limit to the real auth routes', async () => {
    await signup();

    for (let i = 0; i < 9; i += 1) {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          ...validUser,
          username: `rate-limit-${i}`,
          email: `rate-limit-${i}@example.com`,
        });

      expect(res.status).toBe(201);
    }

    const limited = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        ...validUser,
        username: 'rate-limit-blocked',
        email: 'rate-limit-blocked@example.com',
      });

    expect(limited.status).toBe(429);
  });
});
