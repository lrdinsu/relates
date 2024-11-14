import { Request, Response } from 'express';
import { CommentCreateSchema } from 'validation';

import { CommentModel } from '../models/commentModel.js';
import { PostModel } from '../models/postModel.js';
import { stringToObjectId } from '../utils/stringToObjectId.js';

export async function getPostComments(req: Request, res: Response) {
  try {
    const postId = stringToObjectId(req.params.postId);
    const comments = await CommentModel.find({ postId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get comments:', error);
  }
}

export async function createComment(req: Request, res: Response) {
  try {
    const postId = stringToObjectId(req.params.postId);
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const input = CommentCreateSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid comment data' });
      return;
    }

    const currentUser = req.user!;
    const { text } = input.data;

    // create comment
    await CommentModel.create({
      postId,
      userId: currentUser._id,
      username: currentUser.username,
      profilePic: currentUser.profilePic,
      text,
    });

    // comment count increment
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    res.status(201).json({ message: 'Comment created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in create comment:', error);
  }
}
