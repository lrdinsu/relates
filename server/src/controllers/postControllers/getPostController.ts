import { Request, Response } from 'express';

import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../db';
import {
  CELEBRITY_FOLLOWER_THRESHOLD,
  feedExists,
  getFeedPage,
  rebuildFeed,
} from '../../feed/feedStore.js';
import {
  PostParamsSchema,
  PostQuerySchema,
} from '../../types/validation/schemas.js';
import { getRepostedSet } from '../../utils/repostStatus.js';

export async function getHotPosts(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;
    const currentUserId = req.user?.id;

    const posts = await prisma.post.findMany({
      where: { isDeleted: false },
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

    const reposted = await getRepostedSet(
      currentUserId,
      posts.map((p) => p.id),
    );
    const postsWithIsLiked = posts.map((post) => ({
      ...post,
      isLiked: (post.likes?.length ?? 0) > 0,
      isReposted: reposted.has(post.id),
      likes: undefined,
    }));

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts: postsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get hot posts:', error);
  }
}

export async function getForYouPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const candidateIds = await rankedForYouPostIds(currentUserId, cursor, limit);

    const posts = await prisma.post.findMany({
      where: { id: { in: candidateIds }, isDeleted: false },
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
        likes: {
          where: { userId: currentUserId },
          select: { userId: true },
        },
      },
    });
    const order = new Map(candidateIds.map((id, index) => [id, index]));
    posts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    const reposted = await getRepostedSet(
      currentUserId,
      posts.map((p) => p.id),
    );
    const postsWithIsLiked = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isReposted: reposted.has(post.id),
      likes: undefined,
    }));

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts: postsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get for you posts:', error);
  }
}

type RankedPostRow = {
  id: number;
};

async function rankedForYouPostIds(
  currentUserId: number,
  cursor: number | undefined,
  limit: number,
): Promise<number[]> {
  const cursorFilter = cursor
    ? Prisma.sql`AND p.id < ${cursor}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<RankedPostRow[]>`
    WITH followed AS (
      SELECT "followingId" AS user_id
      FROM "UserFollows"
      WHERE "followerId" = ${currentUserId}
    ),
    affinity_authors AS (
      SELECT DISTINCT source_posts."postedById" AS user_id
      FROM "Like" l
      JOIN "Post" source_posts ON source_posts.id = l."postId"
      WHERE l."userId" = ${currentUserId}

      UNION

      SELECT DISTINCT source_posts."postedById" AS user_id
      FROM "Repost" r
      JOIN "Post" source_posts ON source_posts.id = r."postId"
      WHERE r."userId" = ${currentUserId}

      UNION

      SELECT DISTINCT parent_posts."postedById" AS user_id
      FROM "Post" comments
      JOIN "Post" parent_posts ON parent_posts.id = comments."parentPostId"
      WHERE comments."postedById" = ${currentUserId}
    ),
    candidates AS (
      SELECT p.id, 75.0 AS source_score
      FROM "Post" p
      WHERE p."postedById" = ${currentUserId}
        AND p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 70.0 AS source_score
      FROM "Post" p
      JOIN followed f ON f.user_id = p."postedById"
      WHERE p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 50.0 AS source_score
      FROM "Post" p
      JOIN "Repost" r ON r."postId" = p.id
      JOIN followed f ON f.user_id = r."userId"
      WHERE p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 45.0 AS source_score
      FROM "Post" p
      JOIN "Like" l ON l."postId" = p.id
      JOIN followed f ON f.user_id = l."userId"
      WHERE p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 35.0 AS source_score
      FROM "Post" p
      JOIN affinity_authors a ON a.user_id = p."postedById"
      WHERE p."postedById" <> ${currentUserId}
        AND p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 25.0 AS source_score
      FROM "Post" p
      WHERE p."parentPostId" IS NULL
        AND p."isDeleted" = false
        AND (
          p."likesCount" >= 5
          OR p."repostsCount" >= 2
          OR p."commentsCount" >= 3
        )
        ${cursorFilter}

      UNION ALL

      SELECT p.id, 15.0 AS source_score
      FROM "Post" p
      WHERE p."parentPostId" IS NULL
        AND p."isDeleted" = false
        ${cursorFilter}
      ORDER BY id DESC
      LIMIT ${limit * 8}
    ),
    scored AS (
      SELECT
        p.id,
        MAX(c.source_score)
          + LEAST(25.0, LN(1 + p."likesCount") * 6)
          + LEAST(18.0, LN(1 + p."repostsCount") * 7)
          + LEAST(16.0, LN(1 + p."commentsCount") * 5)
          + GREATEST(
              0.0,
              20.0 - (EXTRACT(EPOCH FROM (now() - p."createdAt")) / 3600.0)
            ) AS score
      FROM candidates c
      JOIN "Post" p ON p.id = c.id
      GROUP BY p.id
    )
    SELECT id
    FROM scored
    ORDER BY score DESC, id DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => row.id);
}

// Turn a set of post ids into full posts (newest-first), dropping any deleted
// since they landed in the feed cache. Shared by the Redis-served path.
async function hydratePostsByIds(ids: number[], currentUserId: number) {
  if (ids.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: { id: { in: ids }, isDeleted: false },
    orderBy: { id: 'desc' },
    include: {
      postedBy: {
        select: { id: true, username: true, name: true, profilePic: true },
      },
      parentPost: {
        select: { postedBy: { select: { username: true } } },
      },
      likes: {
        where: { userId: currentUserId },
        select: { userId: true },
      },
    },
  });

  const reposted = await getRepostedSet(
    currentUserId,
    posts.map((p) => p.id),
  );
  return posts.map((post) => ({
    ...post,
    isLiked: post.likes.length > 0,
    isReposted: reposted.has(post.id),
    likes: undefined,
  }));
}

