import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./.generated/image-metadata.json"],
  },
  // Feed images are published as static assets during prebuild. Other entry
  // media uses GitHub. Neither library belongs in the server function bundles.
  outputFileTracingExcludes: {
    "/*": [
      "./public/feed-media/**",
      "./Entries/**/*.avif",
      "./Entries/**/*.gif",
      "./Entries/**/*.jpeg",
      "./Entries/**/*.jpg",
      "./Entries/**/*.mp4",
      "./Entries/**/*.png",
      "./Entries/**/*.svg",
      "./Entries/**/*.webp",
    ],
  },
  async headers() {
    return [{
      source: "/feed-media/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=2678400, immutable" }],
    }];
  },
  images: {
    // Feed thumbnails are built ahead of time. Keep runtime optimization off
    // globally, including any future use of next/image elsewhere in the site.
    unoptimized: true,
  },
};

export default nextConfig;
