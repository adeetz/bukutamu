import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Add your production domain here
      // {
      //   protocol: 'https',
      //   hostname: 'your-domain.com',
      // },
    ],
    unoptimized: false,
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure Prisma Client is bundled (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
  },
};

export default nextConfig;
