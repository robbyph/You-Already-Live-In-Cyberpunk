import type { NextConfig } from "next";

const mediaOwner = encodeURIComponent(
  process.env.VERCEL_GIT_REPO_OWNER?.trim() ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER?.trim() ||
    "robbyph",
);
const mediaRepo = encodeURIComponent(
  process.env.VERCEL_GIT_REPO_SLUG?.trim() ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO?.trim() ||
    "You-Already-Live-In-Cyberpunk",
);

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./.generated/image-metadata.json"],
  },
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
    // Keep thumbnail variants bounded, including crisp mobile / Retina sizes.
    deviceSizes: [384, 640, 828, 1080, 1440],
    imageSizes: [256],
    localPatterns: [{ pathname: "/api/media/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: `/${mediaOwner}/${mediaRepo}/**`,
      },
    ],
  },
};

export default nextConfig;
