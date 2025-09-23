import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    // ensure app dir export works well for our static pages
    reactCompiler: false
  }
};

export default nextConfig;
