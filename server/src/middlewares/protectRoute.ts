import { NextFunction, Request, Response } from 'express';

import { UserModel } from '../models/userModel.js';
import { jwtVerify } from '../utils/jwtVerify.js';

export async function protectRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Get token from headers
    const token =
      typeof req.cookies.jwt === 'string' ? req.cookies.jwt : undefined;

    if (!token) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // verify token
    const decoded = await jwtVerify(token, process.env.JWT_SECRET!);

    const user = await UserModel.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Attach user to req object
    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in protectRoute:', error);
  }
}
