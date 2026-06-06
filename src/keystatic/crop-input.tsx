"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type ImageValue = {
  data: Uint8Array;
  extension: string;
  filename: string;
} | null;

type Crop = { x: number; y: number; w: number; h: number };

function useObjectURL(data: Uint8Array | null, extension?: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (data) {
      const type = extension === "svg" ? "image/svg+xml" : undefined;
      const objectUrl = URL.createObjectURL(
        new Blob([data.buffer as ArrayBuffer], type ? { type } : undefined)
      );
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setUrl(null);
  }, [data, extension]);
  return url;
}

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

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
  crop: Crop
): Handle | null {
  const handles = handlePositions(crop);
  const threshold = 10;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (img) {
      setCrop({ x: 0, y: 0, w: img.clientWidth, h: img.clientHeight });
    }
  }, []);

  const relPos = useCallback((e: React.MouseEvent) => {
    const r = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - r.left, r.width)),
      y: Math.max(0, Math.min(e.clientY - r.top, r.height)),
    };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!crop) return;
      e.preventDefault();
      const p = relPos(e);

      const handle = hitTestHandle(p, crop);
      if (handle) {
        setDrag({
          mode: "resize",
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
        setDrag({
          mode: "move",
          startX: p.x,
          startY: p.y,
          origCrop: { ...crop },
        });
      }
    },
    [crop, relPos]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!crop) return;
      const p = relPos(e);

      if (drag.mode === "none") {
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

  const onMouseUp = useCallback(() => {
    setDrag(DRAG_IDLE);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!crop || crop.w < 5 || crop.h < 5 || !imgRef.current) return;
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext("2d")!.drawImage(
      img,
      Math.round(crop.x * scaleX),
      Math.round(crop.y * scaleY),
      sw,
      sh,
      0,
      0,
      sw,
      sh
    );

    const outExt = extension === "svg" ? "png" : extension;
    const mime = MIME_MAP[outExt] ?? "image/png";
    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), mime, 0.92)
    );
    onApply(new Uint8Array(await blob.arrayBuffer()), outExt);
  }, [crop, extension, onApply]);

  const valid = crop && crop.w >= 5 && crop.h >= 5;
  const handles = crop ? handlePositions(crop) : null;
  const hs = HANDLE_SIZE;

  return (
    <div
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
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          position: "relative",
          cursor,
          maxWidth: "90vw",
          maxHeight: "70vh",
          lineHeight: 0,
          userSelect: "none",
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
          onClick={applyCrop}
          disabled={!valid}
          style={{
            padding: "8px 22px",
            fontSize: 14,
            fontWeight: 600,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            opacity: valid ? 1 : 0.4,
            cursor: valid ? "pointer" : "not-allowed",
          }}
        >
          Apply Crop
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 22px",
            fontSize: 14,
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
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
  const [cropping, setCropping] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const objectUrl = useObjectURL(value?.data ?? null, value?.extension);

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
    const data = new Uint8Array(await file.arrayBuffer());
    const ext = file.name.match(/\.([^.]+)$/)?.[1] ?? "";
    onChange({ data, extension: ext, filename: file.name });
  };

  const onCropApply = (data: Uint8Array, ext: string) => {
    if (!value) return;
    onChange({ ...value, data, extension: ext });
    setCropping(false);
  };

  const showError =
    (forceValidation || blurred) && validation?.isRequired && value === null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          onClick={pickFile}
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
        {value && (
          <button
            onClick={() => {
              onChange(null);
              setBlurred(true);
            }}
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
            onClick={() => setCropping(true)}
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

      {cropping && objectUrl && value && (
        <CropModal
          imageUrl={objectUrl}
          extension={value.extension}
          onApply={onCropApply}
          onCancel={() => setCropping(false)}
        />
      )}
    </div>
  );
}
