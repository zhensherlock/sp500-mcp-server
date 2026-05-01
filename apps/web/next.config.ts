import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@workspace/ui'],
}

export default nextConfig
