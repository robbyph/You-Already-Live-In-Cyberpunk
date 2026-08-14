import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Entry media is served from the exact Git commit on Vercel. Keeping these
  // files out of server traces prevents the media library from being bundled
  // into every function that reads from Entries at runtime.
  outputFileTracingExcludes: {
    "/*": [
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
