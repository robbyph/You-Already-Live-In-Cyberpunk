"use client";

import { useState, useEffect, useCallback } from "react";
import { FeedPost } from "@/data/types";

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

function isRecent(dateStr: string) {
  const postDate = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < 30;
}

export default function FeedCard({ post }: { post: FeedPost }) {
  const accentClass = getAccentClass(post.id);
  const recent = isRecent(post.date);
  const [revealed, setRevealed] = useState(false);

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
    if (post.link) {
      window.open(post.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`feed-card ${accentClass}${revealed ? " overlay-revealed" : ""}`}
      onClick={handleClick}
    >
      {post.imageUrl ? (
        <div className="card-image-wrap">
          {recent && <div className="new-tag">NEW!</div>}
          <img
            src={post.imageUrl}
            alt={post.description}
            className="w-full block"
            loading="lazy"
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
          {recent && <div className="new-tag">NEW!</div>}
          <p className="text-sm text-center text-soft-white/70 pixel-title">
            {post.description.slice(0, 80)}
            {post.description.length > 80 ? "..." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
