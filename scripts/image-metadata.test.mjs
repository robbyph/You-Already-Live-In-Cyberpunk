import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { generateImageMetadata } from "./generate-image-metadata.mjs";

// Real feed images exercise text-heavy thumbnail compression as well as
// byte-for-byte publication of the originals.
const firstImage = await readFile(new URL("../Entries/003-defective-heart-implant/image.png", import.meta.url));
const replacementImage = await readFile(new URL("../Entries/005-food-delivery-bot-bomb-threat/image.png", import.meta.url));

async function temporaryRoot(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "cyberpunk-image-test-"));
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("cyberpunk-image-test-"));
    await rm(resolved, { recursive: true });
  });
  return root;
}

function thumbnailCandidates(image) {
  return image.thumbnail.srcSet.split(", ").map(candidate => {
    const [url, descriptor] = candidate.split(" ");
    return { url, width: Number(descriptor.slice(0, -1)) };
  });
}

test("feed image URLs survive text edits and change only for replaced images", async (t) => {
  const root = await temporaryRoot(t);
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
  const candidates = thumbnailCandidates(initial["sample/image.png"]);
  assert.ok(candidates.length > 1);
  for (const { url, width } of candidates) {
    const file = path.join(root, "public", url);
    const encoded = await sharp(await readFile(file)).metadata();
    assert.equal(encoded.format, "webp");
    assert.equal(encoded.width, width, "srcset descriptors must match actual pixel widths");
    assert.ok(Math.abs(encoded.height - initial["sample/image.png"].height * width / initial["sample/image.png"].width) <= 1);
  }
  const thumbnailPath = path.join(root, "public", initial["sample/image.png"].thumbnail.src);
  assert.ok((await stat(thumbnailPath)).size < firstImage.length, "feed thumbnail should reduce download size");
  const oldTime = new Date("2020-01-01T00:00:00Z");
  await utimes(thumbnailPath, oldTime, oldTime);

  await writeFile(path.join(entryRoot, "index.json"), JSON.stringify({ image: "image.png", title: "Edited text" }));
  const textEdit = await generateImageMetadata(root);
  assert.deepEqual(textEdit, initial, "a content-only deploy must preserve image URLs");
  assert.equal((await stat(thumbnailPath)).mtimeMs, oldTime.getTime(), "unchanged thumbnails should not be regenerated");

  await writeFile(path.join(entryRoot, "image.png"), replacementImage);
  const replaced = await generateImageMetadata(root);
  assert.notEqual(replaced["sample/image.png"].url, originalUrl, "replacing bytes at the same path must update the URL");
  assert.notEqual(replaced["sample/image.png"].thumbnail.srcSet, initial["sample/image.png"].thumbnail.srcSet);
  assert.equal(replaced["other/image.png"].url, originalUrl, "another image must keep its cached URL");
  assert.deepEqual(await readFile(path.join(root, "public", replaced["sample/image.png"].url)), replacementImage);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, ".generated", "image-metadata.json"), "utf8")), replaced);

  const assetsRoot = path.join(root, "public", "feed-media");
  await writeFile(path.join(assetsRoot, "keep.txt"), "unrelated file");
  await writeFile(path.join(otherRoot, "index.json"), JSON.stringify({ title: "No image" }));
  await generateImageMetadata(root);
  const expected = [path.basename(replaced["sample/image.png"].url), "keep.txt",
    ...thumbnailCandidates(replaced["sample/image.png"]).map(image => path.basename(image.url))];
  assert.deepEqual((await readdir(assetsRoot)).sort(), expected.sort());
});

test("small transparent images are not upscaled and rotated photos retain their orientation", async (t) => {
  const root = await temporaryRoot(t);
  const fixtures = {
    small: await sharp({ create: { width: 80, height: 40, channels: 4, background: "#00ff0080" } }).png().toBuffer(),
    rotated: await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#0044ff" } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer(),
  };
  for (const [slug, image] of Object.entries(fixtures)) {
    const directory = path.join(root, "Entries", slug);
    await mkdir(directory, { recursive: true });
    const filename = slug === "rotated" ? "image.jpg" : "image.png";
    await writeFile(path.join(directory, filename), image);
    await writeFile(path.join(directory, "index.json"), JSON.stringify({ image: filename }));
  }
  const images = await generateImageMetadata(root);
  assert.deepEqual(thumbnailCandidates(images["small/image.png"]).map(image => image.width), [80]);
  const small = await sharp(await readFile(path.join(root, "public", images["small/image.png"].thumbnail.src))).metadata();
  assert.equal(small.height, 40);
  assert.equal(small.hasAlpha, true);
  const rotated = images["rotated/image.jpg"];
  assert.equal(rotated.width, 800);
  assert.equal(rotated.height, 1200);
  assert.deepEqual(thumbnailCandidates(rotated).map(image => image.width), [384, 640, 800]);
  const thumbnail = await sharp(await readFile(path.join(root, "public", rotated.thumbnail.src))).metadata();
  assert.equal(thumbnail.width, 640);
  assert.equal(thumbnail.height, 960);
  assert.equal(thumbnail.orientation, undefined, "rotation should be baked into the pixels");
});
