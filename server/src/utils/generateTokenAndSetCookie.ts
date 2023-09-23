import { Response } from 'express';
import jwt from 'jsonwebtoken';

export function generateTokenAndSetCookie(userId: string, res: Response) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // client-side JS cannot access the cookie
    maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
    sameSite: 'strict', // CSRF
  });

  return token;
}
