import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { jwtVerify } from '../utils/jwtVerify.js';

export async function protectRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Not authorized, please log in' });
      return;
    }

    // Trust the short-lived signed access token; no per-request DB lookup.
    // Account revocation happens at the refresh boundary via the session store.
    const { userId } = await jwtVerify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = { id: userId };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired, please log in' });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token, please log in' });
      return;
    } else {
      res.status(500).json({ message: 'Unknown error occurred!' });
      console.error('Error in protectRoute:', error);
    }
  }
}

export async function optionalProtectRoute(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next();
    }

    const { userId } = await jwtVerify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = { id: userId };

    next();
  } catch {
    // Invalid or expired token: continue as an anonymous request.
    next();
  }
}
