import { z } from 'zod';

import {
  BaseCommentSchema,
  BasePostSchema,
  LoginSchema,
  SignupSchema,
  UserSchema,
} from './schemas.js';

export type UserType = z.infer<typeof UserSchema>;
export type SignupType = z.infer<typeof SignupSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type PostType = z.infer<typeof BasePostSchema>;
export type CommentType = z.infer<typeof BaseCommentSchema>;
