"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedPost } from "@/data/types";
import { createFeedLayout, type ImageDimensions } from "@/lib/feed-layout";
import FeedCard from "./FeedCard";

const BATCH_SIZE = 30;

const MasonryCard = memo(FeedCard);

export default function Feed({ posts }: { posts: FeedPost[] }) {
  const [visibleBatches, setVisibleBatches] = useState(1);
  const [measured, setMeasured] = useState<ReadonlyMap<string, ImageDimensions>>(new Map());
  const batchesRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const focusPostRef = useRef<number | null>(null);
  const layout = useMemo(() => createFeedLayout(posts, measured), [posts, measured]);
  const batchCount = Math.ceil(posts.length / BATCH_SIZE);
  const hasMore = visibleBatches < batchCount;
  const visibleCount = Math.min(visibleBatches * BATCH_SIZE, posts.length);

  const loadMore = useCallback(() => {
    setVisibleBatches((count) => Math.min(count + 1, batchCount));
  }, [batchCount]);

  const recordImageSize = useCallback((id: string, width: number, height: number) => {
    if (!width || !height) return;
    setMeasured(previous => {
      const existing = previous.get(id);
      if (existing?.width === width && existing.height === height) return previous;
      const next = new Map(previous);
      next.set(id, { width, height });
      return next;
    });
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!hasMore || !target || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      // One batch per observation, with enough lead for its images to load.
      observer.disconnect();
      loadMore();
    }, { rootMargin: "1200px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleBatches]);

  useEffect(() => {
    const postIndex = focusPostRef.current;
    if (postIndex === null) return;
    const firstLink = batchesRef.current?.children[postIndex]
      ?.querySelector<HTMLAnchorElement>(".card-image-link");
    firstLink?.focus();
    focusPostRef.current = null;
  }, [visibleBatches]);

  return (
    <section className="pb-6" id="feed">
      {/* Positions depend only on preceding posts, so appending cannot move them. */}
      <div ref={batchesRef} className="feed-batches masonry" style={layout.heights[visibleCount]}>
        {posts.slice(0, visibleCount).map((post, index) => (
          <MasonryCard
            key={post.id}
            post={post}
            priority={index === 0}
            style={layout.cards[index]}
            onImageSize={recordImageSize}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={loadMoreRef} className="feed-load-more">
          <button
            type="button"
            onClick={() => {
              focusPostRef.current = visibleCount;
              loadMore();
            }}
          >
            Load more
          </button>
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing {visibleCount} of {posts.length} posts.
      </p>
    </section>
  );
}
