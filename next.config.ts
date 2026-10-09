import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  env: {
    API_URL: process.env.API_URL || "",
  },
};

export default nextConfig;
