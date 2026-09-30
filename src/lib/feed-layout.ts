import type { CSSProperties } from "react";
import type { FeedPost } from "@/data/types";

const GAP = 12;
const REFERENCE_COLUMN_WIDTH = 320;

type Column = { ratio: number; pixels: number };
type LayoutStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ImageDimensions = { width: number; height: number };

// Vertical percentage margins/padding resolve against the container's width.
// This reserves the correct positions before hydration at every screen width.
function offset(column: Column, count: number) {
  const percent = (column.ratio / count) * 100;
  const pixels = column.pixels - (column.ratio * GAP * (count - 1)) / count;
  return `calc(${percent.toFixed(8)}% + ${pixels.toFixed(8)}px)`;
}

export function createFeedLayout(
  posts: FeedPost[],
  measured: ReadonlyMap<string, ImageDimensions> = new Map(),
) {
  const cards: LayoutStyle[] = posts.map(() => ({}));
  const heights: LayoutStyle[] = Array.from({ length: posts.length + 1 }, () => ({}));

  for (const count of [2, 3]) {
    const columns: Column[] = Array.from({ length: count }, () => ({ ratio: 0, pixels: 0 }));
    heights[0][`--feed-height-${count}`] = "0px";

    posts.forEach((post, index) => {
      const columnIndex = columns.reduce((shortest, column, candidate) =>
        column.ratio * REFERENCE_COLUMN_WIDTH + column.pixels <
        columns[shortest].ratio * REFERENCE_COLUMN_WIDTH + columns[shortest].pixels
          ? candidate : shortest, 0);
      const column = columns[columnIndex];
      cards[index][`--feed-column-${count}`] = columnIndex;
      cards[index][`--feed-top-${count}`] = offset(column, count);

      const dimensions = measured.get(post.id);
      const width = dimensions?.width ?? post.imageWidth;
      const height = dimensions?.height ?? post.imageHeight;
      if (post.imageUrl) {
        column.ratio += width && height ? height / width : 1;
      } else {
        column.pixels += 120;
      }
      column.pixels += GAP;
      heights[index + 1][`--feed-height-${count}`] =
        `max(${columns.map(item => offset(item, count)).join(", ")})`;
    });
  }

  return { cards, heights };
}
