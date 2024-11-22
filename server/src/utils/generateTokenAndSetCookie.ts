import { Response } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export function generateTokenAndSetCookie(
  userId: number,
  res: Response,
  username: string,
  profilePic: string | null,
) {
  const token = jwt.sign(
    { userId, username, profilePic },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    },
  );

  res.cookie('refreshToken', token, {
    httpOnly: true, // client-side JS cannot access the cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict', // CSRF
  });

  return token;
}

export function generateAccessToken(userId: number) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
}
