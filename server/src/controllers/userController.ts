import { Request, Response } from 'express';
import { UserUpdateSchema } from 'validation';

import { prisma } from '../db/index.js';

export async function followUnfollowUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const targetUserId = Number.parseInt(id, 10);

    const currentUserId = req.user!.id;

    if (targetUserId === currentUserId) {
      res.status(400).json({ message: 'Cannot follow/unfollow yourself' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // check if user is already following
    const isFollowing = await prisma.userFollows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (isFollowing) {
      // Unfollow user
      await prisma.userFollows.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      // update followers and following count
      await prisma.user.update({
        where: { id: targetUserId },
        data: { followersCount: { decrement: 1 } },
      });
      await prisma.user.update({
        where: { id: currentUserId },
        data: { followingCount: { decrement: 1 } },
      });

      res.status(204).send();
      return;
    } else {
      // Follow user
      await prisma.userFollows.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      // update followers and following count
      await prisma.user.update({
        where: { id: targetUserId },
        data: { followersCount: { increment: 1 } },
      });
      await prisma.user.update({
        where: { id: currentUserId },
        data: { followingCount: { increment: 1 } },
      });

      res.status(204).send();
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in followUnfollowUser:', error);
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const input = UserUpdateSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ message: 'Invalid update data' });
      return;
    }

    const currentUserId = req.user!.id;

    await prisma.user.update({
      where: { id: currentUserId },
      data: input.data,
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in updateUser:', error);
  }
}

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in getUserProfile:', error);
  }
}
