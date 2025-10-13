import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      new URL(
        process.env.NEXT_PUBLIC_POCKETBASE_URL ??
          'http://127.0.0.1:8090'
      ).hostname,
    ],
  },
};

export default nextConfig;
