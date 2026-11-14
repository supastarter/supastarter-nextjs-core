import type { NextConfig } from "next";

import "./src/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/api"],
};

export default nextConfig;
