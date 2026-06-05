import { Request, Response } from 'express';

import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../db';
import { LIKE_CREATED, LikeCreatedPayload } from '../../events/events.js';
import { PostParamsSchema } from '../../types/validation/schemas.js';
import { isPrismaErrorCode } from '../../utils/prismaError.js';
import { PostUpdateSchema } from 'validation';

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const params = PostParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ message: 'Invalid post params' });
      return;
    }
    const postId = params.data.postId;

    const body = PostUpdateSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: body.error.issues[0].message });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // check if user is authorized to update post
    const currentUser = req.user!;
    if (!(post.postedById === currentUser.id)) {
      res.status(403).json({ message: 'Unauthorized to update post' });
      return;
    }

    await prisma.post.update({
      where: { id: postId },
      data: body.data,
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in update post:', error);
  }
}

export async function deletePostById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const params = PostParamsSchema.safeParse(req.params);
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

    // Soft-delete the post and, if it's a reply, decrement the parent's comment
    // count in the same transaction so they can't drift apart. The updateMany
    // with `isDeleted: false` makes this idempotent: a repeat delete affects
    // zero rows (count === 0), so we skip the decrement and the parent's count
    // can't fall below the real number of replies.
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.post.updateMany({
        where: { id: postId, isDeleted: false },
        data: { isDeleted: true },
      });

      if (count > 0 && post.parentPostId) {
        await tx.post.update({
          where: { id: post.parentPostId },
          data: { commentsCount: { decrement: 1 } },
        });
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in delete post by id:', error);
  }
}

export async function likeUnlikePost(req: Request, res: Response) {
  try {
    const params = PostParamsSchema.safeParse(req.params);
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
      // Unlike: drop the row and the counter together so they can't drift.
      try {
        await prisma.$transaction([
          prisma.like.delete({
            where: { userId_postId: { postId, userId } },
          }),
          prisma.post.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } },
          }),
        ]);
      } catch (err) {
        // A concurrent unlike already removed the row: nothing left to do.
        if (!isPrismaErrorCode(err, 'P2025')) throw err;
      }
    } else {
      // Like: create the row and bump the counter together. Record a
      // LIKE_CREATED event in the SAME transaction (the outbox) so a
      // notification can be produced asynchronously without dual-writing to the
      // broker. Skip self-likes: no point notifying yourself.
      const ops: Prisma.PrismaPromise<unknown>[] = [
        prisma.like.create({ data: { userId, postId } }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ];
      if (post.postedById !== userId) {
        ops.push(
          prisma.outbox.create({
            data: {
              eventType: LIKE_CREATED,
              payload: {
                actorId: userId,
                recipientId: post.postedById,
                postId,
              } satisfies LikeCreatedPayload,
            },
          }),
        );
      }
      try {
        await prisma.$transaction(ops);
      } catch (err) {
        // A concurrent like already created the row (unique constraint): no-op.
        if (!isPrismaErrorCode(err, 'P2002')) throw err;
      }
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in like/unlike post:', error);
  }
}

export async function saveUnsavePost(req: Request, res: Response) {
  try {
    const params = PostParamsSchema.safeParse(req.params);
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
    const params = PostParamsSchema.safeParse(req.params);
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
      // Unrepost: drop the row and the counter together so they can't drift.
      try {
        await prisma.$transaction([
          prisma.repost.delete({
            where: { userId_postId: { postId, userId } },
          }),
          prisma.post.update({
            where: { id: postId },
            data: { repostsCount: { decrement: 1 } },
          }),
        ]);
      } catch (err) {
        // A concurrent unrepost already removed the row: nothing left to do.
        if (!isPrismaErrorCode(err, 'P2025')) throw err;
      }
    } else {
      // Repost: create the row and bump the counter together.
      try {
        await prisma.$transaction([
          prisma.repost.create({ data: { userId, postId } }),
          prisma.post.update({
            where: { id: postId },
            data: { repostsCount: { increment: 1 } },
          }),
        ]);
      } catch (err) {
        // A concurrent repost already created the row (unique constraint): no-op.
        if (!isPrismaErrorCode(err, 'P2002')) throw err;
      }
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in repost post:', error);
  }
}
