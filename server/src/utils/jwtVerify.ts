import jwt from 'jsonwebtoken';

type JwtPayload = {
  userId: number;
  username: string;
  profilePic: string | null;
  sid?: string; // session id (refresh tokens only)
  jti?: string; // token id within the session (refresh tokens only)
  iat: number;
  exp: number;
};

export async function jwtVerify(
  token: string,
  secret: string,
): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      if (!decoded || typeof decoded !== 'object') {
        return reject(new Error('Invalid token'));
      }
      resolve(decoded as JwtPayload);
    });
  });
}
