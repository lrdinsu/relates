import express, { Router } from 'express';

import {
  followUnfollowUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
} from '../controllers/userController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const userRouter: Router = express.Router();

//auth
userRouter.post('/signup', signupUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);

// user
userRouter.put('/follow/:id', protectRoute, followUnfollowUser);
userRouter.put('/me/profile', protectRoute, updateUser);
userRouter.get('/:username', getUserProfile);

userRouter.get('/', getAllUsers);
