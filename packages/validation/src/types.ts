import { z } from 'zod';

import { LoginSchema, PostSchema, UserSchema } from './schemas.js';

type UserWithPasswordType = z.infer<typeof UserSchema>;
export type UserType = Omit<UserWithPasswordType, 'password'>;

export type PostType = z.infer<typeof PostSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
