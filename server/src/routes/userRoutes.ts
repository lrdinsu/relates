import express, { Router } from 'express';

import {
  followUnfollowUser,
  getMyData,
  getUserProfile,
  updateUser,
} from '@/controllers/userController';
import { protectRoute } from '@/middlewares/protectRoute';
import { writeActionRateLimit } from '@/middlewares/rateLimit';

export const userRouter: Router = express.Router();

// user
userRouter.put(
  '/follow/:id',
  protectRoute,
  writeActionRateLimit,
  followUnfollowUser,
);
userRouter.put('/me/profile', protectRoute, writeActionRateLimit, updateUser);
userRouter.get('/me', protectRoute, getMyData);
userRouter.get('/:username', getUserProfile);
