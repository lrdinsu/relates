import express, { Router } from 'express';

import { createPost } from '../controllers/postControllers/createPostController.js';
import {
  getFollowingPosts,
  getForYouPosts,
  getHotPosts,
  getLikedPosts,
  getPostById,
  getPostComments,
  getSavedPosts,
} from '../controllers/postControllers/getPostController.js';
import {
  getCommentsByUsername,
  getPostsByUsername,
} from '../controllers/postControllers/getUserPostsController.js';
import {
  deletePostById,
  likeUnlikePost,
  repostUnrepost,
  saveUnsavePost,
  updatePost,
} from '../controllers/postControllers/updatePostController.js';
import { optionalProtectRoute, protectRoute } from '../middlewares/protectRoute.js';
import { writeActionRateLimit } from '../middlewares/rateLimit.js';

export const postRouter: Router = express.Router();

// posts
postRouter.get('/hot', optionalProtectRoute, getHotPosts);
postRouter.get('/for-you', protectRoute, getForYouPosts);
postRouter.get('/following', protectRoute, getFollowingPosts);
postRouter.get('/liked', protectRoute, getLikedPosts);
postRouter.get('/saved', protectRoute, getSavedPosts);

postRouter.get('/:postId/comments', optionalProtectRoute, getPostComments);
postRouter.get('/:postId', optionalProtectRoute, getPostById);

postRouter.delete(
  '/:postId',
  protectRoute,
  writeActionRateLimit,
  deletePostById,
);
postRouter.put('/:postId', protectRoute, writeActionRateLimit, updatePost);

postRouter.post(
  '/:parentPostId',
  protectRoute,
  writeActionRateLimit,
  createPost,
); // for create comment under post
postRouter.post('/', protectRoute, writeActionRateLimit, createPost); // for create post

postRouter.put(
  '/:postId/like',
  protectRoute,
  writeActionRateLimit,
  likeUnlikePost,
);
postRouter.put(
  '/:postId/save',
  protectRoute,
  writeActionRateLimit,
  saveUnsavePost,
);
postRouter.put(
  '/:postId/repost',
  protectRoute,
  writeActionRateLimit,
  repostUnrepost,
);

// get posts/comments by username
postRouter.get('/user/:username/posts', optionalProtectRoute, getPostsByUsername);
postRouter.get('/user/:username/comments', optionalProtectRoute, getCommentsByUsername);
