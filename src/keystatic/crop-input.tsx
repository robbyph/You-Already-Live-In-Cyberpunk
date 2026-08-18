"use client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";
import SliceModal from "./slice-modal";
import {
  encodeCanvas,
  getSourceMimeType,
  prepareCanvas,
  replaceFileExtension,
} from "./image-canvas";

type ImageValue = {
  data: Uint8Array;
  extension: string;
  filename: string;
} | null;

type Crop = { x: number; y: number; w: number; h: number };

const IMAGE_EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/x-icon": "ico",
};

function getImageExtension(file: Blob & { name?: string }) {
  const extensionFromName = file.name
    ?.match(/\.([a-zA-Z0-9]+)$/)?.[1]
    .toLowerCase();
  return IMAGE_EXTENSIONS_BY_MIME_TYPE[file.type] ?? extensionFromName ?? null;
}

async function toImageValue(
  file: Blob & { name?: string },
  fallbackName = "pasted-image"
): Promise<NonNullable<ImageValue>> {
  const extension = getImageExtension(file);
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("The clipboard does not contain an image.");
  }

  if (!extension) {
    throw new Error("That image format is not supported.");
  }

  const filename = file.name?.trim() || `${fallbackName}.${extension}`;
  return {
    data: new Uint8Array(await file.arrayBuffer()),
    extension,
    filename: replaceFileExtension(filename, extension),
  };
}

function useObjectURL(data: Uint8Array | null, extension?: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (data) {
      const type = getSourceMimeType(extension);
      const start = data.byteOffset;
      const end = start + data.byteLength;
      const bytes = data.buffer.slice(start, end) as ArrayBuffer;
      const objectUrl = URL.createObjectURL(
        new Blob([bytes], type ? { type } : undefined)
      );
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setUrl(null);
  }, [data, extension]);
  return url;
}

// --- Crop Modal ---

type Handle = "tl" | "t" | "tr" | "r" | "br" | "b" | "bl" | "l";

const HANDLE_SIZE = 10;
const MIN_CROP = 20;

const HANDLE_CURSORS: Record<Handle, string> = {
  tl: "nwse-resize",
  tr: "nesw-resize",
  bl: "nesw-resize",
  br: "nwse-resize",
  t: "ns-resize",
  b: "ns-resize",
  l: "ew-resize",
  r: "ew-resize",
};

function handlePositions(c: Crop) {
  return {
    tl: { x: c.x, y: c.y },
    t: { x: c.x + c.w / 2, y: c.y },
    tr: { x: c.x + c.w, y: c.y },
    r: { x: c.x + c.w, y: c.y + c.h / 2 },
    br: { x: c.x + c.w, y: c.y + c.h },
    b: { x: c.x + c.w / 2, y: c.y + c.h },
    bl: { x: c.x, y: c.y + c.h },
    l: { x: c.x, y: c.y + c.h / 2 },
  };
}

function hitTestHandle(
  pos: { x: number; y: number },
  crop: Crop,
  threshold = 10
): Handle | null {
  const handles = handlePositions(crop);
  for (const [key, hp] of Object.entries(handles)) {
    if (
      Math.abs(pos.x - hp.x) <= threshold &&
      Math.abs(pos.y - hp.y) <= threshold
    ) {
      return key as Handle;
    }
  }
  return null;
}

function computeResize(
  handle: Handle,
  mx: number,
  my: number,
  orig: Crop,
  maxW: number,
  maxH: number
): Crop {
  const origRight = orig.x + orig.w;
  const origBottom = orig.y + orig.h;
  let { x, y, w, h } = orig;

  const left = handle === "tl" || handle === "l" || handle === "bl";
  const right = handle === "tr" || handle === "r" || handle === "br";
  const top = handle === "tl" || handle === "t" || handle === "tr";
  const bottom = handle === "bl" || handle === "b" || handle === "br";

  if (left) {
    x = Math.max(0, Math.min(mx, origRight - MIN_CROP));
    w = origRight - x;
  } else if (right) {
    w = Math.max(MIN_CROP, Math.min(mx - orig.x, maxW - orig.x));
  }

  if (top) {
    y = Math.max(0, Math.min(my, origBottom - MIN_CROP));
    h = origBottom - y;
  } else if (bottom) {
    h = Math.max(MIN_CROP, Math.min(my - orig.y, maxH - orig.y));
  }

  return { x, y, w, h };
}

