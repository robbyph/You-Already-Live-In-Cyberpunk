"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FeedPost } from "@/data/types";
import ImageModal from "./ImageModal";

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

export default function FeedCard({ post }: { post: FeedPost }) {
  const accentClass = getAccentClass(post.id);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle images that were cached and loaded before React hydrated
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  const dismiss = useCallback(() => setRevealed(false), []);

  useEffect(() => {
    if (!revealed) return;
    const handle = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".feed-card")) dismiss();
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [revealed, dismiss]);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) return;

    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch && post.description && post.imageUrl) {
      if (!revealed) {
        setRevealed(true);
        return;
      }
    }

    if (!isTouch && post.imageUrl) {
      setModalOpen(true);
      return;
    }

    if (post.link) {
      window.open(post.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div
        className={`feed-card ${accentClass}${revealed ? " overlay-revealed" : ""}`}
        onClick={handleClick}
      >
        {post.imageUrl ? (
          <div className="card-image-wrap">
            <img
              ref={imgRef}
              src={post.imageUrl}
              alt={post.description}
              width={post.imageWidth}
              height={post.imageHeight}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`w-full h-auto block card-img${imgLoaded ? " card-img-loaded" : ""}`}
              onLoad={() => setImgLoaded(true)}
            />
            {post.description && (
              <div className="card-overlay">
                <p className="card-overlay-text">{post.description}</p>
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-overlay-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="blink">&gt;</span> read more
                  </a>
                )}
              </div>
            )}
          </div>
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
            onClose={() => setModalOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
