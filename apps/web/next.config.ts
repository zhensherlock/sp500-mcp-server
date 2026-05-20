import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@workspace/ui'],
}

export default nextConfig
