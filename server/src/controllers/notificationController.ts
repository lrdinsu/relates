import { Request, Response } from 'express';

import { prisma } from '../db';

// List the current user's notifications, newest first, with the actor and (for
// likes) the post hydrated so the client can render "<actor> liked your post"
// without extra round-trips. List-only for now: no mark-as-read yet.
export async function getNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const recipientId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        actor: { select: { id: true, username: true, profilePic: true } },
        post: { select: { id: true, text: true } },
      },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Unknown error occurred!' });
    console.error('Error in getNotifications:', error);
  }
}
