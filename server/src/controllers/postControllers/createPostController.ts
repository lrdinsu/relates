import { Request, Response } from 'express';
import { PostCreateSchema } from 'validation';

import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../db';
import { POST_CREATED, PostCreatedPayload } from '../../events/events.js';
import { PostCreateParamsSchema } from '../../types/validation/schemas.js';

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

    const parentPostId = params.data.parentPostId;

    const postArgs = {
      data: {
        postedById: currentUserId,
        text,
        images: images ?? undefined,
        parentPostId: parentPostId ?? undefined,
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
    } satisfies Prisma.PostCreateArgs;

    let post;
    if (parentPostId) {
      // It's a comment: verify the parent exists, then create the comment and
      // bump the parent's commentsCount together so the count can't drift from
      // the actual number of replies if a write fails partway.
      const parentPost = await prisma.post.findUnique({
        where: { id: parentPostId },
      });

      if (!parentPost) {
        res.status(404).json({ message: 'Parent post not found' });
        return;
      }

      const [created] = await prisma.$transaction([
        prisma.post.create(postArgs),
        prisma.post.update({
          where: { id: parentPostId },
          data: { commentsCount: { increment: 1 } },
        }),
      ]);
      post = created;
    } else {
      // Root-level post: create it and record a POST_CREATED event in the same
      // transaction, so the feed fan-out can run asynchronously off the outbox.
      // Replies are not fanned out to timelines, so only root posts emit this.
      post = await prisma.$transaction(async (tx) => {
        const created = await tx.post.create(postArgs);
        await tx.outbox.create({
          data: {
            eventType: POST_CREATED,
            payload: {
              postId: created.id,
              authorId: currentUserId,
            } satisfies PostCreatedPayload,
          },
        });
        return created;
      });
    }

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in create post:', error);
  }
}
