import { Request, Response } from 'express';

import { prisma } from '../../db';
import { PostQuerySchema } from '../../types/validation/schemas.js';

export async function getPostsByUsername(
  req: Request<{ username: string }>,
  res: Response,
) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const posts = await prisma.post.findMany({
      where: { 
        postedBy: { username }, 
        parentPostId: null,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePic: true,
          },
        },
        parentPost: {
          select: {
            postedBy: {
              select: {
                username: true,
              },
            },
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const postsWithIsLiked = posts.map((post) => ({
      ...post,
      isLiked: (post.likes?.length ?? 0) > 0,
      likes: undefined,
    }));

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts: postsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get user posts:', error);
  }
}

export async function getCommentsByUsername(
  req: Request<{ username: string }>,
  res: Response,
) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const comments = await prisma.post.findMany({
      where: { 
        postedBy: { username }, 
        parentPostId: { not: null },
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePic: true,
          },
        },
        parentPost: {
          select: {
            id: true,
            text: true,
            images: true,
            postedBy: {
              select: {
                id: true,
                username: true,
                profilePic: true,
              },
            },
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const commentsWithIsLiked = comments.map((comment) => ({
      ...comment,
      isLiked: (comment.likes?.length ?? 0) > 0,
      likes: undefined,
    }));

    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    res.status(200).json({ posts: commentsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get user comments:', error);
  }
}
