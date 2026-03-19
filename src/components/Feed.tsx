import { FeedPost } from "@/data/types";
import FeedCard from "./FeedCard";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Feed({ posts }: { posts: FeedPost[] }) {
  const shuffled = shuffleArray(posts);

  return (
    <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-10">
      <div className="text-center text-xs text-muted mb-6 select-none">
        <span className="text-hot-pink">[</span>{" "}
        {posts.length} dispatches from the dystopia{" "}
        <span className="text-hot-pink">]</span>
      </div>

      <div className="masonry">
        {shuffled.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>

      <hr className="divider-dots mt-10 mb-6" />
    </section>
  );
}
