import { FeedPost } from "@/data/types";
import FeedCard from "./FeedCard";

const DIVIDER_TEXTS = [
  "·····:·····:·····:·····:·····:·····:·····:·····",
  ">>---> SIGNAL CONTINUES --->-->-->",
  "░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
  "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=",
];

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

  // Insert dividers every 5 cards
  const elements: React.ReactNode[] = [];
  shuffled.forEach((post, i) => {
    elements.push(<FeedCard key={post.id} post={post} />);
    if ((i + 1) % 5 === 0 && i < shuffled.length - 1) {
      elements.push(
        <div key={`divider-${i}`} className="break-inside-avoid mb-4">
          <hr className="divider-neon mb-2" />
          <div className="divider-glitch">
            {DIVIDER_TEXTS[Math.floor(Math.random() * DIVIDER_TEXTS.length)]}
          </div>
          <hr className="divider-neon mt-2" />
        </div>
      );
    }
  });

  return (
    <section className="pb-6" id="feed">
      <div className="text-center text-xs text-muted mb-4 select-none pixel-title">
        <span className="text-hot-pink">[</span>{" "}
        {posts.length} dispatches from the dystopia{" "}
        <span className="text-hot-pink">]</span>
      </div>

      <div className="masonry">
        {elements}
      </div>
    </section>
  );
}
