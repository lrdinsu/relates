import express, { Router } from 'express';

import {
  followUnfollowUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
} from '../controllers/userController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const userRouter: Router = express.Router();

userRouter.post('/signup', signupUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);
userRouter.post('/follow/:id', protectRoute, followUnfollowUser);

userRouter.get('/profile/:query', getUserProfile);
userRouter.get('/', getAllUsers);
