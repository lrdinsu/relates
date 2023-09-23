import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';

import { connectDB } from '@/db/connectDB.js';

import userRouter from './routes/userRouter.js';

dotenv.config();

void connectDB();
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cookieParser());

// Routes
app.use('/api/users', userRouter);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
