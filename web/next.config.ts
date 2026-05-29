import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow LinkedIn profile images to load
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "*.licdn.com" },
    ],
  },
  experimental: {
    turbopack: {
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
