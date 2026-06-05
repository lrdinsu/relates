import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { newId, storeSession } from './session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const refreshCookieOptions = {
  httpOnly: true, // client-side JS cannot access the cookie
  secure: process.env.NODE_ENV === 'production', // HTTPS-only outside local dev
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  sameSite: 'strict' as const, // CSRF
};

// Signs a refresh token bound to a session (sid) and a specific token id (jti).
export function signRefreshToken(
  userId: number,
  username: string,
  profilePic: string | null,
  sid: string,
  jti: string,
): string {
  return jwt.sign(
    { userId, username, profilePic, sid, jti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' },
  );
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, refreshCookieOptions);
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  });
}

// Starts a new session: stores it in Redis and sets the refresh cookie.
export async function generateTokenAndSetCookie(
  userId: number,
  res: Response,
  username: string,
  profilePic: string | null,
): Promise<string> {
  const sid = newId();
  const jti = newId();

  await storeSession(userId, sid, jti);

  const token = signRefreshToken(userId, username, profilePic, sid, jti);
  setRefreshCookie(res, token);

  return token;
}

export function generateAccessToken(userId: number): string {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
}
