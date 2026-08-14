"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  drawStitchedImage,
  encodeCanvas,
  type ImageTransformModalProps,
} from "./image-canvas";
import {
  getRemovedHeight,
  mergeSliceBands,
  normalizeSliceRanges,
  type SliceBand,
} from "./slice-geometry";

type ImageSize = { width: number; height: number };
type EditMode = "edit" | "preview";
type ExistingDragMode = "move" | "resize-start" | "resize-end";

type DragState =
  | {
      mode: "create";
      pointerId: number;
      newId: number;
      startClientY: number;
      startNaturalY: number;
      originalBands: SliceBand[];
    }
  | {
      mode: ExistingDragMode;
      pointerId: number;
      startNaturalY: number;
      originalBand: SliceBand;
      originalBands: SliceBand[];
    };

const primaryButtonStyle = {
  padding: "8px 22px",
  fontSize: 14,
  fontWeight: 600,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
} as const;

const secondaryButtonStyle = {
  padding: "8px 16px",
  fontSize: 14,
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.32)",
  borderRadius: 6,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneBands(bands: readonly SliceBand[]) {
  return bands.map((band) => ({ ...band }));
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : "The image could not be edited.";
}

export default function SliceModal({
  imageUrl,
  extension,
  onApply,
  onCancel,
}: ImageTransformModalProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mountedRef = useRef(true);
  const applyingRef = useRef(false);
  const nextIdRef = useRef(1);
  const dragRef = useRef<DragState | null>(null);
  const draftRef = useRef<SliceBand | null>(null);
  const bandsRef = useRef<SliceBand[]>([]);

  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [bands, setBands] = useState<SliceBand[]>([]);
  const [draft, setDraft] = useState<SliceBand | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<EditMode>("edit");
  const [isDragging, setIsDragging] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBandsSync = useCallback((next: SliceBand[]) => {
    bandsRef.current = next;
    setBands(next);
  }, []);

  const setDraftSync = useCallback((next: SliceBand | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    titleRef.current?.focus();
    return () => {
      mountedRef.current = false;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !applyingRef.current) {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        titleRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === titleRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const normalizedRanges = useMemo(
    () => normalizeSliceRanges(bands, imageSize?.height ?? 0),
    [bands, imageSize?.height]
  );
  const removedHeight = getRemovedHeight(normalizedRanges);
  const outputHeight = imageSize ? imageSize.height - removedHeight : 0;
  const canApply =
    !!imageSize &&
    normalizedRanges.length > 0 &&
    removedHeight > 0 &&
    outputHeight > 0 &&
    !isDragging;
  const selectedBand = bands.find((band) => band.id === selectedId) ?? null;

  const handleImageLoad = useCallback(() => {
    const image = imageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight) {
      setError("The source image has invalid dimensions.");
      return;
    }
    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    setError(null);
  }, []);

  const naturalYFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;
      if (!surface || !imageSize) return null;
      const rect = surface.getBoundingClientRect();
      if (rect.height <= 0) return null;
      return clamp(
        ((event.clientY - rect.top) / rect.height) * imageSize.height,
        0,
        imageSize.height
      );
    },
    [imageSize]
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (
        !imageSize ||
        mode !== "edit" ||
        isApplying ||
        !event.isPrimary ||
        (event.pointerType === "mouse" && event.button !== 0)
      ) {
        return;
      }

      const pointerY = naturalYFromPointer(event);
      if (pointerY === null) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setError(null);
      setIsDragging(true);

      const target = event.target instanceof Element ? event.target : null;
      const bandElement = target?.closest<HTMLElement>("[data-slice-id]");
      const handleElement = target?.closest<HTMLElement>("[data-slice-handle]");
      const bandId = Number(bandElement?.dataset.sliceId);
      const existingBand = Number.isFinite(bandId)
        ? bandsRef.current.find((band) => band.id === bandId)
        : undefined;

      if (existingBand) {
        const handle = handleElement?.dataset.sliceHandle;
        const dragMode: ExistingDragMode =
          handle === "start"
            ? "resize-start"
            : handle === "end"
              ? "resize-end"
              : "move";
        setSelectedId(existingBand.id);
        dragRef.current = {
          mode: dragMode,
          pointerId: event.pointerId,
          startNaturalY: pointerY,
          originalBand: { ...existingBand },
          originalBands: cloneBands(bandsRef.current),
        };
        return;
      }

      const newId = nextIdRef.current++;
      setSelectedId(null);
      setDraftSync(null);
      dragRef.current = {
        mode: "create",
        pointerId: event.pointerId,
        newId,
        startClientY: event.clientY,
        startNaturalY: pointerY,
        originalBands: cloneBands(bandsRef.current),
      };
    },
    [imageSize, isApplying, mode, naturalYFromPointer, setDraftSync]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !imageSize) return;
      const pointerY = naturalYFromPointer(event);
      if (pointerY === null) return;
      event.preventDefault();

      if (drag.mode === "create") {
        if (Math.abs(event.clientY - drag.startClientY) < 3) {
          setDraftSync(null);
          return;
        }
        const start = Math.floor(Math.min(drag.startNaturalY, pointerY));
        const end = Math.ceil(Math.max(drag.startNaturalY, pointerY));
        setDraftSync(
          end > start ? { id: drag.newId, start, end } : null
        );
        return;
      }

      const original = drag.originalBand;
      let nextBand: SliceBand;
      if (drag.mode === "move") {
        const height = original.end - original.start;
        const start = clamp(
          original.start + Math.round(pointerY - drag.startNaturalY),
          0,
          imageSize.height - height
        );
        nextBand = { ...original, start, end: start + height };
      } else if (drag.mode === "resize-start") {
        nextBand = {
          ...original,
          start: clamp(Math.floor(pointerY), 0, original.end - 1),
        };
      } else {
        nextBand = {
          ...original,
          end: clamp(Math.ceil(pointerY), original.start + 1, imageSize.height),
        };
      }

      setBandsSync(
        drag.originalBands.map((band) =>
          band.id === original.id ? nextBand : { ...band }
        )
      );
    },
    [imageSize, naturalYFromPointer, setBandsSync, setDraftSync]
  );

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, cancel: boolean) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !imageSize) return;

      if (cancel) {
        setBandsSync(cloneBands(drag.originalBands));
        setSelectedId(drag.mode === "create" ? null : drag.originalBand.id);
      } else if (drag.mode === "create") {
        const created = draftRef.current;
        if (created) {
          const merged = mergeSliceBands(
            [...drag.originalBands, created],
            imageSize.height,
            created.id
          );
          setBandsSync(merged);
          setSelectedId(created.id);
        }
      } else {
        const merged = mergeSliceBands(
          bandsRef.current,
          imageSize.height,
          drag.originalBand.id
        );
        setBandsSync(merged);
        setSelectedId(
          merged.some((band) => band.id === drag.originalBand.id)
            ? drag.originalBand.id
            : null
        );
      }

      dragRef.current = null;
      setDraftSync(null);
      setIsDragging(false);
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Capture may already have been released by the browser.
      }
    },
    [imageSize, setBandsSync, setDraftSync]
  );

  const deleteSelected = useCallback(() => {
    if (selectedId === null) return;
    setBandsSync(bandsRef.current.filter((band) => band.id !== selectedId));
    setSelectedId(null);
    setError(null);
  }, [selectedId, setBandsSync]);

  const addSlice = useCallback(() => {
    if (!imageSize || imageSize.height <= 1 || isApplying || isDragging) return;
    const id = nextIdRef.current++;
    const bandHeight = Math.min(
      imageSize.height - 1,
      Math.max(1, Math.round(imageSize.height * 0.15))
    );
    const start = Math.floor((imageSize.height - bandHeight) / 2);
    const added = { id, start, end: start + bandHeight };
    const merged = mergeSliceBands(
      [...bandsRef.current, added],
      imageSize.height,
      id
    );
    setBandsSync(merged);
    setSelectedId(id);
    setMode("edit");
    setError(null);
  }, [imageSize, isApplying, isDragging, setBandsSync]);

  const updateSelectedBand = useCallback(
    (edge: "start" | "end", value: number) => {
      if (!imageSize || !selectedBand || !Number.isFinite(value)) return;
      const next =
        edge === "start"
          ? {
              ...selectedBand,
              start: clamp(Math.floor(value), 0, selectedBand.end - 1),
            }
          : {
              ...selectedBand,
              end: clamp(Math.ceil(value), selectedBand.start + 1, imageSize.height),
            };
      const changed = bandsRef.current.map((band) =>
        band.id === selectedBand.id ? next : band
      );
      setBandsSync(mergeSliceBands(changed, imageSize.height, selectedBand.id));
      setError(null);
    },
    [imageSize, selectedBand, setBandsSync]
  );

  const moveSelectedByKeyboard = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>, band: SliceBand) => {
      if (!imageSize) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        setBandsSync(bandsRef.current.filter((item) => item.id !== band.id));
        setSelectedId(null);
        return;
      }
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();
      const height = band.end - band.start;
      const step = event.shiftKey ? 10 : 1;
      const delta = event.key === "ArrowUp" ? -step : step;
      const start = clamp(band.start + delta, 0, imageSize.height - height);
      const moved = { ...band, start, end: start + height };
      const changed = bandsRef.current.map((item) =>
        item.id === band.id ? moved : item
      );
      setBandsSync(mergeSliceBands(changed, imageSize.height, band.id));
    },
    [imageSize, setBandsSync]
  );

  useEffect(() => {
    if (mode !== "preview" || !imageSize) return;
    const image = imageRef.current;
    const canvas = previewCanvasRef.current;
    if (!image || !canvas || !image.complete) return;
    canvas.width = 0;
    canvas.height = 0;
    try {
      drawStitchedImage(image, canvas, normalizedRanges);
      setError(null);
    } catch (previewError) {
      setError(messageFromError(previewError));
    }
  }, [imageSize, mode, normalizedRanges]);

  const applySlices = useCallback(async () => {
    const image = imageRef.current;
    if (!canApply || !image) return;
    applyingRef.current = true;
    setIsApplying(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      drawStitchedImage(image, canvas, normalizedRanges);
      const result = await encodeCanvas(canvas, extension);
      if (mountedRef.current) onApply(result.data, result.extension);
    } catch (applyError) {
      if (mountedRef.current) setError(messageFromError(applyError));
    } finally {
      applyingRef.current = false;
      if (mountedRef.current) setIsApplying(false);
    }
  }, [canApply, extension, normalizedRanges, onApply]);

  const renderedBands = draft ? [...bands, draft] : bands;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slice-dialog-title"
      aria-describedby="slice-dialog-help"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        overflow: "auto",
        background: "rgba(0,0,0,0.9)",
        color: "#fff",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          minHeight: "calc(100vh - 40px)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          id="slice-dialog-title"
          ref={titleRef}
          tabIndex={-1}
          style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}
        >
          Remove horizontal slices
        </h2>
        <p
          id="slice-dialog-help"
          style={{ fontSize: 14, opacity: 0.78, margin: "0 0 12px", textAlign: "center" }}
        >
          Drag vertically to mark full-width bands. Drag a selected band or its top and bottom edges to adjust it.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            aria-pressed={mode === "edit"}
            onClick={() => setMode("edit")}
            disabled={isApplying}
            style={{
              ...secondaryButtonStyle,
              background: mode === "edit" ? "#374151" : "transparent",
              cursor: isApplying ? "not-allowed" : "pointer",
            }}
          >
            Edit
          </button>
          <button
            type="button"
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
            disabled={isApplying || isDragging}
            style={{
              ...secondaryButtonStyle,
              background: mode === "preview" ? "#374151" : "transparent",
              cursor: isApplying || isDragging ? "not-allowed" : "pointer",
            }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={addSlice}
            disabled={!imageSize || imageSize.height <= 1 || isApplying || isDragging}
            style={{
              ...secondaryButtonStyle,
              opacity:
                imageSize && imageSize.height > 1 && !isApplying && !isDragging
                  ? 1
                  : 0.45,
              cursor:
                imageSize && imageSize.height > 1 && !isApplying && !isDragging
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Add slice
          </button>
          <button
            type="button"
            onClick={() => {
              setBandsSync([]);
              setSelectedId(null);
              setError(null);
            }}
            disabled={!bands.length || isApplying || isDragging}
            style={{
              ...secondaryButtonStyle,
              opacity: bands.length && !isApplying && !isDragging ? 1 : 0.45,
              cursor: bands.length && !isApplying && !isDragging ? "pointer" : "not-allowed",
            }}
          >
            Clear all
          </button>
          <span
            aria-live={isDragging ? "off" : "polite"}
            style={{ fontSize: 13, opacity: 0.82 }}
          >
            {normalizedRanges.length} {normalizedRanges.length === 1 ? "slice" : "slices"}
            {imageSize ? ` · ${imageSize.width} × ${outputHeight}px output` : ""}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 120,
            maxHeight: "62vh",
          }}
        >
          <div
            ref={surfaceRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => finishPointer(event, false)}
            onPointerCancel={(event) => finishPointer(event, true)}
            onLostPointerCapture={(event) => {
              if (dragRef.current) finishPointer(event, true);
            }}
            style={{
              position: "relative",
              display: mode === "edit" ? "inline-block" : "none",
              lineHeight: 0,
              userSelect: "none",
              touchAction: "none",
              cursor: isDragging ? "ns-resize" : "crosshair",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Source image being sliced"
              draggable={false}
              onLoad={handleImageLoad}
              onError={() => setError("The source image could not be loaded.")}
              style={{
                display: "block",
                maxWidth: "90vw",
                maxHeight: "58vh",
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
            {imageSize &&
              renderedBands.map((band) => {
                const selected = band.id === selectedId || band.id === draft?.id;
                const top = (band.start / imageSize.height) * 100;
                const height = ((band.end - band.start) / imageSize.height) * 100;
                return (
                  <div
                    key={band.id}
                    data-slice-id={band.id}
                    role="group"
                    tabIndex={draft?.id === band.id ? -1 : 0}
                    aria-label={`Remove rows ${band.start} through ${band.end - 1}`}
                    onFocus={() => setSelectedId(band.id)}
                    onKeyDown={(event) => moveSelectedByKeyboard(event, band)}
                    style={{
                      position: "absolute",
                      zIndex: selected ? 3 : 2,
                      left: 0,
                      right: 0,
                      top: `${top}%`,
                      height: `${height}%`,
                      minHeight: 1,
                      boxSizing: "border-box",
                      background:
                        "repeating-linear-gradient(135deg, rgba(239,68,68,0.48), rgba(239,68,68,0.48) 8px, rgba(127,29,29,0.48) 8px, rgba(127,29,29,0.48) 16px)",
                      borderTop: selected ? "2px solid #fff" : "1px solid #fca5a5",
                      borderBottom: selected ? "2px solid #fff" : "1px solid #fca5a5",
                      cursor: "move",
                      outline: "none",
                    }}
                  >
                    {selected && draft?.id !== band.id && (
                      <>
                        <div
                          data-slice-id={band.id}
                          data-slice-handle="start"
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: -9,
                            height: 18,
                            cursor: "ns-resize",
                          }}
                        />
                        <div
                          data-slice-id={band.id}
                          data-slice-handle="end"
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -9,
                            height: 18,
                            cursor: "ns-resize",
                          }}
                        />
                      </>
                    )}
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        lineHeight: 1,
                        padding: "3px 6px",
                        borderRadius: 3,
                        color: "#fff",
                        background: "rgba(0,0,0,0.68)",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      REMOVE
                    </span>
                  </div>
                );
              })}
          </div>

          <canvas
            ref={previewCanvasRef}
            aria-label="Preview of the stitched image"
            style={{
              display: mode === "preview" ? "block" : "none",
              maxWidth: "90vw",
              maxHeight: "58vh",
              width: "auto",
              height: "auto",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {mode === "edit" && selectedBand && imageSize && (
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Top row
              <input
                type="number"
                min={0}
                max={selectedBand.end - 1}
                value={selectedBand.start}
                onChange={(event) => updateSelectedBand("start", Number(event.target.value))}
                disabled={isApplying || isDragging}
                style={{ width: 100, padding: "6px 8px", borderRadius: 4, border: "1px solid #6b7280" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Bottom row (exclusive)
              <input
                type="number"
                min={selectedBand.start + 1}
                max={imageSize.height}
                value={selectedBand.end}
                onChange={(event) => updateSelectedBand("end", Number(event.target.value))}
                disabled={isApplying || isDragging}
                style={{ width: 120, padding: "6px 8px", borderRadius: 4, border: "1px solid #6b7280" }}
              />
            </label>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={isApplying || isDragging}
              style={{ ...secondaryButtonStyle, color: "#fecaca", cursor: "pointer" }}
            >
              Delete selected
            </button>
          </div>
        )}

        {error && (
          <p role="alert" style={{ color: "#fecaca", fontSize: 13, margin: "12px 0 0" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={applySlices}
            disabled={!canApply || isApplying}
            style={{
              ...primaryButtonStyle,
              opacity: canApply && !isApplying ? 1 : 0.42,
              cursor: canApply && !isApplying ? "pointer" : "not-allowed",
            }}
          >
            {isApplying ? "Applying…" : "Apply Slices"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isApplying}
            style={{
              ...secondaryButtonStyle,
              opacity: isApplying ? 0.45 : 1,
              cursor: isApplying ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
