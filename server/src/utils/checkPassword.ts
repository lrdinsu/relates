import argon2 from '@node-rs/argon2';

export async function checkPassword(
  userPassword: string | undefined,
  password: string,
) {
  if (!userPassword) return false;
  return await argon2.verify(userPassword, password);
}
