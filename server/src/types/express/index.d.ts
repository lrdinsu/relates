import { UserType } from 'validation';

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
