import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Remove custom distDir for Vercel deployment
  // distDir: "build",
  
  // Ensure proper static asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here if needed
  },
};

export default nextConfig;
