import { Request, Response } from 'express';

export function logout(_req: Request, res: Response) {
  try {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      console.log('Error in logout:', error.message);
    } else {
      console.error('Error in logout:', error);
    }
  }
}
