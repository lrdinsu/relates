import express, { Router } from 'express';

import {
  createPost,
  deletePostById,
  getFeedPosts,
  getHotPosts,
  getPostById,
  getPostComments,
  likeUnlikePost,
} from '../controllers/postController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const postRouter: Router = express.Router();

// posts
postRouter.get('/feed', protectRoute, getFeedPosts);
postRouter.get('/hot', getHotPosts);

postRouter.put('/:postId/like', protectRoute, likeUnlikePost);
postRouter
  .route('/:postId')
  .get(getPostById)
  .post(protectRoute, createPost) // for create comment under post
  .delete(protectRoute, deletePostById);
// get comments of a post
postRouter.get('/:postId/comments', protectRoute, getPostComments);
postRouter.route('/').post(protectRoute, createPost); // for create post
