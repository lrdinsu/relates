import { z } from 'zod';

import { BaseCommentSchema, BasePostSchema, UserSchema } from './schemas.js';

export type UserType = z.infer<typeof UserSchema>;
export type PostType = z.infer<typeof BasePostSchema>;
export type CommentType = z.infer<typeof BaseCommentSchema>;
