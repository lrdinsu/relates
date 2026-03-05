import express, { Router } from 'express';
import { searchPosts, searchUsers } from '../controllers/searchController.js';
import { optionalProtectRoute } from '../middlewares/protectRoute.js';

export const searchRouter: Router = express.Router();

searchRouter.get('/posts', optionalProtectRoute, searchPosts);
searchRouter.get('/users', optionalProtectRoute, searchUsers);
