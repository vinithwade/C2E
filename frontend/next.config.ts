import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  // (Next 16 uses `turbopack`, not `experimental.turbo`)
  turbopack: {
    resolveAlias: {},
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
