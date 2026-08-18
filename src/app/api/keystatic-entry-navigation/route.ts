import { readdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const entriesDirectory = path.join(process.cwd(), "Entries");
  const directoryEntries = await readdir(entriesDirectory, {
    withFileTypes: true,
  });
  const slugs = directoryEntries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);

  return NextResponse.json({ slugs });
}
