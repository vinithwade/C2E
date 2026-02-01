/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration
  experimental: {
    turbo: {
      // Clear cache on issues
      resolveAlias: {},
    },
  },
};

module.exports = nextConfig;
