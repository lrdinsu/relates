import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

import { connectDB } from '@/db/connectDB.js';

import { authRouter } from './routes/authRoutes.js';
import { postRouter } from './routes/postRoutes.js';
import { userRouter } from './routes/userRoutes.js';

void connectDB();
export const app: Express = express();

// parse JSON data in the request body
app.use(express.json());
// parse form data in the request body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/auth', authRouter);
