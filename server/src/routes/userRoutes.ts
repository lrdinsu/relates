import express, { Router } from 'express';

import {
  followUnfollowUser,
  getMyData,
  getUserProfile,
  updateUser,
} from '../controllers/userController.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { writeActionRateLimit } from '../middlewares/rateLimit.js';

export const userRouter: Router = express.Router();

// user
userRouter.put(
  '/follow/:id',
  protectRoute,
  writeActionRateLimit,
  followUnfollowUser,
);
userRouter.put(
  '/me/profile',
  protectRoute,
  writeActionRateLimit,
  updateUser,
);
userRouter.get('/me', protectRoute, getMyData);
userRouter.get('/:username', getUserProfile);
