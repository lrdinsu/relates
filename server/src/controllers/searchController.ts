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

    // Full-text search ranked by relevance. The cursor is treated as an offset
    // here (results are rank-ordered, not id-ordered, so an id cursor wouldn't
    // page correctly). Step 1: rank + page the matching ids via the GIN-indexed
    // tsvector; step 2: hydrate the bodies with Prisma, preserving rank order.
    const offset = cursor ?? 0;
    const ranked = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id
      FROM "Post"
      WHERE "isDeleted" = false
        AND "searchVector" @@ websearch_to_tsquery('english', ${q})
      ORDER BY
        ts_rank("searchVector", websearch_to_tsquery('english', ${q})) DESC,
        id DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `;
    const ids = ranked.map((row) => row.id);

    if (ids.length === 0) {
      res.status(200).json({ posts: [], nextCursor: null });
      return;
    }

    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
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
    });

    // findMany doesn't preserve the `in` order, so restore the rank order.
    const byId = new Map(posts.map((post) => [post.id, post]));
    const postsWithIsLiked = ids
      .map((id) => byId.get(id))
      .filter((post): post is NonNullable<typeof post> => post !== undefined)
      .map((post) => ({
        ...post,
        isLiked: (post.likes?.length ?? 0) > 0,
        likes: undefined,
      }));

    // A full page means there are likely more results; advance the offset.
    const nextCursor = ids.length === limit ? offset + ids.length : null;

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
