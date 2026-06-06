import { Request, Response } from 'express';

import { prisma } from '../../db';
import { PostQuerySchema } from '../../types/validation/schemas.js';
import { getRepostedSet } from '../../utils/repostStatus.js';

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

    const profileUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!profileUser) {
      res.status(200).json({ posts: [], nextCursor: null });
      return;
    }

    // The profile shows the user's own root posts AND posts they reposted,
    // interleaved by activity time (a repost's time is when they reposted).
    // It's a merged list, so we page by offset (the cursor is an offset here).
    const offset = cursor ?? 0;
    const fetchN = offset + limit;

    const [authored, reposts] = await Promise.all([
      prisma.post.findMany({
        where: {
          postedById: profileUser.id,
          parentPostId: null,
          isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
        take: fetchN,
        select: { id: true, createdAt: true },
      }),
      prisma.repost.findMany({
        where: { userId: profileUser.id, post: { isDeleted: false } },
        orderBy: { createdAt: 'desc' },
        take: fetchN,
        select: { postId: true, createdAt: true },
      }),
    ]);

    // Merge the two sources, newest activity first, de-duped by post id.
    const entries = [
      ...authored.map((post) => ({
        postId: post.id,
        activityAt: post.createdAt,
        isRepost: false,
      })),
      ...reposts.map((repost) => ({
        postId: repost.postId,
        activityAt: repost.createdAt,
        isRepost: true,
      })),
    ].sort((a, b) => b.activityAt.getTime() - a.activityAt.getTime());

    const seen = new Set<number>();
    const deduped = entries.filter((entry) => {
      if (seen.has(entry.postId)) return false;
      seen.add(entry.postId);
      return true;
    });
    const pageEntries = deduped.slice(offset, offset + limit);
    const pageIds = pageEntries.map((entry) => entry.postId);

    // Hydrate the page, then restore the merged order.
    const hydrated = await prisma.post.findMany({
      where: { id: { in: pageIds } },
      include: {
        postedBy: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
        parentPost: {
          select: { postedBy: { select: { username: true } } },
        },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { userId: true } }
          : false,
      },
    });
    const byId = new Map(hydrated.map((post) => [post.id, post]));
    const reposted = await getRepostedSet(currentUserId, pageIds);

    const posts = pageEntries
      .map((entry) => {
        const post = byId.get(entry.postId);
        if (!post) return null;
        return {
          ...post,
          isLiked: (post.likes?.length ?? 0) > 0,
          isReposted: reposted.has(post.id),
          // Attribute reposts so the UI can show "Reposted by <username>".
          repostedBy: entry.isRepost ? username : null,
          likes: undefined,
        };
      })
      .filter((post): post is NonNullable<typeof post> => post !== null);

    const nextCursor = deduped.length > offset + limit ? offset + limit : null;

    res.status(200).json({ posts, nextCursor });
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

    res.status(200).json({ posts: commentsWithIsLiked, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get user comments:', error);
  }
}
