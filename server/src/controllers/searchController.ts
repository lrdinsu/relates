import { Request, Response } from 'express';
import { prisma } from '../db';
import { SearchQuerySchema } from '../types/validation/schemas.js';

export async function searchPosts(req: Request, res: Response) {
  try {
    const input = SearchQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid search query' });
      return;
    }

    const { q, cursor, limit } = input.data;
    const currentUserId = req.user?.id;

    const posts = await prisma.post.findMany({
      where: {
        text: {
          contains: q,
          mode: 'insensitive',
        },
        isDeleted: false,
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
    console.error('Error in searchPosts:', error);
  }
}

export async function searchUsers(req: Request, res: Response) {
  try {
    const input = SearchQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid search query' });
      return;
    }

    const { q, cursor, limit } = input.data;
    const currentUserId = req.user?.id;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        profilePic: true,
        biography: true,
        followersCount: true,
        followers: currentUserId ? {
            where: { followerId: currentUserId },
            select: { followerId: true }
        } : false
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const usersWithIsFollowing = users.map((user) => ({
      ...user,
      isFollowing: (user.followers?.length ?? 0) > 0,
      followers: undefined,
    }));

    const nextCursor = users.length > 0 ? users[users.length - 1].id : null;

    res.status(200).json({ users: usersWithIsFollowing, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in searchUsers:', error);
  }
}
