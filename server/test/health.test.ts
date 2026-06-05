import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app';

// The health endpoint is the load balancer's liveness probe. Its contract:
// answer 200 to anyone, without authentication and without depending on the
// database or Redis, so a slow dependency can't cause a healthy replica to be
// ejected from the pool.
describe('health endpoint', () => {
  it('returns 200 with an ok status and an instance id, unauthenticated', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.instance).toBe('string');
    expect(res.body.instance.length).toBeGreaterThan(0);
  });
});
