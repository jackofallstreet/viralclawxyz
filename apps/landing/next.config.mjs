/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@viralclaw/ui", "@viralclaw/utils"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
