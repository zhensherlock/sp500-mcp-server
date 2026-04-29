import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['default'],
    coverage: {
      enabled: false,
      provider: 'v8',
      include: ['app/**/*.ts'],
      reporter: ['html'],
    },
  },
})
