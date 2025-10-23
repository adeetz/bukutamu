import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Add your production domain here
      // {
      //   protocol: 'https',
      //   hostname: 'your-domain.com',
      // },
    ],
    // Allow images from our own API routes
    unoptimized: false,
    domains: ['localhost'],
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure Prisma Client is bundled
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
};

export default nextConfig;
