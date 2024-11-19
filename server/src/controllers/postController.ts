import { Request, Response } from 'express';
import { PostCreateSchema } from 'validation';

import { selectFeedPosts } from '@prisma/client/sql';

import { prisma } from '../db/index.js';
import {
  PostCreateParamsSchema,
  PostParamsSchema,
  PostQuerySchema,
} from '../types/validation/schemas.js';

export async function getFeedPosts(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    // Use raw SQL query with cursor-based pagination
    const posts = await prisma.$queryRawTyped(
      selectFeedPosts(currentUserId, cursor, limit),
    );

    const nextCursor =
      posts.length > 0 ? posts[posts.length - 1]?.id : undefined;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get feed posts:', error);
  }
}

export async function getHotPosts(req: Request, res: Response) {
  try {
    const input = PostQuerySchema.safeParse(req.query);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid query params' });
      return;
    }

    const { cursor, limit } = input.data;

    const posts = await prisma.post.findMany({
      orderBy: { likesCount: 'desc', commentsCount: 'desc', createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const nextCursor =
      posts.length > 0 ? posts[posts.length - 1].id : undefined;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get hot posts:', error);
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
      comments.length > 0 ? comments[comments.length - 1].id : undefined;

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

    const params = PostParamsSchema.safeParse(req.params.postId);
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
      comments.length > 0 ? comments[comments.length - 1].id : undefined;
    res.status(200).json({ comments, nextCursor });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in get comments:', error);
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const input = PostCreateSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid post data' });
      return;
    }

    const currentUserId = req.user!.id;
    const { text, images } = input.data;

    // determine if this is a root-level post or a comment
    const params = PostCreateParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }

    const parentPostId = params.data.postId;

    // If it's a comment, verify that the parent post exists and increment `commentsCount`
    if (parentPostId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: parentPostId },
      });

      if (!parentPost) {
        res.status(404).json({ message: 'Parent post not found' });
        return;
      }

      await prisma.post.update({
        where: { id: parentPostId },
        data: { commentsCount: { increment: 1 } },
      });
    }

    // create post
    const post = await prisma.post.create({
      data: {
        postedById: currentUserId,
        text,
        images: images ? images : undefined,
        parentPostId: parentPostId ? parentPostId : undefined,
      },
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

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in create post:', error);
  }
}

export async function deletePostById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = PostParamsSchema.safeParse(req.params.postId);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;
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
    const params = PostParamsSchema.safeParse(req.params.postId);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user!.id;
    const isLiked = await prisma.like.findUnique({
      where: {
        userId_postId: {
          postId,
          userId,
        },
      },
    });

    if (isLiked) {
      // Unlike post
      await prisma.like.delete({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
    } else {
      // Like post
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in like/unlike post:', error);
  }
}

export async function saveUnsavePost(req: Request, res: Response) {
  try {
    const params = PostParamsSchema.safeParse(req.params.postId);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user!.id;
    const isSaved = await prisma.save.findUnique({
      where: {
        userId_postId: {
          postId,
          userId,
        },
      },
    });

    if (isSaved) {
      // Unsave post
      await prisma.save.delete({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });
    } else {
      // Save post
      await prisma.save.create({
        data: {
          userId,
          postId,
        },
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in save/unsave post:', error);
  }
}

export async function repostUnrepost(req: Request, res: Response) {
  try {
    const params = PostParamsSchema.safeParse(req.params.postId);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;
    const originalPost = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!originalPost) {
      res.status(404).json({ message: 'Original post not found' });
      return;
    }

    const userId = req.user!.id;
    const isReposted = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (isReposted) {
      // Unrepost post
      await prisma.repost.delete({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { repostsCount: { decrement: 1 } },
      });
    } else {
      // Repost post
      await prisma.repost.create({
        data: {
          userId,
          postId,
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { repostsCount: { increment: 1 } },
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in repost post:', error);
  }
}
