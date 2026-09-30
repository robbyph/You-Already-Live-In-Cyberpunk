"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { FeedPost } from "@/data/types";
import ImageModal from "./ImageModal";
import { getImageProps } from "next/image";
import { FEED_IMAGE_SIZES } from "@/lib/feed-images";

const ACCENT_CLASSES = [
  "card-accent-1",
  "card-accent-2",
  "card-accent-3",
  "card-accent-4",
];

function getAccentClass(id: string) {
  const num = parseInt(id, 10) || id.charCodeAt(0);
  return ACCENT_CLASSES[num % ACCENT_CLASSES.length];
}

export default function FeedCard({ post, priority = false, style, onImageSize }: {
  post: FeedPost;
  priority?: boolean;
  style?: CSSProperties;
  onImageSize?: (id: string, width: number, height: number) => void;
}) {
  const accentClass = getAccentClass(post.id);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // These URLs are still rendered into the initial HTML, but are no longer
  // duplicated in the serialized post data sent across the server boundary.
  const thumbnail = post.imageUrl && !thumbnailFailed
    ? getImageProps({
        src: post.imageUrl,
        alt: post.description,
        fill: true,
        sizes: FEED_IMAGE_SIZES,
        quality: 75,
      }).props
    : undefined;

  // Handle images that were cached and loaded before React hydrated
  useEffect(() => {
    const image = imgRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setImgLoaded(true);
      if (!post.imageWidth || !post.imageHeight) {
        onImageSize?.(post.id, image.naturalWidth, image.naturalHeight);
      }
    }
  }, [post.id, post.imageWidth, post.imageHeight, onImageSize]);

  const dismiss = useCallback(() => setRevealed(false), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (!revealed) return;
    const handle = (e: globalThis.MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".feed-card")) dismiss();
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [revealed, dismiss]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Preserve the browser's native open-original behavior for modified clicks.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch && event.detail !== 0 && post.description && post.imageUrl) {
      if (!revealed) {
        setRevealed(true);
        return;
      }
    }

    if (post.imageUrl) {
      // Some browsers do not focus links on pointer clicks. Give the viewer a
      // reliable element to return focus to when it closes.
      event.currentTarget.focus({ preventScroll: true });
      setModalOpen(true);
      return;
    }
  };

  return (
    <>
      <div
        className={`feed-card ${accentClass}${revealed ? " overlay-revealed" : ""}`}
        style={style}
      >
        {post.imageUrl ? (
          <a
            className="card-image-wrap card-image-link"
            href={post.imageUrl}
            onClick={handleClick}
          >
            <img
              ref={imgRef}
              src={thumbnail?.src || post.imageUrl}
              srcSet={thumbnail?.srcSet}
              sizes={thumbnail?.sizes}
              alt={post.description}
              width={post.imageWidth}
              height={post.imageHeight}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              decoding="async"
              className={`w-full h-auto block card-img${priority || imgLoaded ? " card-img-loaded" : ""}`}
              onLoad={(event) => {
                setImgLoaded(true);
                if (!post.imageWidth || !post.imageHeight) {
                  const image = event.currentTarget;
                  onImageSize?.(post.id, image.naturalWidth, image.naturalHeight);
                }
              }}
              onError={() => setThumbnailFailed(true)}
            />
            {post.description && (
              <div className="card-overlay">
                <p className="card-overlay-text">{post.description}</p>
              </div>
            )}
          </a>
        ) : (
          <div className="relative p-4 min-h-[120px] flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, var(--color-card-dark), var(--color-bg-alt))" }}>
            <p className="text-sm text-center text-soft-white/70 pixel-title">
              {post.description.slice(0, 80)}
              {post.description.length > 80 ? "..." : ""}
            </p>
          </div>
        )}
      </div>
      {modalOpen &&
        createPortal(
          <ImageModal
            src={post.imageUrl!}
            alt={post.description}
            onClose={closeModal}
          />,
          document.body,
        )}
    </>
  );
}
