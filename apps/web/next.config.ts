import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Package boundary: import from @assetflow/* packages, not deep relative paths
  experimental: {
    // future flags go here
  },
};

export default nextConfig;
