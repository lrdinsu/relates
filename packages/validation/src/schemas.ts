import mongoose from 'mongoose';
import { z } from 'zod';

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId, {
  message: 'Invalid MongoDB ObjectId',
});

const HasId = z.object({
  _id: ObjectIdSchema,
});

export const BaseUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6),
  profilePic: z.string().nullable().default(null),
  followers: z.array(ObjectIdSchema).default([]),
  following: z.array(ObjectIdSchema).default([]),
  biography: z.string().default(''),
  active: z.boolean().default(true),
});

export const UserLoginSchema = BaseUserSchema.pick({
  username: true,
  password: true,
});

export const UserSchema = BaseUserSchema.merge(HasId);

export const UserSignupSchema = BaseUserSchema;

export const UserUpdateSchema = BaseUserSchema.partial().omit({
  password: true,
  followers: true,
  following: true,
});
