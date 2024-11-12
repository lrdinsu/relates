import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

import { connectDB } from '@/db/connectDB.js';

import { userRouter } from './routes/userRouter.js';

void connectDB();
export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRouter);
