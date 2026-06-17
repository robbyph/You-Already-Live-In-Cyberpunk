import { FeedPost } from "@/data/types";
import FeedCard from "./FeedCard";

export default function Feed({ posts }: { posts: FeedPost[] }) {
  return (
    <section className="pb-6" id="feed">
      <div className="masonry">
        {posts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
