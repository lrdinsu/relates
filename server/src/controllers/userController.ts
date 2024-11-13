import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseUserSchema, UserLoginSchema } from 'validation';

import argon2 from '@node-rs/argon2';

import { UserModel } from '../models/userModel.js';
import { checkPassword } from '../utils/checkPassword.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

export async function getAllUsers(_: Request, res: Response) {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      console.log('Error in getUsers:', error.message);
    } else {
      console.error('Error in getUsers:', error);
    }
  }
}

export async function getUserProfile(req: Request, res: Response) {
  const { query } = req.params;

  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await UserModel.findById({ _id: query })
        .select('-password')
        .select('-updatedAt');
    } else {
      user = await UserModel.findOne({ username: query })
        .select('-password')
        .select('-updatedAt');
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      console.log('Error in signupUser:', error.message);
    } else {
      console.error('Error in signupUser:', error);
    }
  }
}

export async function signupUser(req: Request, res: Response) {
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
    const hashedPassword = await argon2.hash(password);

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    generateTokenAndSetCookie(newUser._id.toString(), res);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (error) {
    // if (error instanceof Error) {
    //   res.status(500).json({ message: error.message });
    //   console.log('Error in signupUser:', error.message);
    // } else {
    //   console.error('Error in signupUser:', error);
    // }
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in signupUser:', error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    // Validate user data
    const input = UserLoginSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid user data' });
      return;
    }

    const { username, password } = input.data;
    const user = await UserModel.findOne({ username });

    // Check if password is correct
    const isPasswordCorrect = await checkPassword(user?.password, password);

    if (!user || !isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    generateTokenAndSetCookie(user._id.toString(), res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
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

export async function followUnfollowUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const targetUser = await UserModel.findById(id);
    const currentUser = req.user!;

    if (id === currentUser._id.toString()) {
      res.status(400).json({ message: 'Cannot follow/unfollow yourself' });
      return;
    }

    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // Unfollow user
      await UserModel.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });
      await UserModel.findByIdAndUpdate(id, {
        $pull: { followers: currentUser._id },
      });
      res.status(200).json({ message: 'Unfollowed user' });
      return;
    } else {
      // Follow user
      await UserModel.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });
      await UserModel.findByIdAndUpdate(id, {
        $push: { followers: currentUser._id },
      });
      res.status(200).json({ message: 'Followed user' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in followUnfollowUser:', error);
  }
}
