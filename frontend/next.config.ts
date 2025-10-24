import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  env: {
    POCKETBASE_URL: process.env.POCKETBASE_URL,
  },
  /* config options here */
  images: {
    domains: [
      new URL(
        process.env.NEXT_PUBLIC_POCKETBASE_URL ??
          'http://127.0.0.1:8090'
      ).hostname,
      new URL('https://re-ecommerce-production.up.railway.app')
        .hostname,
    ],
  },
};

export default nextConfig;
