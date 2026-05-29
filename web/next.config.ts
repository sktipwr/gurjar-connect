import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LinkedIn profile images to load
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "*.licdn.com" },
    ],
  },
};

export default nextConfig;
