import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma out of Next's server bundle so the `workerd` export condition
  // picks the edge client on Cloudflare and the node client everywhere else.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'daisyui.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
