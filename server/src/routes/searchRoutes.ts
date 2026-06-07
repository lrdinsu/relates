import express, { Router } from 'express';

import { searchPosts, searchUsers } from '@/controllers/searchController';
import { optionalProtectRoute } from '@/middlewares/protectRoute';
import { searchRateLimit } from '@/middlewares/rateLimit';

export const searchRouter: Router = express.Router();

searchRouter.get('/posts', optionalProtectRoute, searchRateLimit, searchPosts);
searchRouter.get('/users', optionalProtectRoute, searchRateLimit, searchUsers);
