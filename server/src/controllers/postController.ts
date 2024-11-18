import { Request, Response } from 'express';
import { PostCreateSchema, PostType } from 'validation';

import { selectFeedPosts } from '@prisma/client/sql';

import { prisma } from '../db/index.js';

export async function getFeedPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const { cursor, limit = 10 } = req.query;

    // Use raw SQL query with cursor-based pagination
    const posts = (await prisma.$queryRawTyped(
      selectFeedPosts(
        currentUserId,
        cursor ? Number(cursor) : 0,
        Number(limit),
      ),
    )) as PostType[];

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get feed posts:', error);
  }
}

export async function getHotPosts(_: Request, res: Response) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { likesCount: 'desc', commentsCount: 'desc' },
    });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get hot posts:', error);
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
    const { text, images } = input.data;
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
      images,
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
    const postId = Number.parseInt(req.params.postId);
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
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
    const postId = Number.parseInt(req.params.postId);
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // check if user is authorized to delete post
    const currentUser = req.user!;
    if (!(post.postedById === currentUser.id)) {
      res.status(403).json({ message: 'Unauthorized to delete post' });
      return;
    }

    // Mark the post as deleted
    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
    res.status(204).send();
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
