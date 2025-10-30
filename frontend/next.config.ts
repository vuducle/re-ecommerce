import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  env: {
    POCKETBASE_URL: process.env.POCKETBASE_URL,
  },
  /* config options here */
  images: {
    domains: [
      // Dynamic domain from environment variable
      new URL(
        process.env.NEXT_PUBLIC_POCKETBASE_URL ??
          'http://127.0.0.1:8090'
      ).hostname,
      // Production domains
      'api.ducworld.com',
      'ducworld.com',
      // Development/testing domains
      '127.0.0.1',
      'localhost',
      // Railway backup (if still needed)
      new URL('https://re-ecommerce-production.up.railway.app')
        .hostname,
    ],
    // Add remote patterns for more flexibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ducworld.com',
        port: '',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'ducworld.com',
        port: '',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