// Recent root posts from the celebrities the user follows. These are not fanned
// out into the Redis feed, so we merge them in at read time (the hybrid).
async function followedCelebrityPostIds(
  currentUserId: number,
  cursor: number | undefined,
  limit: number,
): Promise<number[]> {
  const follows = await prisma.userFollows.findMany({
    where: {
      followerId: currentUserId,
      following: { followersCount: { gte: CELEBRITY_FOLLOWER_THRESHOLD } },
    },
    select: { followingId: true },
  });
  const celebrityIds = follows.map((follow) => follow.followingId);
  if (celebrityIds.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: {
      postedById: { in: celebrityIds },
      parentPostId: null,
      isDeleted: false,
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { id: 'desc' },
    take: limit,
    select: { id: true },
  });
  return posts.map((post) => post.id);
}

// Fallback used when the Redis feed can't serve (e.g. Redis down, or prod where
// the fan-out worker doesn't run): compute the following feed from Postgres.
async function readTimeFollowingFeed(
  currentUserId: number,
  cursor: number | undefined,
  limit: number,
) {
  const followed = await prisma.userFollows.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const ids = followed.map((follow) => follow.followingId);
  ids.push(currentUserId);

  const posts = await prisma.post.findMany({
    where: {
      postedById: { in: ids },
      parentPostId: null,
      isDeleted: false,
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { id: 'desc' },
    take: limit,
    include: {
      postedBy: {
        select: { id: true, username: true, name: true, profilePic: true },
      },
      parentPost: {
        select: { postedBy: { select: { username: true } } },
      },
      likes: {
        where: { userId: currentUserId },
        select: { userId: true },
      },
    },
  });

  const reposted = await getRepostedSet(
    currentUserId,
    posts.map((p) => p.id),
  );
  const shaped = posts.map((post) => ({
    ...post,
    isLiked: post.likes.length > 0,
    isReposted: reposted.has(post.id),
    likes: undefined,
  }));
  const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;
  return { posts: shaped, nextCursor };
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

    // Prefer the precomputed Redis feed; warm it from Postgres if cold. If Redis
    // is unavailable, fall back to computing the feed at read time.
    let feedIds: number[] | null = null;
    try {
      if (!(await feedExists(currentUserId))) {
        await rebuildFeed(currentUserId);
      }
      if (await feedExists(currentUserId)) {
        feedIds = await getFeedPage(currentUserId, cursor, limit);
      }
    } catch (err) {
      console.error('Feed cache unavailable, serving read-time feed:', err);
      feedIds = null;
    }

    if (feedIds === null) {
      res.status(200).json(
        await readTimeFollowingFeed(currentUserId, cursor, limit),
      );
      return;
    }

    // Hybrid: merge in recent posts from followed celebrities (not fanned out).
    const celebrityIds = await followedCelebrityPostIds(
      currentUserId,
      cursor,
      limit,
    );
    const mergedIds = Array.from(new Set([...feedIds, ...celebrityIds]))
      .sort((a, b) => b - a)
      .slice(0, limit);

    const posts = await hydratePostsByIds(mergedIds, currentUserId);
    // Page from the merged ids (not the hydrated set) so a deleted post doesn't
    // stop pagination early.
    const nextCursor =
      mergedIds.length > 0 ? mergedIds[mergedIds.length - 1] : null;

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
      where: { 
        id: { in: likedPostIds },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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
      },
    });

    const reposted = await getRepostedSet(
      currentUserId,
      posts.map((p) => p.id),
    );
    const postsWithIsLiked = posts.map((post) => ({
      ...post,
      isLiked: true,
      isReposted: reposted.has(post.id),
    }));

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts: postsWithIsLiked, nextCursor });
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
      where: { 
        id: { in: savedPostIds },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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
        likes: {
          where: { userId: currentUserId },
          select: { userId: true },
        },
      },
    });

    const reposted = await getRepostedSet(
      currentUserId,
      posts.map((p) => p.id),
    );
    const postsWithIsLiked = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isReposted: reposted.has(post.id),
      likes: undefined,
    }));

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts: postsWithIsLiked, nextCursor });
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

    const params = PostParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;
    const currentUserId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post || post.isDeleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const postWithIsLiked = {
      ...post,
      isLiked: (post.likes?.length ?? 0) > 0,
      isReposted: (await getRepostedSet(currentUserId, [post.id])).has(post.id),
      likes: undefined,
    };

    // Fetch ancestors
    const ancestors = [];
    let currentParentPostId = post.parentPostId;

    while (currentParentPostId) {
      const parent = await prisma.post.findUnique({
        where: { id: currentParentPostId },
        include: {
          postedBy: {
            select: {
              id: true,
              username: true,
              profilePic: true,
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

      if (!parent || parent.isDeleted) break;
      ancestors.unshift({
        ...parent,
        isLiked: (parent.likes?.length ?? 0) > 0,
        isReposted: (await getRepostedSet(currentUserId, [parent.id])).has(
          parent.id,
        ),
        likes: undefined,
      });
      currentParentPostId = parent.parentPostId;
    }

    res.status(200).json({ post: postWithIsLiked, ancestors });
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
    const currentUserId = req.user?.id;

    const comments = await prisma.post.findMany({
      where: { parentPostId: postId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const reposted = await getRepostedSet(
      currentUserId,
      comments.map((c) => c.id),
    );
    const commentsWithIsLiked = comments.map((comment) => ({
      ...comment,
      isLiked: (comment.likes?.length ?? 0) > 0,
      isReposted: reposted.has(comment.id),
      likes: undefined,
    }));

    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;
    res.status(200).json({ comments: commentsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get comments:', error);
  }
}
