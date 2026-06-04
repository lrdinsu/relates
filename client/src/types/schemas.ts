// AuthSchema
import { UserCreateSchema, UserSchema } from 'validation';
import { z } from 'zod';

const SignupBaseSchema = UserCreateSchema.extend({
  confirmPassword: z.string(),
});

export const SignupSchema = SignupBaseSchema.refine(
  (data: z.infer<typeof SignupBaseSchema>) =>
    data.confirmPassword === data.password,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
);

export const ResetPasswordSchema = UserSchema.pick({
  email: true,
});
