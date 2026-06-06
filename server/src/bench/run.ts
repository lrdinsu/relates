import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

import jwt from 'jsonwebtoken';
import request from 'supertest';

import { seedDatabase, type SeedCounts } from './seed.js';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

type Stats = { median: number; p95: number; mean: number };

function summarize(times: number[]): Stats {
  const sorted = [...times].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return { median: at(0.5), p95: at(0.95), mean };
}

// Runs fn once to warm caches, then times it `iterations` times.
async function timeIt(
  fn: () => Promise<unknown>,
  iterations: number,
): Promise<Stats> {
  await fn();
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  return summarize(times);
}

const ms = (n: number) => `${n.toFixed(1)}ms`;

async function main() {
  const benchUrl = process.env.BENCH_DATABASE_URL;
  if (!benchUrl) {
    console.error('Set BENCH_DATABASE_URL to a local benchmark database.');
    process.exit(1);
  }
  if (!LOCAL_HOSTS.includes(new URL(benchUrl).hostname)) {
    console.error(`Refusing to run against a non-local host.`);
    process.exit(1);
  }

  // The app reads these at import; set them before importing app/db.
  process.env.DATABASE_URL = benchUrl;
  process.env.ACCESS_TOKEN_SECRET ||= 'bench-access-secret';
  process.env.REFRESH_TOKEN_SECRET ||= 'bench-refresh-secret';

  console.log('Applying schema...');
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: benchUrl },
    stdio: 'inherit',
  });

  const { app } = await import('../app.js');
  const { prisma } = await import('../db/index.js');

  // A single size if BENCH_POSTS is set, otherwise a sweep up to 1M.
  const sweep: SeedCounts[] = process.env.BENCH_POSTS
    ? [
        {
          users: Number(process.env.BENCH_USERS ?? 100_000),
          posts: Number(process.env.BENCH_POSTS),
          follows: Number(process.env.BENCH_FOLLOWS ?? 500_000),
          likes: Number(process.env.BENCH_LIKES ?? 1_000_000),
        },
      ]
    : [
        { users: 1_000, posts: 10_000, follows: 20_000, likes: 20_000 },
        { users: 10_000, posts: 100_000, follows: 200_000, likes: 200_000 },
        { users: 100_000, posts: 1_000_000, follows: 500_000, likes: 1_000_000 },
      ];

  const iterations = Number(process.env.BENCH_ITERATIONS ?? 30);

  for (const counts of sweep) {
    console.log(
      `\n=== dataset: ${counts.users} users, ${counts.posts} posts (${iterations} iterations) ===`,
    );
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Like", "Repost", "Save", "UserFollows", "Post", "User" RESTART IDENTITY CASCADE',
    );
    const focalId = await seedDatabase(prisma, counts);
    const token = jwt.sign({ userId: focalId }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '1h',
    });
    const auth = { Authorization: `Bearer ${token}` };

    const endpoints = [
      { label: 'For You feed', run: () => request(app).get('/api/v1/posts/for-you?limit=10').set(auth) },
      { label: 'Following feed', run: () => request(app).get('/api/v1/posts/following?limit=10').set(auth) },
      { label: 'Hot feed', run: () => request(app).get('/api/v1/posts/hot?limit=10') },
      { label: 'Search posts (FTS)', run: () => request(app).get('/api/v1/search/posts?q=raremarker&limit=10').set(auth) },
    ];

    for (const ep of endpoints) {
      const s = await timeIt(ep.run, iterations);
      console.log(
        `  ${ep.label.padEnd(16)} median ${ms(s.median).padStart(9)}   p95 ${ms(s.p95).padStart(9)}   mean ${ms(s.mean).padStart(9)}`,
      );
    }

    // Query plans for two representative queries (approximate the controllers'
    // SQL). EXPLAIN ANALYZE shows whether Postgres scans the whole table.
    const explain = async (label: string, sql: string) => {
      const rows = await prisma.$queryRawUnsafe<{ 'QUERY PLAN': string }[]>(
        `EXPLAIN ANALYZE ${sql}`,
      );
      console.log(`\n  EXPLAIN ${label}:`);
      for (const r of rows) console.log('    ' + r['QUERY PLAN']);
    };
    await explain(
      'search (FTS tsvector + ts_rank)',
      `SELECT id FROM "Post" WHERE "isDeleted" = false AND "searchVector" @@ websearch_to_tsquery('english', 'raremarker') ORDER BY ts_rank("searchVector", websearch_to_tsquery('english', 'raremarker')) DESC, id DESC LIMIT 10`,
    );
    await explain(
      'search (text ILIKE, trigram) — prior approach for contrast',
      `SELECT id FROM "Post" WHERE text ILIKE '%raremarker%' AND "isDeleted" = false ORDER BY "createdAt" DESC LIMIT 10`,
    );
    await explain(
      'hot feed (sort by counts)',
      `SELECT id FROM "Post" WHERE "isDeleted" = false ORDER BY "likesCount" DESC, "commentsCount" DESC, "createdAt" DESC LIMIT 10`,
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
