import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a stray package-lock.json in the home dir makes turbopack infer C:\Users\rachi as the root
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
