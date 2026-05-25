import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Amplify deploys Next.js as a standalone server — no static export needed.
  // Leave output unset (default) so SSR, Server Actions, and Route Handlers all work.

  // Expose server-side env vars to the SSR runtime.
  // Amplify sets these at build time; this ensures they're bundled into the server bundle.
  env: {
    COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
    COGNITO_USER_POOL_CLIENT_SECRET: process.env.COGNITO_USER_POOL_CLIENT_SECRET,
    DYNAMODB_WAITLIST_TABLE: process.env.DYNAMODB_WAITLIST_TABLE,
    AWS_REGION: process.env.AWS_REGION,
  },

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
