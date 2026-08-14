export type SliceRange = {
  start: number;
  end: number;
};

export type SliceBand = SliceRange & {
  id: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeRange(range: SliceRange, imageHeight: number): SliceRange | null {
  if (
    !Number.isFinite(range.start) ||
    !Number.isFinite(range.end) ||
    !Number.isFinite(imageHeight) ||
    imageHeight <= 0
  ) {
    return null;
  }

  const start = clamp(Math.floor(Math.min(range.start, range.end)), 0, imageHeight);
  const end = clamp(Math.ceil(Math.max(range.start, range.end)), 0, imageHeight);
  return end > start ? { start, end } : null;
}

/**
 * Produces sorted, half-open source-pixel ranges and unions overlap/adjacency.
 */
export function normalizeSliceRanges(
  ranges: readonly SliceRange[],
  imageHeight: number
): SliceRange[] {
  const sorted = ranges
    .map((range) => sanitizeRange(range, imageHeight))
    .filter((range): range is SliceRange => range !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: SliceRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    if (!previous || range.start > previous.end) {
      merged.push({ ...range });
    } else {
      previous.end = Math.max(previous.end, range.end);
    }
  }
  return merged;
}

/**
 * UI variant of range normalization that preserves the actively edited id.
 */
export function mergeSliceBands(
  bands: readonly SliceBand[],
  imageHeight: number,
  preferredId?: number | null
): SliceBand[] {
  const sorted = bands
    .map((band) => {
      const range = sanitizeRange(band, imageHeight);
      return range ? { ...range, id: band.id } : null;
    })
    .filter((band): band is SliceBand => band !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end || a.id - b.id);

  const merged: SliceBand[] = [];
  for (const band of sorted) {
    const previous = merged.at(-1);
    if (!previous || band.start > previous.end) {
      merged.push({ ...band });
      continue;
    }

    previous.end = Math.max(previous.end, band.end);
    if (band.id === preferredId) previous.id = band.id;
  }
  return merged;
}

export function getRemovedHeight(ranges: readonly SliceRange[]) {
  return ranges.reduce((total, range) => total + range.end - range.start, 0);
}

export function getKeptRanges(
  removedRanges: readonly SliceRange[],
  imageHeight: number
): SliceRange[] {
  const removed = normalizeSliceRanges(removedRanges, imageHeight);
  const kept: SliceRange[] = [];
  let cursor = 0;

  for (const range of removed) {
    if (range.start > cursor) kept.push({ start: cursor, end: range.start });
    cursor = range.end;
  }
  if (cursor < imageHeight) kept.push({ start: cursor, end: imageHeight });
  return kept;
}
