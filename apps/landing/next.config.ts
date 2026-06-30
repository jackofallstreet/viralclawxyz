import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@viralclaw/ui", "@viralclaw/utils"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
