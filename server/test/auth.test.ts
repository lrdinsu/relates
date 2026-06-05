import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { getRefreshCookie, signup, validUser } from './helpers';
import { resetDatabase } from './setup/resetDb';

describe('auth flow', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('signs up a new user and returns an access token and refresh cookie', async () => {
    const res = await signup();

    expect(res.status).toBe(201);
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.username).toBe(validUser.username);
    expect(getRefreshCookie(res)).toBeDefined();
  });

  it('rejects signing up the same user twice', async () => {
    await signup();
    const res = await signup();

    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    await signup();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('rejects login with a wrong password', async () => {
    await signup();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });

    expect(res.status).toBe(400);
  });

  it('allows a protected route with a valid access token', async () => {
    const { body } = await signup();

    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(validUser.username);
  });

  it('rejects a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 for an expired token, and a refreshed token then works', async () => {
    const signupRes = await signup();
    const cookie = getRefreshCookie(signupRes);
    const { userId } = signupRes.body;

    // An access token already past its expiry, signed with the app's secret.
    const expiredToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '-1s' },
    );
    const expiredRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(expiredRes.status).toBe(401);

    // The refresh cookie mints a new access token.
    const refreshRes = await request(app)
      .get('/api/v1/auth/refresh-token')
      .set('Cookie', cookie!);
    expect(refreshRes.status).toBe(200);
    expect(typeof refreshRes.body.accessToken).toBe('string');

    // The fresh token is accepted on the protected route.
    const retryRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`);
    expect(retryRes.status).toBe(200);
  });

  it('rejects a refresh with no cookie', async () => {
    const res = await request(app).get('/api/v1/auth/refresh-token');

    expect(res.status).toBe(401);
  });
});
