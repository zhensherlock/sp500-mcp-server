import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { include: ['apps/web/tests/playground/**/*.spec.ts'], testTimeout: 60_000 },
})
