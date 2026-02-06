import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_TICKETS_URL: process.env.NEXT_PUBLIC_TICKETS_URL,
  },
  experimental: {

    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
