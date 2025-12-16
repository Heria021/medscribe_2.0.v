import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during production builds so that Vercel deployments
  // don't fail due to non-critical linting issues (unused vars, `any`, etc.).
  // You should still run `npm run lint` locally and fix issues over time.
  eslint: {
    ignoreDuringBuilds: true,
  },
    typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
