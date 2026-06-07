import express, { Router } from 'express';

import {
  loginUser,
  logoutAllSessions,
  logoutUser,
  refreshAccessToken,
  signupUser,
} from '../controllers/authController.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import { authRateLimit } from '../middlewares/rateLimit.js';

export const authRouter: Router = express.Router();

//auth
authRouter.post('/signup', authRateLimit, signupUser);
authRouter.post('/login', authRateLimit, loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/logout-all', protectRoute, logoutAllSessions);
authRouter.get('/refresh-token', authRateLimit, refreshAccessToken);
