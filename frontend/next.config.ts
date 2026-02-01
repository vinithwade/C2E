import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (matches previous next.config.js)
  experimental: {
    turbo: {
      // Clear cache on issues
      resolveAlias: {},
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
