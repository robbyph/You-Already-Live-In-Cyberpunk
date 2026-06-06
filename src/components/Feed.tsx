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
    <section className="pb-6" id="feed">
      <div className="masonry">
        {shuffled.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
