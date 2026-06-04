// Match the app's configured client type (it carries the field-omit config).
type SeedPrisma = (typeof import('../db/index.js'))['prisma'];

export type SeedCounts = {
  users: number;
  posts: number;
  follows: number;
  likes: number;
};

// Not a real hash; these users are never logged in (the bench mints tokens
// directly). Kept as a plain literal so it's safe to inline.
const PLACEHOLDER_PASSWORD = 'benchmark-placeholder-no-login';

// Seeds a synthetic social graph entirely server-side via generate_series, so
// it scales to millions of rows without building large arrays in Node.
// Counts are absolute totals. Assumes the tables were just truncated with
// RESTART IDENTITY (ids start at 1). Returns the focal user id.
export async function seedDatabase(
  prisma: SeedPrisma,
  counts: SeedCounts,
): Promise<number> {
  const users = Math.trunc(counts.users);
  const posts = Math.trunc(counts.posts);
  const follows = Math.trunc(counts.follows);
  const likes = Math.trunc(counts.likes);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "User"
      (username, email, name, password, role, active,
       "followingCount", "followersCount", "createdAt", "updatedAt")
    SELECT
      'bench_user_' || g,
      'bench_user_' || g || '@example.com',
      'Bench User ' || g,
      '${PLACEHOLDER_PASSWORD}',
      'USER', true, 0, 0, now(), now()
    FROM generate_series(1, ${users}) AS g
  `);

  // Distribute posts across users and spread createdAt over time so the feed's
  // recency ordering has variety.
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Post"
      ("postedById", text, "likesCount", "commentsCount", "repostsCount",
       "isDeleted", images, "createdAt", "updatedAt")
    SELECT
      (g % ${users}) + 1,
      'Bench post ' || g || ' the quick brown fox jumps over the lazy dog'
        || CASE WHEN g % 1000 = 0 THEN ' raremarker' ELSE '' END,
      0, 0, 0, false, '{}',
      now() - ((g % 2592000) || ' seconds')::interval,
      now()
    FROM generate_series(1, ${posts}) AS g
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "UserFollows" ("followerId", "followingId")
    SELECT f, t FROM (
      SELECT (g % ${users}) + 1 AS f, floor(random() * ${users})::int + 1 AS t
      FROM generate_series(1, ${follows}) AS g
    ) s
    WHERE f <> t
    ON CONFLICT ("followerId", "followingId") DO NOTHING
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Like" ("userId", "postId", "createdAt")
    SELECT u, p, now() FROM (
      SELECT floor(random() * ${users})::int + 1 AS u,
             floor(random() * ${posts})::int + 1 AS p
      FROM generate_series(1, ${likes}) AS g
    ) s
    ON CONFLICT ("userId", "postId") DO NOTHING
  `);

  // Backfill denormalized counters so seeded data is internally consistent
  // (the feeds read likesCount, and follower/following counts).
  await prisma.$executeRawUnsafe(`
    UPDATE "Post" p SET "likesCount" = sub.c
    FROM (SELECT "postId", COUNT(*)::int c FROM "Like" GROUP BY "postId") sub
    WHERE p.id = sub."postId"
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "User" u SET "followersCount" = sub.c
    FROM (SELECT "followingId", COUNT(*)::int c FROM "UserFollows" GROUP BY "followingId") sub
    WHERE u.id = sub."followingId"
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "User" u SET "followingCount" = sub.c
    FROM (SELECT "followerId", COUNT(*)::int c FROM "UserFollows" GROUP BY "followerId") sub
    WHERE u.id = sub."followerId"
  `);

  return 1;
}
