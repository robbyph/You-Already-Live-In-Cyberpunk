import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { generateImageMetadata } from "./generate-image-metadata.mjs";

// Real repository images exercise both metadata extraction and byte-for-byte
// publication, without requiring an image encoder in the test environment.
const firstImage = await readFile(new URL("../Entries/003-defective-heart-implant/image.png", import.meta.url));
const replacementImage = await readFile(new URL("../Entries/005-food-delivery-bot-bomb-threat/image.png", import.meta.url));

test("feed image URLs survive text edits and change only for replaced images", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cyberpunk-image-test-"));
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("cyberpunk-image-test-"));
    await rm(resolved, { recursive: true });
  });
  const entryRoot = path.join(root, "Entries", "sample");
  const otherRoot = path.join(root, "Entries", "other");
  await mkdir(entryRoot, { recursive: true });
  await mkdir(otherRoot, { recursive: true });
  for (const directory of [entryRoot, otherRoot]) {
    await writeFile(path.join(directory, "index.json"), JSON.stringify({ image: "image.png", title: "Original" }));
    await writeFile(path.join(directory, "image.png"), firstImage);
  }

  const initial = await generateImageMetadata(root);
  const originalUrl = initial["sample/image.png"].url;
  assert.equal(originalUrl, initial["other/image.png"].url, "identical images share an asset");
  assert.equal(initial["sample/image.png"].version, createHash("sha256").update(firstImage).digest("hex"));
  assert.deepEqual(await readFile(path.join(root, "public", originalUrl)), firstImage);

  await writeFile(path.join(entryRoot, "index.json"), JSON.stringify({ image: "image.png", title: "Edited text" }));
  const textEdit = await generateImageMetadata(root);
  assert.deepEqual(textEdit, initial, "a content-only deploy must preserve image URLs");

  await writeFile(path.join(entryRoot, "image.png"), replacementImage);
  const replaced = await generateImageMetadata(root);
  assert.notEqual(replaced["sample/image.png"].url, originalUrl, "replacing bytes at the same path must update the URL");
  assert.equal(replaced["other/image.png"].url, originalUrl, "another image must keep its cached URL");
  assert.deepEqual(await readFile(path.join(root, "public", replaced["sample/image.png"].url)), replacementImage);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, ".generated", "image-metadata.json"), "utf8")), replaced);

  const assetsRoot = path.join(root, "public", "feed-media");
  await writeFile(path.join(assetsRoot, "keep.txt"), "unrelated file");
  await writeFile(path.join(otherRoot, "index.json"), JSON.stringify({ title: "No image" }));
  await generateImageMetadata(root);
  assert.deepEqual((await readdir(assetsRoot)).sort(), [path.basename(replaced["sample/image.png"].url), "keep.txt"].sort());
});