type DragState = {
  mode: "none" | "move" | "resize";
  pointerId?: number;
  startX: number;
  startY: number;
  origCrop: Crop;
  handle?: Handle;
};

const DRAG_IDLE: DragState = {
  mode: "none",
  startX: 0,
  startY: 0,
  origCrop: { x: 0, y: 0, w: 0, h: 0 },
};

function CropModal({
  imageUrl,
  extension,
  onApply,
  onCancel,
}: {
  imageUrl: string;
  extension: string;
  onApply: (data: Uint8Array, extension: string) => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [cursor, setCursor] = useState("default");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const applyingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !applyingRef.current) {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (img) {
      setCrop({ x: 0, y: 0, w: img.clientWidth, h: img.clientHeight });
    }
  }, []);

  const relPos = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const r = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - r.left, r.width)),
      y: Math.max(0, Math.min(e.clientY - r.top, r.height)),
    };
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (
        !crop ||
        isApplying ||
        !e.isPrimary ||
        (e.pointerType === "mouse" && e.button !== 0)
      ) {
        return;
      }
      e.preventDefault();
      const p = relPos(e);
      const threshold = e.pointerType === "mouse" ? 10 : 24;

      const handle = hitTestHandle(p, crop, threshold);
      if (handle) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({
          mode: "resize",
          pointerId: e.pointerId,
          startX: p.x,
          startY: p.y,
          origCrop: { ...crop },
          handle,
        });
        return;
      }

      if (
        p.x >= crop.x &&
        p.x <= crop.x + crop.w &&
        p.y >= crop.y &&
        p.y <= crop.y + crop.h
      ) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({
          mode: "move",
          pointerId: e.pointerId,
          startX: p.x,
          startY: p.y,
          origCrop: { ...crop },
        });
      }
    },
    [crop, isApplying, relPos]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!crop) return;
      const p = relPos(e);

      if (drag.mode === "none") {
        if (e.pointerType !== "mouse") return;
        const handle = hitTestHandle(p, crop);
        if (handle) {
          setCursor(HANDLE_CURSORS[handle]);
        } else if (
          p.x >= crop.x &&
          p.x <= crop.x + crop.w &&
          p.y >= crop.y &&
          p.y <= crop.y + crop.h
        ) {
          setCursor("move");
        } else {
          setCursor("default");
        }
        return;
      }
      if (drag.pointerId !== e.pointerId) return;

      e.preventDefault();

      if (drag.mode === "resize" && drag.handle) {
        const r = containerRef.current!.getBoundingClientRect();
        setCrop(
          computeResize(drag.handle, p.x, p.y, drag.origCrop, r.width, r.height)
        );
      } else if (drag.mode === "move") {
        const r = containerRef.current!.getBoundingClientRect();
        const dx = p.x - drag.startX;
        const dy = p.y - drag.startY;
        setCrop({
          ...drag.origCrop,
          x: Math.max(
            0,
            Math.min(drag.origCrop.x + dx, r.width - drag.origCrop.w)
          ),
          y: Math.max(
            0,
            Math.min(drag.origCrop.y + dy, r.height - drag.origCrop.h)
          ),
        });
      }
    },
    [crop, drag, relPos]
  );

  const finishPointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.pointerId !== e.pointerId) return;
    setDrag(DRAG_IDLE);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Capture may already have been released by the browser.
    }
  }, [drag.pointerId]);

  const applyCrop = useCallback(async () => {
    if (!crop || crop.w < 5 || crop.h < 5 || !imgRef.current) return;
    const img = imgRef.current;
    applyingRef.current = true;
    setIsApplying(true);
    setError(null);

    try {
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;
      const sx = Math.max(0, Math.floor(crop.x * scaleX));
      const sy = Math.max(0, Math.floor(crop.y * scaleY));
      const right = Math.min(
        img.naturalWidth,
        Math.ceil((crop.x + crop.w) * scaleX)
      );
      const bottom = Math.min(
        img.naturalHeight,
        Math.ceil((crop.y + crop.h) * scaleY)
      );
      const sw = right - sx;
      const sh = bottom - sy;

      const canvas = document.createElement("canvas");
      const context = prepareCanvas(canvas, sw, sh);
      context.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const result = await encodeCanvas(canvas, extension);
      onApply(result.data, result.extension);
    } catch (cropError) {
      if (mountedRef.current) {
        setError(
          cropError instanceof Error
            ? cropError.message
            : "The image could not be cropped."
        );
      }
    } finally {
      applyingRef.current = false;
      if (mountedRef.current) setIsApplying(false);
    }
  }, [crop, extension, onApply]);

  const valid = crop && crop.w >= 5 && crop.h >= 5;
  const handles = crop ? handlePositions(crop) : null;
  const hs = HANDLE_SIZE;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Crop image"
      tabIndex={-1}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        padding: 20,
      }}
    >
      <p
        style={{ color: "#fff", fontSize: 14, marginBottom: 12, opacity: 0.75 }}
      >
        Drag edges or corners to crop. Drag inside to reposition.
      </p>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onLostPointerCapture={(event) => {
          if (drag.pointerId === event.pointerId) setDrag(DRAG_IDLE);
        }}
        style={{
          position: "relative",
          cursor,
          maxWidth: "90vw",
          maxHeight: "70vh",
          lineHeight: 0,
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          draggable={false}
          onLoad={onImgLoad}
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "70vh",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
        {crop && crop.w > 0 && crop.h > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: crop.x,
                top: crop.y,
                width: crop.w,
                height: crop.h,
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                pointerEvents: "none",
              }}
            />
            {handles &&
              (Object.entries(handles) as [Handle, { x: number; y: number }][]).map(
                ([key, pos]) => (
                  <div
                    key={key}
                    style={{
                      position: "absolute",
                      left: pos.x - hs / 2,
                      top: pos.y - hs / 2,
                      width: hs,
                      height: hs,
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.4)",
                      borderRadius: 1,
                      pointerEvents: "none",
                    }}
                  />
                )
              )}
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={applyCrop}
          disabled={!valid || isApplying}
          style={{
            padding: "8px 22px",
            fontSize: 14,
            fontWeight: 600,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            opacity: valid && !isApplying ? 1 : 0.4,
            cursor: valid && !isApplying ? "pointer" : "not-allowed",
          }}
        >
          {isApplying ? "Applying…" : "Apply Crop"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isApplying}
          style={{
            padding: "8px 22px",
            fontSize: 14,
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6,
            opacity: isApplying ? 0.4 : 1,
            cursor: isApplying ? "not-allowed" : "pointer",
          }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: "#fecaca", fontSize: 13, marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}

