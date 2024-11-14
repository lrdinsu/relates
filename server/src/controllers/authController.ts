import { Request, Response } from 'express';
import { LoginSchema, UserCreateSchema } from 'validation';

import argon2 from '@node-rs/argon2';

import { UserModel } from '../models/userModel.js';
import { checkPassword } from '../utils/checkPassword.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

export async function signupUser(req: Request, res: Response) {
  try {
    // Validate user data
    const input = UserCreateSchema.safeParse(req.body);

    if (!input.success) {
      res.status(400).json({ message: 'Invalid user data' });
      return;
    }

    const { email, username, password } = input.data;
    const user = await UserModel.findOne({ $or: [{ email }, { username }] }); // Check if user exists

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create user
    const newUser = await UserModel.create({
      email,
      username,
      password: hashedPassword,
    });

    generateTokenAndSetCookie(newUser._id.toString(), res);

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
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
    const user = await UserModel.findOne({ email }).select('+password');

    // Check if password is correct
    const isPasswordCorrect = await checkPassword(user?.password, password);

    if (!user || !isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    generateTokenAndSetCookie(user._id.toString(), res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in loginUser:', error);
  }
}

export function logoutUser(_req: Request, res: Response) {
  try {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in logoutUser:', error);
  }
}
