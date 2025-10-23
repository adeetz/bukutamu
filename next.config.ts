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
    unoptimized: true, // Set to true to avoid optimization issues with R2
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure Prisma binaries are included in Vercel deployment
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
  },
};

export default nextConfig;
