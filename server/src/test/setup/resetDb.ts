import { prisma } from '../../db';

// Empties every table and resets identity sequences, so each test starts from
// a known-clean state.
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Like", "Repost", "Save", "UserFollows", "Post", "User" RESTART IDENTITY CASCADE',
  );
}
