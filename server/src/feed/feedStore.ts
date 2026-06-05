import { prisma } from '../db/index.js';
import { redis } from '../db/redis.js';

// A user's home (following) feed is a Redis sorted set: member = post id,
// score = post id. Post ids autoincrement, so the score orders chronologically
// and lets us paginate by the existing post-id cursor. The set is a rebuildable
// cache of a derivable thing, never the source of truth.

// Keep only the most recent N posts per feed.
export const FEED_CAP = 800;
// Authors above this follower count are not fanned out; their posts are merged
// in at read time instead (the celebrity / hot-key hybrid).
export const CELEBRITY_FOLLOWER_THRESHOLD = 10_000;

function feedKey(userId: number): string {
  return `feed:${userId}`;
}

// Add one post id into many users' feeds and trim each back to FEED_CAP.
// Idempotent: re-adding the same id just rewrites the identical score, so a
// redelivered event can't duplicate a post in a feed.
export async function addPostToFeeds(
  userIds: number[],
  postId: number,
): Promise<void> {
  if (userIds.length === 0) return;

  const pipeline = redis.pipeline();
  for (const userId of userIds) {
    const key = feedKey(userId);
    pipeline.zadd(key, postId, String(postId));
    // Drop everything except the highest-scored FEED_CAP members.
    pipeline.zremrangebyrank(key, 0, -FEED_CAP - 1);
  }
  await pipeline.exec();
}

// One page of a feed, newest-first, ids strictly older than `cursor` (a post id).
export async function getFeedPage(
  userId: number,
  cursor: number | undefined,
  limit: number,
): Promise<number[]> {
  const max = cursor ? `(${cursor}` : '+inf';
  const ids = await redis.zrevrangebyscore(
    feedKey(userId),
    max,
    '-inf',
    'LIMIT',
    0,
    limit,
  );
  return ids.map(Number);
}

export async function feedExists(userId: number): Promise<boolean> {
  return (await redis.exists(feedKey(userId))) === 1;
}

// Rebuild a feed from Postgres: the recent root posts of the non-celebrity
// authors the user follows, plus the user's own. Used to warm a cold feed so
// the store stays a rebuildable view. Celebrity authors are intentionally left
// out, they are merged at read time.
export async function rebuildFeed(userId: number): Promise<void> {
  const follows = await prisma.userFollows.findMany({
    where: { followerId: userId },
    select: { following: { select: { id: true, followersCount: true } } },
  });

  const authorIds = follows
    .map((follow) => follow.following)
    .filter((user) => user.followersCount < CELEBRITY_FOLLOWER_THRESHOLD)
    .map((user) => user.id);
  authorIds.push(userId);

  const posts = await prisma.post.findMany({
    where: { postedById: { in: authorIds }, parentPostId: null, isDeleted: false },
    orderBy: { id: 'desc' },
    take: FEED_CAP,
    select: { id: true },
  });

  if (posts.length === 0) return;

  const pipeline = redis.pipeline();
  const key = feedKey(userId);
  for (const post of posts) {
    pipeline.zadd(key, post.id, String(post.id));
  }
  await pipeline.exec();
}
