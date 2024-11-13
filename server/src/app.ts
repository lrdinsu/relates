import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

import { connectDB } from '@/db/connectDB.js';

import { userRouter } from './routes/userRouter.js';

void connectDB();
export const app: Express = express();

// parse JSON data in the request body
app.use(express.json());
// parse form data in the request body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/users', userRouter);
