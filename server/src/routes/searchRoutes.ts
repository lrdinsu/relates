import express, { Router } from 'express';
import { searchPosts, searchUsers } from '../controllers/searchController.js';
import { optionalProtectRoute } from '../middlewares/protectRoute.js';
import { searchRateLimit } from '../middlewares/rateLimit.js';

export const searchRouter: Router = express.Router();

searchRouter.get('/posts', optionalProtectRoute, searchRateLimit, searchPosts);
searchRouter.get('/users', optionalProtectRoute, searchRateLimit, searchUsers);
