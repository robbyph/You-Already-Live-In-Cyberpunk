import Header from "@/components/Header";
import Feed from "@/components/Feed";
import feedData from "@/data/feed.json";
import { FeedPost } from "@/data/types";

export default function Home() {
  const posts = feedData as FeedPost[];

  return (
    <main>
      <Header />
      <Feed posts={posts} />
      <footer className="text-center py-8 text-text-muted/40 text-xs uppercase tracking-widest font-mono">
        <div className="h-[1px] max-w-xs mx-auto mb-4 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
        the future is already here — it&apos;s just not evenly distributed
      </footer>
    </main>
  );
}
