import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/feed-layout.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { createFeedLayout } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const posts = Array.from({ length: 95 }, (_, index) => ({
  id: String(index),
  imageUrl: `/image-${index}.png`,
  imageWidth: 300 + (index % 4) * 73,
  imageHeight: 80 + (index * 197) % 1500,
  description: `Post ${index}`,
}));

function resolveOffset(value, width) {
  const [, percent, pixels] = value.match(/^calc\(([-\d.]+)% \+ ([-\d.]+)px\)$/);
  return Number(percent) * width / 100 + Number(pixels);
}

test("appending batches never changes positions already assigned", () => {
  const complete = createFeedLayout(posts);
  for (const length of [1, 30, 60, 90, 95]) {
    const partial = createFeedLayout(posts.slice(0, length));
    assert.deepEqual(partial.cards, complete.cards.slice(0, length));
    assert.deepEqual(partial.heights[length], complete.heights[length]);
  }
});

test("all columns keep a 12px gap through every batch boundary and fit the container", () => {
  const layout = createFeedLayout(posts);
  for (const count of [2, 3]) {
    for (const width of [593, 736, 892, 958, 992]) {
      const columnWidth = (width - (count - 1) * 12) / count;
      const bottoms = Array(count).fill(-12);
      posts.forEach((post, index) => {
        const style = layout.cards[index];
        const column = style[`--feed-column-${count}`];
        const top = resolveOffset(style[`--feed-top-${count}`], width);
        assert.ok(Math.abs(top - bottoms[column] - 12) < 0.0001, `gap before ${index} at ${width}px/${count} columns`);
        bottoms[column] = top + columnWidth * post.imageHeight / post.imageWidth;

        const height = Math.max(...layout.heights[index + 1][`--feed-height-${count}`]
          .match(/calc\([^)]*\)/g).map(value => resolveOffset(value, width)));
        assert.ok(Math.abs(height - Math.max(...bottoms) - 12) < 0.0001, `container after ${index}`);
      });
    }
  }
});

test("empty feeds and measured fallback images have valid layouts", () => {
  assert.deepEqual(createFeedLayout([]), {
    cards: [], heights: [{ "--feed-height-2": "0px", "--feed-height-3": "0px" }],
  });
  const missing = posts.map(post => ({ ...post, imageWidth: undefined, imageHeight: undefined }));
  const measured = new Map(posts.map(post => [post.id, { width: post.imageWidth, height: post.imageHeight }]));
  assert.deepEqual(createFeedLayout(missing, measured), createFeedLayout(posts));
});

test("text-only posts reserve their 120px card height", () => {
  const layout = createFeedLayout(Array.from({ length: 12 }, (_, index) => ({
    id: String(index), imageUrl: "", description: "Text only",
  })));
  for (const count of [2, 3]) {
    assert.equal(resolveOffset(layout.cards[count][`--feed-top-${count}`], 900), 132);
  }
});
