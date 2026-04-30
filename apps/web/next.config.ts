import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // transpilePackages: ['@workspace/ui', '@workspace/shared'],
}

export default nextConfig
