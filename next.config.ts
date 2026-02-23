import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Add empty turbopack config to silence the webpack/turbopack warning
  turbopack: {},
};

export default nextConfig;
