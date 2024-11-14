import { z } from 'zod';

import { PostSchema, ReplySchema, UserSchema } from './schemas.js';

export type UserType = z.infer<typeof UserSchema>;
export type PostType = z.infer<typeof PostSchema>;
export type ReplyType = z.infer<typeof ReplySchema>;
