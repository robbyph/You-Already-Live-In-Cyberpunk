import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

// Originals are excluded from Vercel functions. Preserve their dimensions and
// content versions as a small build artifact so lazy images reserve their space.
const root = process.cwd();
const entriesRoot = path.join(root, "Entries");
const metadata = {};
for (const directory of await readdir(entriesRoot, { withFileTypes: true })) {
  if (!directory.isDirectory() || directory.name.startsWith(".")) continue;
  const entryRoot = path.join(entriesRoot, directory.name);
  let entry;
  try {
    entry = JSON.parse(
      (await readFile(path.join(entryRoot, "index.json"), "utf8")).replace(/^\uFEFF/, ""),
    );
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  if (!entry.image) continue;
  const buffer = await readFile(path.join(entryRoot, entry.image));
  const { width, height } = imageSize(buffer);
  metadata[`${directory.name}/${entry.image}`] = {
    width,
    height,
    version: createHash("sha256").update(buffer).digest("hex").slice(0, 12),
  };
}

const output = path.join(root, ".generated");
await mkdir(output, { recursive: true });
await writeFile(path.join(output, "image-metadata.json"), JSON.stringify(metadata));
console.log(`Saved dimensions for ${Object.keys(metadata).length} feed images.`);
