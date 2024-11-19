import express, { Router } from 'express';

import { createPost } from '../controllers/postControllers/createPostController.js';
import {
  getFeedPosts,
  getHotPosts,
  getPostById,
  getPostComments,
} from '../controllers/postControllers/getPostController.js';
import {
  deletePostById,
  likeUnlikePost,
  repostUnrepost,
  saveUnsavePost,
} from '../controllers/postControllers/updatePostController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const postRouter: Router = express.Router();

// posts
postRouter.get('/feed', protectRoute, getFeedPosts);
postRouter.get('/hot', getHotPosts);
postRouter.get('/:postId/comments', protectRoute, getPostComments);
postRouter.get('/:postId', getPostById);

postRouter.delete('/:postId', protectRoute, deletePostById);

postRouter.post('/:parentPostId', protectRoute, createPost); // for create comment under post
postRouter.post('/', protectRoute, createPost); // for create post

postRouter.put('/:postId/like', protectRoute, likeUnlikePost);
postRouter.put('/:postId/save', protectRoute, saveUnsavePost);
postRouter.put('/:postId/repost', protectRoute, repostUnrepost);
