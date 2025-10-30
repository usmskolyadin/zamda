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
  webpack: (config) => {
    config.module.rules.push({
      test: /leaflet\/.*\.(png|jpg|jpeg|gif|svg)$/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
