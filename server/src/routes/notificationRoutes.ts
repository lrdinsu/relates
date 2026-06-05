import express, { Router } from 'express';

import { getNotifications } from '../controllers/notificationController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const notificationRouter: Router = express.Router();

notificationRouter.get('/', protectRoute, getNotifications);
