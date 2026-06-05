import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { getRefreshCookie, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

const refresh = (cookie: string) =>
  request(app).get('/api/v1/auth/refresh-token').set('Cookie', cookie);

describe('refresh-token sessions', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('rotates the refresh token on each refresh', async () => {
    const cookie1 = getRefreshCookie(await signup());

    const res = await refresh(cookie1!);
    expect(res.status).toBe(200);

    const cookie2 = getRefreshCookie(res);
    expect(cookie2).toBeDefined();
    expect(cookie2).not.toBe(cookie1);
  });

  it('accepts the just-retired token within the grace window', async () => {
    const cookie1 = getRefreshCookie(await signup());

    const r1 = await refresh(cookie1!); // rotates; cookie1 becomes the prev token
    expect(r1.status).toBe(200);

    // A racing request still holding the just-retired token succeeds (it's the
    // concurrent-refresh case, not theft).
    const racing = await refresh(cookie1!);
    expect(racing.status).toBe(200);
  });

  it('revokes the session when a long-retired token is replayed', async () => {
    const cookie1 = getRefreshCookie(await signup()); // token X

    const r1 = await refresh(cookie1!); // X -> X' (prev = X)
    expect(r1.status).toBe(200);
    const cookie2 = getRefreshCookie(r1)!;

    const r2 = await refresh(cookie2); // X' -> X'' (prev = X')
    expect(r2.status).toBe(200);

    // X is now older than the grace token (X'), so replaying it is theft.
    const reuse = await refresh(cookie1!);
    expect(reuse.status).toBe(401);

    // ...and the whole session is revoked: the latest token fails too.
    const cookie3 = getRefreshCookie(r2)!;
    const after = await refresh(cookie3);
    expect(after.status).toBe(401);
  });

  it('invalidates the session on logout', async () => {
    const cookie = getRefreshCookie(await signup());

    await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie!)
      .expect(204);

    const res = await refresh(cookie!);
    expect(res.status).toBe(401);
  });

  it('logs out of every device with logout-all', async () => {
    const signupRes = await signup();
    const { accessToken } = signupRes.body;
    const cookie = getRefreshCookie(signupRes);

    await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const res = await refresh(cookie!);
    expect(res.status).toBe(401);
  });
});
