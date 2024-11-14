import express, { Router } from 'express';

import {
  createComment,
  getPostComments,
} from '../controllers/commentController.js';
import {
  createPost,
  deletePostById,
  getAllPosts,
  getFeedPosts,
  getPostById,
  likeUnlikePost,
} from '../controllers/postController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const postRouter: Router = express.Router();

// posts
postRouter.get('/feed', protectRoute, getFeedPosts);
postRouter.put('/:postId/like', protectRoute, likeUnlikePost);
postRouter
  .route('/:postId')
  .get(getPostById)
  .delete(protectRoute, deletePostById);
postRouter.route('/').get(getAllPosts).post(protectRoute, createPost);

// comments
postRouter
  .route('/:postId/comments')
  .get(protectRoute, getPostComments)
  .post(protectRoute, createComment);
