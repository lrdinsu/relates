import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginSchema, UserCreateSchema } from 'validation';

import argon2 from '@node-rs/argon2';

import { prisma } from '../db';
import { checkPassword } from '../utils/checkPassword.js';
import {
  clearRefreshCookie,
  generateAccessToken,
  generateTokenAndSetCookie,
  setRefreshCookie,
  signRefreshToken,
} from '../utils/generateTokenAndSetCookie.js';
import { jwtVerify } from '../utils/jwtVerify.js';
import {
  deleteAllSessions,
  deleteSession,
  getPreviousJti,
  getSessionJti,
  newId,
  storePreviousJti,
  storeSession,
} from '../utils/session.js';

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

    await generateTokenAndSetCookie(
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
    await generateTokenAndSetCookie(user.id, res, user.username, user.profilePic);
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

export async function logoutUser(req: Request, res: Response) {
  try {
    const token =
      typeof req.cookies.refreshToken === 'string'
        ? req.cookies.refreshToken
        : undefined;

    if (token) {
      try {
        const { userId, sid } = await jwtVerify(
          token,
          process.env.REFRESH_TOKEN_SECRET!,
        );
        if (sid) {
          await deleteSession(userId, sid);
        }
      } catch {
        // An invalid/expired token just means there's nothing to revoke.
      }
    }

    clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in logoutUser:', error);
  }
}

// Logs the user out of every device by deleting all their sessions.
export async function logoutAllSessions(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await deleteAllSessions(userId);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in logoutAllSessions:', error);
  }
}

// Rotates the refresh token and issues a new access token. Detects reuse of a
// retired token (token theft) and revokes the session.
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const token =
      typeof req.cookies.refreshToken === 'string'
        ? req.cookies.refreshToken
        : undefined;

    if (!token) {
      res.status(401).json({ message: 'Not authorized, please log in' });
      return;
    }

    const { userId, sid, jti } = await jwtVerify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    );

    // Tokens issued before sessions existed can't be validated against the store.
    if (!sid || !jti) {
      res.status(401).json({ message: 'Please log in again' });
      return;
    }

    let storedJti: string | null;
    try {
      storedJti = await getSessionJti(userId, sid);
    } catch {
      // Fail closed: if the session store is unreachable, reject the refresh.
      res.status(401).json({ message: 'Please log in again' });
      return;
    }

    if (!storedJti) {
      // Session expired, logged out, or already revoked.
      res.status(401).json({ message: 'Session expired, please log in' });
      return;
    }

    const isCurrent = storedJti === jti;

    if (!isCurrent) {
      // Not the current token. Accept the just-retired token within the grace
      // window (concurrent refreshes from multiple tabs); anything older is a
      // replay of a retired token, so treat it as theft and revoke.
      const prevJti = await getPreviousJti(userId, sid);
      if (prevJti !== jti) {
        await deleteSession(userId, sid);
        res.status(401).json({ message: 'Session revoked, please log in' });
        return;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, profilePic: true },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found, please log in' });
      return;
    }

    // On the current token, rotate (new id, remember the retired one for the
    // grace window). On a grace hit, re-issue the current token without
    // rotating, so the racing request lands on the same token.
    let cookieJti = storedJti;
    if (isCurrent) {
      cookieJti = newId();
      await storeSession(userId, sid, cookieJti);
      await storePreviousJti(userId, sid, jti);
    }

    setRefreshCookie(
      res,
      signRefreshToken(userId, user.username, user.profilePic, sid, cookieJti),
    );

    res.status(200).json({
      accessToken: generateAccessToken(userId),
      userId: user.id,
      username: user.username,
      profilePic: user.profilePic,
    });
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
