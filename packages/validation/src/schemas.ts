import mongoose from 'mongoose';
import { z } from 'zod';

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId, {
  message: 'Invalid MongoDB ObjectId',
});

const HasId = z.object({
  _id: ObjectIdSchema,
});

// UserSchema
export const BaseUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  profilePic: z.string().nullable().default(null),
  followers: z.array(ObjectIdSchema).default([]),
  following: z.array(ObjectIdSchema).default([]),
  biography: z.string().default(''),
  active: z.boolean().default(true),
});

export const UserSchema = BaseUserSchema.merge(HasId);

export const UserCreateSchema = BaseUserSchema.pick({
  username: true,
  email: true,
  password: true,
});

export const UserUpdateSchema = BaseUserSchema.partial().omit({
  password: true,
  followers: true,
  following: true,
});

export const LoginSchema = BaseUserSchema.pick({
  email: true,
  password: true,
});

// PostSchema
export const BasePostSchema = z.object({
  postedBy: ObjectIdSchema,
  text: z.string().max(500).optional(),
  img: z.string().optional(),
  likes: z.array(ObjectIdSchema).default([]),
  commentsCount: z.number().default(0),
});

export const PostCreateSchema = BasePostSchema.omit({
  postedBy: true,
  likes: true,
  commentsCount: true,
}).refine((data) => Boolean(data.text) || Boolean(data.img), {
  message: "At least 'text' or 'img' must be provided.",
  path: ['text', 'img'],
});

export const PostUpdateSchema = BasePostSchema.partial().refine(
  (data) => Boolean(data.text) || Boolean(data.img),
  {
    message: "At least 'text' or 'img' must be provided.",
    path: ['text', 'img'],
  },
);

// CommentSchema
export const BaseCommentSchema = z.object({
  postId: ObjectIdSchema,
  userId: ObjectIdSchema,
  username: z.string(),
  profilePic: z.string().nullable().default(null),
  text: z.string().min(2).max(280),
  likes: z.array(ObjectIdSchema).default([]),
  parentCommentId: ObjectIdSchema.nullable().optional(),
  repliesCount: z.number().default(0),
});

export const CommentCreateSchema = BaseCommentSchema.pick({
  text: true,
});

export const CommentUpdateSchema = BaseCommentSchema.pick({
  text: true,
});
