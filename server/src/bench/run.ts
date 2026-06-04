import { execSync } from 'node:child_process';

import { seedDatabase } from './seed.js';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

async function main() {
  const benchUrl = process.env.BENCH_DATABASE_URL;
  if (!benchUrl) {
    console.error(
      'Set BENCH_DATABASE_URL to a local benchmark database, e.g.\n' +
        '  export BENCH_DATABASE_URL=postgresql://user:pass@localhost:5432/relates_bench',
    );
    process.exit(1);
  }

  // Safety: this script truncates and seeds, so only allow local databases.
  const host = new URL(benchUrl).hostname;
  if (!LOCAL_HOSTS.includes(host)) {
    console.error(`Refusing to run against a non-local host: ${host}`);
    process.exit(1);
  }

  // The app's Prisma client reads DATABASE_URL.
  process.env.DATABASE_URL = benchUrl;

  console.log('Applying schema (prisma migrate deploy)...');
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: benchUrl },
    stdio: 'inherit',
  });

  const { prisma } = await import('../db/index.js');

  console.log('Clearing existing data...');
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Like", "Repost", "Save", "UserFollows", "Post", "User" RESTART IDENTITY CASCADE',
  );

  const counts = {
    users: Number(process.env.BENCH_USERS ?? 1_000),
    posts: Number(process.env.BENCH_POSTS ?? 10_000),
    follows: Number(process.env.BENCH_FOLLOWS ?? 20_000),
    likes: Number(process.env.BENCH_LIKES ?? 20_000),
  };
  console.log('Seeding...', counts);
  console.time('seed');
  const focalUserId = await seedDatabase(prisma, counts);
  console.timeEnd('seed');

  const [users, posts, follows, likes] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.userFollows.count(),
    prisma.like.count(),
  ]);
  console.log('Row counts:', { users, posts, follows, likes });
  console.log('Focal user id (follows many):', focalUserId);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
