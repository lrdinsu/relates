import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { resetDatabase } from './setup/resetDb';

describe('smoke', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('serves the hot feed against a real database', async () => {
    const res = await request(app).get('/api/v1/posts/hot');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts).toHaveLength(0);
  });
});
