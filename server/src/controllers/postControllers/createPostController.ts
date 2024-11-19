import { Request, Response } from 'express';
import { PostCreateSchema } from 'validation';

import { prisma } from '../../db/index.js';
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
