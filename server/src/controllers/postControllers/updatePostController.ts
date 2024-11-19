import { Request, Response } from 'express';

import { prisma } from '../../db/index.js';
import { PostParamsSchema } from '../../types/validation/schemas.js';

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
