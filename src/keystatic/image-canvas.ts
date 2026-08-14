import { getKeptRanges, normalizeSliceRanges, type SliceRange } from "./slice-geometry";

export type ImageTransformResult = {
  data: Uint8Array;
  extension: string;
};

export type ImageTransformModalProps = {
  imageUrl: string;
  extension: string;
  onApply: (data: Uint8Array, extension: string) => void;
  onCancel: () => void;
};

const SOURCE_MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

function cleanExtension(extension: string) {
  return extension.trim().toLowerCase().replace(/^\./, "");
}

export function getSourceMimeType(extension?: string) {
  return extension ? SOURCE_MIME_TYPES[cleanExtension(extension)] : undefined;
}

export function replaceFileExtension(filename: string, extension: string) {
  const clean = cleanExtension(extension) || "png";
  const dot = filename.lastIndexOf(".");
  const basename = dot > 0 ? filename.slice(0, dot) : filename;
  return `${basename}.${clean}`;
}

export function prepareCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("The edited image has invalid dimensions.");
  }

  try {
    canvas.width = width;
    canvas.height = height;
  } catch {
    throw new Error("This image is too large for the browser to edit.");
  }

  if (canvas.width !== width || canvas.height !== height) {
    throw new Error("This image is too large for the browser to edit.");
  }

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  return context;
}

export function drawStitchedImage(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  removedRanges: readonly SliceRange[]
) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) throw new Error("The source image has not finished loading.");

  const removed = normalizeSliceRanges(removedRanges, height);
  const kept = getKeptRanges(removed, height);
  const outputHeight = kept.reduce(
    (total, range) => total + range.end - range.start,
    0
  );
  if (outputHeight <= 0) {
    throw new Error("Slices must leave at least one row of the image.");
  }

  const context = prepareCanvas(canvas, width, outputHeight);
  let destinationY = 0;
  for (const range of kept) {
    const segmentHeight = range.end - range.start;
    context.drawImage(
      image,
      0,
      range.start,
      width,
      segmentHeight,
      0,
      destinationY,
      width,
      segmentHeight
    );
    destinationY += segmentHeight;
  }

  if (destinationY !== outputHeight) {
    throw new Error("The sliced image could not be assembled correctly.");
  }
  return { width, height: outputHeight };
}

function detectEncodedExtension(data: Uint8Array) {
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return "png";
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "jpeg";
  }
  if (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...data.slice(8, 12)) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  sourceExtension: string
): Promise<ImageTransformResult> {
  const source = cleanExtension(sourceExtension);
  const requestedExtension = ["png", "jpg", "jpeg", "webp"].includes(source)
    ? source
    : "png";
  const requestedMime =
    requestedExtension === "jpg" || requestedExtension === "jpeg"
      ? "image/jpeg"
      : `image/${requestedExtension}`;
  const quality = requestedMime === "image/jpeg" || requestedMime === "image/webp"
    ? 0.92
    : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("The browser could not encode the edited image."));
        },
        requestedMime,
        quality
      );
    } catch {
      reject(new Error("The browser could not encode the edited image."));
    }
  });

  const data = new Uint8Array(await blob.arrayBuffer());
  const detected = detectEncodedExtension(data);
  if (!detected) throw new Error("The browser returned an unsupported image format.");

  const extension =
    detected === "jpeg" && requestedExtension === "jpg" ? "jpg" : detected;
  return { data, extension };
}
