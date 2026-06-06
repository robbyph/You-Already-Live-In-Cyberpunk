"use client";

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

  const inner = (
    <div className={`feed-card ${accentClass}`}>
      {post.imageUrl ? (
        <div className="relative">
          {recent && <div className="new-tag">NEW!</div>}
          <img
            src={post.imageUrl}
            alt={post.description}
            className="w-full block"
            loading="lazy"
          />
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
      <div className="card-body">
        <p className="card-body-text">{post.description}</p>
        {post.link && (
          <div className="mt-2 text-xs pixel-title text-neon-cyan">
            <span className="blink">&gt;</span> read more
          </div>
        )}
      </div>
    </div>
  );

  if (post.link) {
    return (
      <a href={post.link} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {inner}
      </a>
    );
  }

  return inner;
}
