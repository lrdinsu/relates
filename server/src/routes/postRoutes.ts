import express, { Router } from 'express';

import {
  createPost,
  deletePostById,
  getPostById,
  getPosts,
  likeUnlikePost,
} from '../controllers/postController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const postRouter: Router = express.Router();

// routes
postRouter.post('/', protectRoute, createPost);
postRouter.get('/:postId', getPostById);
postRouter.delete('/:postId', protectRoute, deletePostById);
postRouter.put('/:postId/like', protectRoute, likeUnlikePost);

postRouter.get('/', getPosts);
