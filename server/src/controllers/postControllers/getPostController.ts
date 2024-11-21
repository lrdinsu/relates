import { Request, Response } from 'express';

import { prisma } from '../../db/index.js';
import {
  PostParamsSchema,
  PostQuerySchema,
} from '../../types/validation/schemas.js';

export async function getHotPosts(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const posts = await prisma.post.findMany({
      orderBy: [
        { likesCount: 'desc' },
        { commentsCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get hot posts:', error);
  }
}

export async function getForYouPosts(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const posts = await prisma.post.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { commentsCount: 'desc' },
        { likesCount: 'desc' },
      ],
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get for you posts:', error);
  }
}

export async function getFollowingPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    // Get followed users (and include the current user)
    const followedUsers = await prisma.userFollows.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followedIds = followedUsers.map((follow) => follow.followingId);
    followedIds.push(currentUserId);

    // Fetch posts with pagination
    const posts = await prisma.post.findMany({
      where: {
        postedById: { in: followedIds },
      },
      orderBy: [
        { likesCount: 'desc' },
        { commentsCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get following posts:', error);
  }
}

export async function getLikedPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const likedPosts = await prisma.like.findMany({
      where: { userId: currentUserId },
      select: { postId: true },
    });

    const likedPostIds = likedPosts.map((like) => like.postId);

    const posts = await prisma.post.findMany({
      where: { id: { in: likedPostIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get liked posts:', error);
  }
}

export async function getSavedPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const savedPosts = await prisma.save.findMany({
      where: { userId: currentUserId },
      select: { postId: true },
    });

    const savedPostIds = savedPosts.map((save) => save.postId);

    const posts = await prisma.post.findMany({
      where: { id: { in: savedPostIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get saved posts:', error);
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }
    const { cursor, limit } = input.data;

    const params = PostParamsSchema.safeParse(req.params.postId);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;
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

    // get children posts for this post
    const comments = await prisma.post.findMany({
      where: { parentPostId: postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    res.status(200).json({ post, comments, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get post by id:', error);
  }
}

export async function getPostComments(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }
    const { cursor, limit } = input.data;

    const params = PostParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;

    const comments = await prisma.post.findMany({
      where: { parentPostId: postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;
    res.status(200).json({ comments, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get comments:', error);
  }
}
