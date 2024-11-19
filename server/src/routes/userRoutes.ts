import express, { Router } from 'express';

import {
  followUnfollowUser,
  getUserProfile,
  updateUser,
} from '../controllers/userController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const userRouter: Router = express.Router();

// user
userRouter.put('/follow/:id', protectRoute, followUnfollowUser);
userRouter.put('/me/profile', protectRoute, updateUser);
userRouter.get('/:username', getUserProfile);
