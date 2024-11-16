import { Request, Response } from 'express';
import { PostCreateSchema } from 'validation';

import { PostModel } from '../models/postModel.js';
import { stringToObjectId } from '../utils/stringToObjectId.js';

export async function getAllPosts(_: Request, res: Response): Promise<void> {
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
    const parentPostId = req.params.postId || null;

    // determine if this is a root-level post or a comment
    const isComment = Boolean(parentPostId);

    // If it's a comment, verify that the parent post exists and increment `commentsCount`
    if (isComment) {
      const parent = await PostModel.findByIdAndUpdate(parentPostId, {
        $inc: { commentsCount: 1 },
      });

      if (!parent) {
        res.status(404).json({ message: 'Parent post not found' });
        return;
      }
    }

    // create post
    const newPost = await PostModel.create({
      postedBy: currentUser._id,
      text,
      img,
      parentPost: isComment ? parentPostId : null,
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

    // Mark the post as deleted
    await PostModel.findByIdAndUpdate(postId, { isDeleted: true });
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

export async function getFeedPosts(req: Request, res: Response) {
  try {
    const currentUser = req.user!;
    const following = currentUser.following;
    const feedPosts = await PostModel.find({
      postedBy: { $in: [currentUser._id, ...following] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ message: 'Feed posts found!', feedPosts });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get feed posts:', error);
  }
}

export async function getPostComments(req: Request, res: Response) {
  try {
    const postId = stringToObjectId(req.params.postId);
    const comments = await PostModel.find({ parentPost: postId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get comments:', error);
  }
}
