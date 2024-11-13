import mongoose from 'mongoose';
import { z } from 'zod';

const HasId = z.object({
  _id: z.custom<mongoose.Types.ObjectId>(
    (value) => value instanceof mongoose.Types.ObjectId,
    {
      message: 'Invalid MongoDB ObjectId',
    },
  ),
});

export const BaseUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6),
  profilePic: z.string().default(''),
  followers: z.array(z.string()).default([]),
  following: z.array(z.string()).default([]),
  biography: z.string().default(''),
});

export const UserLoginSchema = BaseUserSchema.pick({
  username: true,
  password: true,
});

export const UserSchema = BaseUserSchema.merge(HasId);
