import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
    reporters: ['default'],
    coverage: {
      enabled: false,
      provider: 'v8',
      include: ['packages/**/*.ts', 'apps/**/*.ts'],
      reporter: ['html'],
    },
  },
})
