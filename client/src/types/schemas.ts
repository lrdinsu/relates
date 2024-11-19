// AuthSchema
import { UserCreateSchema, UserSchema } from 'validation';
import { z } from 'zod';

export const SignupSchema = UserCreateSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.confirmPassword === data.password, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ResetPasswordSchema = UserSchema.pick({
  email: true,
});
