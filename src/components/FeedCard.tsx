"use client";

import { FeedPost } from "@/data/types";

const ACCENT_CLASSES = [
  "card-accent-1",
  "card-accent-2",
  "card-accent-3",
  "card-accent-4",
  "card-accent-5",
  "card-accent-6",
];

function getAccentClass(id: string) {
  const num = parseInt(id, 10) || id.charCodeAt(0);
  return ACCENT_CLASSES[num % ACCENT_CLASSES.length];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
  });
}

function LinkCard({ post }: { post: FeedPost & { type: "link" } }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="text-xs text-muted mb-1">
        src: <span className="text-neon-orange">{post.source}</span>
      </div>
      <h3 className="pixel-title text-xl sm:text-2xl leading-tight mb-2 group-hover:text-hot-pink transition-colors"
        style={{ color: "var(--accent)" }}
      >
        {post.title}
      </h3>
      {post.description && (
        <p className="text-sm text-soft-white/80 leading-relaxed">
          {post.description}
        </p>
      )}
      <div className="mt-3 text-xs pixel-title">
        <span className="blink text-lime">&gt;&gt;&gt;</span>{" "}
        <span className="text-neon-cyan group-hover:text-hot-pink">
          [ CLICK TO READ ]
        </span>{" "}
        <span className="blink text-lime">&lt;&lt;&lt;</span>
      </div>
    </a>
  );
}

function ImageCard({ post }: { post: FeedPost & { type: "image" } }) {
  return (
    <div>
      <div className="overflow-hidden mb-2">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full object-cover hue-rotate-bg"
          loading="lazy"
        />
      </div>
      <h3 className="pixel-title text-lg" style={{ color: "var(--accent)" }}>
        {post.title}
      </h3>
      {post.description && (
        <p className="text-xs text-soft-white/70 mt-1 leading-relaxed">
          {post.description}
        </p>
      )}
    </div>
  );
}

function TextCard({ post }: { post: FeedPost & { type: "text" } }) {
  const isShort = post.content.length < 100;
  return (
    <div>
      <div className="text-xs text-lime mb-2 select-none">
        {"> "}system.broadcast()
      </div>
      <h3
        className={`pixel-title mb-2 leading-tight ${
          isShort
            ? "text-2xl sm:text-3xl rainbow-text"
            : "text-lg"
        }`}
        style={isShort ? undefined : { color: "var(--accent)" }}
      >
        {post.title}
      </h3>
      <p
        className={`leading-relaxed ${
          isShort
            ? "text-base text-soft-white"
            : "text-sm text-soft-white/80"
        }`}
      >
        {post.content}
      </p>
      {isShort && (
        <div className="mt-2 text-right text-xs text-muted select-none">
          <span className="blink">_</span>
        </div>
      )}
    </div>
  );
}

function EmbedCard({ post }: { post: FeedPost & { type: "embed" } }) {
  return (
    <div>
      <div className="text-[0.6rem] text-neon-purple pixel-title mb-1 tracking-widest select-none">
        &#9612;&#9615; TRANSMISSION INCOMING &#9615;&#9612;
      </div>
      <h3 className="pixel-title text-lg mb-2" style={{ color: "var(--accent)" }}>
        {post.title}
      </h3>
      {post.embedType === "youtube" && (
        <div className="relative w-full pb-[56.25%] mb-2 border-2 border-neon-purple/50">
          <iframe
            src={post.embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
      {post.description && (
        <p className="text-xs text-soft-white/70 leading-relaxed">
          {post.description}
        </p>
      )}
    </div>
  );
}

export default function FeedCard({ post }: { post: FeedPost }) {
  const accentClass = getAccentClass(post.id);
  const cardTypeClass = `card-${post.type}`;

  return (
    <article className={`feed-card ${cardTypeClass} ${accentClass}`}>
      {post.type === "link" && <LinkCard post={post} />}
      {post.type === "image" && <ImageCard post={post} />}
      {post.type === "text" && <TextCard post={post} />}
      {post.type === "embed" && <EmbedCard post={post} />}

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2 text-[0.6rem] text-muted/60 pixel-title tracking-wider">
        {formatDate(post.date)}
      </div>
    </article>
  );
}
