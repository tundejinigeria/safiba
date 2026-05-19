import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Amplify deploys Next.js as a standalone server — no static export needed.
  // Leave output unset (default) so SSR, Server Actions, and Route Handlers all work.

  images: {
    remotePatterns: [
      // Add image domains here as needed (e.g. S3 bucket for missing persons photos)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
