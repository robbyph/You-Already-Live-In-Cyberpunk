"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedPost } from "@/data/types";
import FeedCard from "./FeedCard";

const BATCH_SIZE = 30;

const FeedBatch = memo(function FeedBatch({
  posts,
  first,
}: {
  posts: FeedPost[];
  first: boolean;
}) {
  return (
    <div className="masonry">
      {posts.map((post, index) => (
        <FeedCard key={post.id} post={post} priority={first && index === 0} />
      ))}
    </div>
  );
});

export default function Feed({ posts }: { posts: FeedPost[] }) {
  const [visibleBatches, setVisibleBatches] = useState(1);
  const batchesRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const focusBatchRef = useRef<number | null>(null);
  const batches = useMemo(() => {
    const result: FeedPost[][] = [];
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      result.push(posts.slice(i, i + BATCH_SIZE));
    }
    return result;
  }, [posts]);
  const hasMore = visibleBatches < batches.length;
  const visibleCount = Math.min(visibleBatches * BATCH_SIZE, posts.length);

  const loadMore = useCallback(() => {
    setVisibleBatches((count) => Math.min(count + 1, batches.length));
  }, [batches.length]);

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
    const batchIndex = focusBatchRef.current;
    if (batchIndex === null) return;
    const firstLink = batchesRef.current?.children[batchIndex]
      ?.querySelector<HTMLAnchorElement>(".card-image-link");
    firstLink?.focus();
    focusBatchRef.current = null;
  }, [visibleBatches]);

  return (
    <section className="pb-6" id="feed">
      {/* Separate column containers keep earlier cards in place on append. */}
      <div ref={batchesRef} className="feed-batches">
        {batches.slice(0, visibleBatches).map((batch, index) => (
          <FeedBatch key={index} posts={batch} first={index === 0} />
        ))}
      </div>
      {hasMore && (
        <div ref={loadMoreRef} className="feed-load-more">
          <button
            type="button"
            onClick={() => {
              focusBatchRef.current = visibleBatches;
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
