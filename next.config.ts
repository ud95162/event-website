import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone server for lean VPS deploys
  output: "standalone",
};

export default nextConfig;
