import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { BaseUserSchema } from 'validation';

import { UserModel } from '@/models/userModel.js';
import { generateTokenAndSetCookie } from '@/utils/generateTokenAndSetCookie.js';

export async function signup(req: Request, res: Response) {
  try {
    // Validate user data
    const input = BaseUserSchema.safeParse(req.body);

    if (!input.success) {
      res.status(400).json({ message: 'Invalid user data' });
      return;
    }

    const { name, email, username, password } = input.data;
    const user = await UserModel.findOne({ $or: [{ email }, { username }] }); // Check if user exists

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new UserModel({
      name,
      email,
      username,
      password: hashedPassword,
    });
    // Save user
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id.toString(), res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      console.log('Error in signupUser:', error.message);
    } else {
      console.error('Error in signupUser:', error);
    }
  }
}