// --- Field Input ---

export default function ImageWithCropInput({
  value,
  onChange,
  forceValidation,
  label,
  description,
  validation,
}: {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  autoFocus: boolean;
  forceValidation: boolean;
  label: string;
  description?: string;
  validation?: { isRequired?: boolean };
}) {
  const [activeEditor, setActiveEditor] = useState<"crop" | "slice" | null>(null);
  const [blurred, setBlurred] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const objectUrl = useObjectURL(value?.data ?? null, value?.extension);

  const applyImage = useCallback(
    async (file: Blob & { name?: string }, fallbackName?: string) => {
      try {
        onChange(await toImageValue(file, fallbackName));
        setInputError(null);
      } catch (error) {
        setInputError(
          error instanceof Error ? error.message : "The image could not be added."
        );
      }
    },
    [onChange]
  );

  const pickFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    const file = await new Promise<File | null>((res) => {
      input.onchange = () => res(input.files?.[0] ?? null);
      input.click();
    });
    document.body.removeChild(input);
    if (!file) return;
    await applyImage(file);
  };

  const pasteFromClipboard = async () => {
    if (!navigator.clipboard?.read) {
      setInputError(
        "Clipboard access is unavailable here. Focus this field and press Ctrl+V or Cmd+V."
      );
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          await applyImage(await item.getType(imageType));
          return;
        }
      }
      setInputError("The clipboard does not contain an image.");
    } catch (error) {
      setInputError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Clipboard access was denied. Focus this field and press Ctrl+V or Cmd+V."
          : "The clipboard image could not be read."
      );
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (activeEditor !== null) return;
    const image = Array.from(event.clipboardData.items)
      .find((item) => item.kind === "file" && item.type.startsWith("image/"))
      ?.getAsFile();
    if (!image) return;

    event.preventDefault();
    void applyImage(image);
  };

  const onEditApply = (data: Uint8Array, ext: string) => {
    if (!value) return;
    onChange({
      ...value,
      data,
      extension: ext,
      filename: replaceFileExtension(value.filename, ext),
    });
    setActiveEditor(null);
  };

  const showError =
    (forceValidation || blurred) && validation?.isRequired && value === null;

  return (
    <div
      onPaste={handlePaste}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <span style={{ fontSize: 14, fontWeight: 500 }}>
        {label}
        {validation?.isRequired && (
          <span style={{ color: "#dc2626" }}> *</span>
        )}
      </span>

      {description && (
        <span style={{ fontSize: 13, opacity: 0.7 }}>{description}</span>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={pickFile}
          disabled={activeEditor !== null}
          style={{
            padding: "4px 14px",
            fontSize: 14,
            background: "none",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Choose file
        </button>
        <button
          type="button"
          onClick={pasteFromClipboard}
          disabled={activeEditor !== null}
          title="You can also focus this image field and press Ctrl+V or Cmd+V"
          style={{
            padding: "4px 14px",
            fontSize: 14,
            background: "none",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Paste image
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setBlurred(true);
            }}
            disabled={activeEditor !== null}
            style={{
              padding: "4px 14px",
              fontSize: 14,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => setActiveEditor("crop")}
            disabled={activeEditor !== null}
            style={{
              padding: "4px 14px",
              fontSize: 14,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Crop
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => setActiveEditor("slice")}
            disabled={activeEditor !== null}
            style={{
              padding: "4px 14px",
              fontSize: 14,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Slice
          </button>
        )}
      </div>

      {objectUrl && (
        <div
          style={{
            alignSelf: "flex-start",
            padding: 4,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
          }}
        >
          <img
            src={objectUrl}
            alt=""
            style={{ display: "block", maxHeight: 200, maxWidth: "100%" }}
          />
        </div>
      )}

      {showError && (
        <span style={{ fontSize: 13, color: "#dc2626" }}>
          {label} is required
        </span>
      )}

      {inputError && (
        <span role="alert" style={{ fontSize: 13, color: "#dc2626" }}>
          {inputError}
        </span>
      )}

      {activeEditor === "crop" && objectUrl && value && (
        <CropModal
          imageUrl={objectUrl}
          extension={value.extension}
          onApply={onEditApply}
          onCancel={() => setActiveEditor(null)}
        />
      )}
      {activeEditor === "slice" && objectUrl && value && (
        <SliceModal
          imageUrl={objectUrl}
          extension={value.extension}
          onApply={onEditApply}
          onCancel={() => setActiveEditor(null)}
        />
      )}
    </div>
  );
}
