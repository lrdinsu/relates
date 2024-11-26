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
} from '../controllers/postControllers/updatePostController.js';
import { protectRoute } from '../middlewares/protectRoute.js';

export const postRouter: Router = express.Router();

// posts
postRouter.get('/hot', getHotPosts);
postRouter.get('/for-you', protectRoute, getForYouPosts);
postRouter.get('/following', protectRoute, getFollowingPosts);
postRouter.get('/liked', protectRoute, getLikedPosts);
postRouter.get('/saved', protectRoute, getSavedPosts);

postRouter.get('/:postId/comments', getPostComments);
postRouter.get('/:postId', getPostById);

postRouter.delete('/:postId', protectRoute, deletePostById);

postRouter.post('/:parentPostId', protectRoute, createPost); // for create comment under post
postRouter.post('/', protectRoute, createPost); // for create post

postRouter.put('/:postId/like', protectRoute, likeUnlikePost);
postRouter.put('/:postId/save', protectRoute, saveUnsavePost);
postRouter.put('/:postId/repost', protectRoute, repostUnrepost);

// get posts/comments by username
postRouter.get('/user/:username/posts', getPostsByUsername);
postRouter.get('/user/:username/comments', getCommentsByUsername);
