import request from 'supertest';

import { app } from '../app';

export const validUser = {
  username: 'alice',
  email: 'alice@example.com',
  name: 'Alice',
  password: 'password123',
};

// Creates a user through the real signup endpoint and returns the response.
export function signup(overrides: Partial<typeof validUser> = {}) {
  return request(app)
    .post('/api/v1/auth/signup')
    .send({ ...validUser, ...overrides });
}

// Pulls the refresh-token cookie string out of a response's Set-Cookie header.
export function getRefreshCookie(res: request.Response): string | undefined {
  const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
  return setCookie?.find((c) => c.startsWith('refreshToken='));
}
