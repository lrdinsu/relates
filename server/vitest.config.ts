import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/setup/globalSetup.ts'],
    setupFiles: ['./test/setup/setupEnv.ts'],
    // One shared database/Redis across the run; keep test files serial so they
    // don't race on the shared state.
    fileParallelism: false,
    pool: 'forks',
    include: ['test/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
