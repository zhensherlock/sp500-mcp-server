import type { NextConfig } from 'next'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: join(appDir, '../..'),
  outputFileTracingIncludes: {
    '/*': ['../web-app/dist/*.html'],
  },
  transpilePackages: ['@workspace/ui'],
}

export default nextConfig
