import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@viralclaw/ui",
    "@viralclaw/utils",
    "@viralclaw/core",
    "@viralclaw/agents",
  ],
};

export default nextConfig;
