import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginSchema, UserCreateSchema } from 'validation';

import argon2 from '@node-rs/argon2';

import { prisma } from '../db/index.js';
import { checkPassword } from '../utils/checkPassword.js';
import {
  generateAccessToken,
  generateTokenAndSetCookie,
} from '../utils/generateTokenAndSetCookie.js';
import { jwtVerify } from '../utils/jwtVerify.js';

export async function signupUser(req: Request, res: Response) {
  try {
    // Validate user data
    const input = UserCreateSchema.safeParse(req.body);

    if (!input.success) {
      res.status(400).json({ message: 'Invalid user data' });
      return;
    }

    // Check if user exists
    const { email, username, name, password } = input.data;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
      },
    });

    generateTokenAndSetCookie(
      newUser.id,
      res,
      newUser.username,
      newUser.profilePic,
    );

    res.status(201).json({
      accessToken: generateAccessToken(newUser.id),
      userId: newUser.id,
      username: newUser.username,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in signupUser:', error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    // Validate user data
    const input = LoginSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid user data' });
      return;
    }

    const { email, password } = input.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, username: true, profilePic: true },
    });

    // Check if password is correct
    const isPasswordCorrect = await checkPassword(user?.password, password);

    if (!user || !isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // generate token and set cookie
    generateTokenAndSetCookie(user.id, res, user.username, user.profilePic);
    res.status(200).json({
      accessToken: generateAccessToken(user.id),
      userId: user.id,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in loginUser:', error);
  }
}

export function logoutUser(_req: Request, res: Response) {
  try {
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in logoutUser:', error);
  }
}

// Token refresh function
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    // Get refresh token from cookies
    const token =
      typeof req.cookies.refreshToken === 'string'
        ? req.cookies.refreshToken
        : undefined;

    if (!token) {
      res.status(401).json({ message: 'Not authorized, please log in' });
      return;
    }

    const { userId, username, profilePic } = await jwtVerify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    );

    const accessToken = generateAccessToken(userId);
    res.status(200).json({ accessToken, userId, username, profilePic });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired, please log in' });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token, please log in' });
      return;
    } else {
      res.status(500).json({ message: 'Unknown error occurred!' });
      console.error('Error in refreshAccessToken:', error);
    }
  }
}
