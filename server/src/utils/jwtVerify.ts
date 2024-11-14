import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

type JwtPayload = {
  userId: ObjectId;
  iat: number;
  exp: number;
};

export async function jwtVerify(
  token: string,
  secret: string,
): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if ((err ?? !decoded) || typeof decoded !== 'object') {
        return reject(new Error(err?.message ?? 'Invalid token'));
      }
      resolve(decoded as JwtPayload);
    });
  });
}
