import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizeCss: false, 
  },
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;
