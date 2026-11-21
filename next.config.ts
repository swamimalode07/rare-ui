import type { NextConfig } from "next";

const PUBLIC_CACHE = [
  {
    key: "Cache-Control",
    value: "public, max-age=345600, stale-while-revalidate=604800",
  },
];

const IMMUTABLE_CACHE = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  // these routes read files at runtime, which the tracer cannot see
  outputFileTracingIncludes: {
    "/r/pro/*": ["./registry/pro/**/*"],
    "/api/source": ["./components/pro/**/*", "./lib/utils.ts"],
  },
  async headers() {
    return [
      {
        source: "/:dir(logos|assets|fonts)/:path*",
        headers: PUBLIC_CACHE,
      },
      // rename a video when replacing it, browsers will never refetch the same url
      { source: "/componentdemos/:path*", headers: IMMUTABLE_CACHE },
      { source: "/ogimage.webp", headers: PUBLIC_CACHE },
    ];
  },
};

export default nextConfig;
