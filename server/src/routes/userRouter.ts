import express, { Router } from 'express';

import { login } from '@/controllers/userController/login.js';
import { logout } from '@/controllers/userController/logout.js';
import { signup } from '@/controllers/userController/signup.js';

export const userRouter: Router = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
