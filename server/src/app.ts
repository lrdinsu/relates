import os from 'node:os';

import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

import { authRouter } from './routes/authRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { postRouter } from './routes/postRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { searchRouter } from './routes/searchRoutes.js';

export const app: Express = express();

// Liveness probe for the load balancer's health checks. Deliberately does NOT
// touch Postgres or Redis: it answers "is this process up and accepting HTTP?"
// so a slow dependency can't make Caddy eject an otherwise-healthy replica.
// `instance` is the container hostname, which makes round-robin visible in a demo.
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', instance: os.hostname() });
});

// parse JSON data in the request body
app.use(express.json());
// parse form data in the request body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/notifications', notificationRouter);
