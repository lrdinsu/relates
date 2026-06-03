import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/test/setup/globalSetup.ts'],
    setupFiles: ['./src/test/setup/setupEnv.ts'],
    // One database container shared across the run; keep files serial so they
    // don't race on the shared schema.
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
