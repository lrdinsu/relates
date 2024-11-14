import { Request, Response } from 'express';
import { PostCreateSchema } from 'validation';

import { PostModel } from '../models/postModel.js';
import { stringToObjectId } from '../utils/stringToObjectId.js';

export async function getPosts(_: Request, res: Response): Promise<void> {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get posts:', error);
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const input = PostCreateSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid post data' });
      return;
    }

    const currentUser = req.user!;
    const { text, img } = input.data;

    // create post
    const newPost = await PostModel.create({
      postedBy: currentUser._id,
      text,
      img,
    });

    res
      .status(201)
      .json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in create post:', error);
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const postId = stringToObjectId(req.params.postId);
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({ message: 'Post found', post });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get post by id:', error);
  }
}

export async function deletePostById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const postId = stringToObjectId(req.params.postId);
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // check if user is authorized to delete post
    const currentUser = req.user!;
    if (!post.postedBy.equals(currentUser._id)) {
      res.status(403).json({ message: 'Unauthorized to delete post' });
      return;
    }

    await PostModel.deleteOne({ _id: postId });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in delete post by id:', error);
  }
}

export async function likeUnlikePost(req: Request, res: Response) {
  try {
    const postId = stringToObjectId(req.params.postId);
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const currentUser = req.user!;
    const currentUserId = currentUser._id;
    const isLiked = post.likes.includes(currentUserId);

    if (isLiked) {
      // Unlike post
      await PostModel.findByIdAndUpdate(postId, {
        $pull: { likes: currentUserId },
      });
      res.status(200).json({ message: 'Unliked post' });
    } else {
      // Like post
      await PostModel.findByIdAndUpdate(postId, {
        $push: { likes: currentUserId },
      });
      res.status(200).json({ message: 'Liked post' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in like/unlike post:', error);
  }
}
