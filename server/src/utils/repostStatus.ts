import { prisma } from '../db/index.js';

// Returns the subset of postIds that the current user has reposted, as a Set for
// O(1) lookup while shaping responses. One batched query per list, mirroring how
// `isLiked` is derived but without threading a relation include through every
// post query. Empty for anonymous callers.
export async function getRepostedSet(
  currentUserId: number | undefined,
  postIds: number[],
): Promise<Set<number>> {
  if (!currentUserId || postIds.length === 0) return new Set();

  const rows = await prisma.repost.findMany({
    where: { userId: currentUserId, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(rows.map((row) => row.postId));
}
