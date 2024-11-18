import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../db/index.js';
import { jwtVerify } from '../utils/jwtVerify.js';

export async function protectRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Not authorized, please log in',
      });
      return;
    }

    // verify token
    const { userId } = await jwtVerify(token, process.env.ACCESS_TOKEN_SECRET!);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Attach user to req object
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired, please log in',
      });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token, please log in',
      });
      return;
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Unknown error occurred!',
      });
      console.error('Error in protectRoute:', error);
    }
  }
}
