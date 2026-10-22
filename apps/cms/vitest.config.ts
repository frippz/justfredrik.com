import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Each run gets a fresh local D1 and R2, which Payload pushes its schema to
    env: {
      PAYLOAD_SECRET: 'test',
      WRANGLER_PERSIST_TO: fs.mkdtempSync(path.join(os.tmpdir(), 'cms-test-')),
    },
    // The test files share that one database
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
})
