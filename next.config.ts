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
    minimumCacheTTL: 2678400, // 31 days; replaced images get a new content hash.
    // Keep thumbnail variants bounded, including crisp mobile / Retina sizes.
    deviceSizes: [384, 640, 828, 1080, 1440],
    imageSizes: [256],
    localPatterns: [
      { pathname: "/feed-media/**", search: "" },
      { pathname: "/api/media/**" },
    ],
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
