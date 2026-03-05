import { Request, Response } from 'express';
import { UserUpdateSchema } from 'validation';

import { prisma } from '../db';
import { jwtVerify } from '../utils/jwtVerify.js';

export async function followUnfollowUser(
  req: Request<{ id: string }>,
  res: Response,
) {
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

export async function getUserProfile(
  req: Request<{ username: string }>,
  res: Response,
) {
  try {
    const { username } = req.params;
    // Get token from headers to check if user is authorized (optional check for isFollowing)
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId: number | null = null;

    if (token) {
      try {
        const { userId } = await jwtVerify(
          token,
          process.env.ACCESS_TOKEN_SECRET!,
        );
        currentUserId = userId;
      } catch {
        // Token might be invalid or expired, ignore
      }
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        profilePic: true,
        biography: true,
        followingCount: true,
        followersCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.userFollows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.status(200).json({ user: { ...user, isFollowing } });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in getUserProfile:', error);
  }
}

export async function getMyData(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res
      .status(200)
      .json({ username: user.username, profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in getMyData:', error);
  }
}
