// Use the immutable Git source directly on Vercel: the image optimizer cannot
// optimize the redirect returned by our local media route as an image body.
export function getVercelMediaUrl(segments: string[]) {
  if (process.env.VERCEL !== "1") return undefined;

  const owner =
    process.env.VERCEL_GIT_REPO_OWNER?.trim() ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER?.trim() ||
    "robbyph";
  const repo =
    process.env.VERCEL_GIT_REPO_SLUG?.trim() ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO?.trim() ||
    "You-Already-Live-In-Cyberpunk";
  const ref = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || "main";
  const encodedPath = ["Entries", ...segments]
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${encodedPath}`;
}
