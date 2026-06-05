import request from 'supertest';

import { app } from '../src/app';

export const validUser = {
  username: 'alice',
  email: 'alice@example.com',
  name: 'Alice',
  password: 'password123',
};

export const secondUser = {
  username: 'bob',
  email: 'bob@example.com',
  name: 'Bob',
  password: 'password123',
};

// Creates a user through the real signup endpoint and returns the response.
export function signup(overrides: Partial<typeof validUser> = {}) {
  return request(app)
    .post('/api/v1/auth/signup')
    .send({ ...validUser, ...overrides });
}

// Creates a post as the given access token holder.
export function createPost(
  token: string,
  body: { text?: string; images?: string[] },
) {
  return request(app)
    .post('/api/v1/posts')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

// Pulls the refresh-token cookie string out of a response's Set-Cookie header.
export function getRefreshCookie(res: request.Response): string | undefined {
  const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
  return setCookie?.find((c) => c.startsWith('refreshToken='));
}
