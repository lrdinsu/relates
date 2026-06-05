import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/test/setup/globalSetup.ts'],
    setupFiles: ['./src/test/setup/setupEnv.ts'],
    // One shared database/Redis across the run; keep test files serial so they
    // don't race on the shared state.
    fileParallelism: false,
    pool: 'forks',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
