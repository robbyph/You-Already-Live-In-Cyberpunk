import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getVercelMediaUrl } from "@/lib/media";

const MIME_TYPES: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  const filePath = path.join(process.cwd(), "Entries", ...segments);

  // Prevent path traversal
  const resolved = path.resolve(filePath);
  const entriesRoot = path.resolve(process.cwd(), "Entries");
  const relativePath = path.relative(entriesRoot, resolved);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return new NextResponse("Unsupported file type", { status: 415 });
  }

  const vercelMediaUrl = getVercelMediaUrl(segments);
  if (vercelMediaUrl) {
    const response = NextResponse.redirect(vercelMediaUrl, 307);
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    return response;
  }

  try {
    const buffer = await readFile(resolved);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
