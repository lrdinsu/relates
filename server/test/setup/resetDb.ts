import { prisma } from '../../src/db';
import { redis } from '../../src/db/redis';

// Empties every table and resets identity sequences, and clears Redis, so each
// test starts from a known-clean state.
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Like", "Repost", "Save", "UserFollows", "Post", "User" RESTART IDENTITY CASCADE',
  );
  await redis.flushall();
}
