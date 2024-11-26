import { Request, Response } from 'express';

import { prisma } from '../../db/index.js';
import { PostQuerySchema } from '../../types/validation/schemas.js';

export async function getPostsByUsername(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;
    const { username } = req.params;

    const posts = await prisma.post.findMany({
      where: { postedBy: { username }, parentPostId: null },
      orderBy: { createdAt: 'desc' },
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
    console.error('Error in get user posts:', error);
  }
}

export async function getCommentsByUsername(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;
    const { username } = req.params;

    const comments = await prisma.post.findMany({
      where: { postedBy: { username }, parentPostId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
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
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    res.status(200).json({ comments, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get user comments:', error);
  }
}
