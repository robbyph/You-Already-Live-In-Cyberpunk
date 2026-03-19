"use client";

import { FeedPost } from "@/data/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
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
      <div className="text-[0.65rem] uppercase tracking-widest text-neon-magenta mb-2 font-display">
        {post.source}
      </div>
      <h3 className="text-lg font-bold mb-2 text-text-primary group-hover:text-neon-cyan transition-colors leading-tight">
        {post.title}
      </h3>
      {post.description && (
        <p className="text-sm text-text-muted leading-relaxed">
          {post.description}
        </p>
      )}
      <div className="mt-3 text-[0.6rem] uppercase tracking-widest text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
        Read more &rarr;
      </div>
    </a>
  );
}

function ImageCard({ post }: { post: FeedPost & { type: "image" } }) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-sm mb-3">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold text-white drop-shadow-lg">
            {post.title}
          </h3>
        </div>
      </div>
      {post.description && (
        <p className="text-xs text-text-muted leading-relaxed">
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
      <h3
        className={`font-display font-bold mb-2 leading-tight ${
          isShort ? "text-xl text-neon-cyan glow-cyan" : "text-base text-text-primary"
        }`}
      >
        {post.title}
      </h3>
      <p
        className={`leading-relaxed ${
          isShort
            ? "text-base text-text-primary"
            : "text-sm text-text-muted"
        }`}
      >
        {post.content}
      </p>
    </div>
  );
}

function EmbedCard({ post }: { post: FeedPost & { type: "embed" } }) {
  return (
    <div>
      <h3 className="text-base font-bold mb-3 text-text-primary leading-tight">
        {post.title}
      </h3>
      {post.embedType === "youtube" && (
        <div className="relative w-full pb-[56.25%] mb-3">
          <iframe
            src={post.embedUrl}
            className="absolute inset-0 w-full h-full rounded-sm"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
      {post.description && (
        <p className="text-xs text-text-muted leading-relaxed">
          {post.description}
        </p>
      )}
    </div>
  );
}

export default function FeedCard({ post }: { post: FeedPost }) {
  const accentColors: Record<string, string> = {
    link: "border-neon-cyan/30 hover:border-neon-cyan/60",
    image: "border-neon-magenta/30 hover:border-neon-magenta/60",
    text: "border-neon-yellow/30 hover:border-neon-yellow/60",
    embed: "border-neon-purple/30 hover:border-neon-purple/60",
  };

  return (
    <article
      className={`bg-cyber-card border ${accentColors[post.type]} rounded-sm p-4 card-glow transition-all duration-300 glitch-hover`}
    >
      {post.type === "link" && <LinkCard post={post} />}
      {post.type === "image" && <ImageCard post={post} />}
      {post.type === "text" && <TextCard post={post} />}
      {post.type === "embed" && <EmbedCard post={post} />}

      <div className="flex flex-wrap gap-2 mt-3">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2 text-[0.6rem] text-text-muted/50 uppercase tracking-widest">
        {formatDate(post.date)}
      </div>
    </article>
  );
}
