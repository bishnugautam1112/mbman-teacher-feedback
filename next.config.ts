import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  // @ts-ignore - allowedDevOrigins is valid but NextConfig types might be outdated
  allowedDevOrigins: ['suitor-strict-fraction.ngrok-free.dev', 'localhost:3000'],
  transpilePackages: ["framer-motion"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
