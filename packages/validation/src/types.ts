import { z } from 'zod';

import { LoginSchema, PostSchema, UserSchema } from './schemas.js';

export type UserType = z.infer<typeof UserSchema>;
export type PostType = z.infer<typeof PostSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
