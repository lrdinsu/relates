import { z } from 'zod';

import { ResetPasswordSchema, SignupSchema } from './schemas.ts';

export type SignupType = z.infer<typeof SignupSchema>;
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
