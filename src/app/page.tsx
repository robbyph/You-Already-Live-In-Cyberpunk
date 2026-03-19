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

      {/* ═══ NEOCITIES-STYLE FOOTER ═══ */}
      <footer className="max-w-4xl mx-auto px-4 pb-12 text-center">
        {/* Button wall */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="badge-btn">BEST VIEWED AT 2AM</span>
          <span className="badge-btn text-hot-pink">MADE WITH INSOMNIA</span>
          <span className="badge-btn text-lime">NO COOKIES (ironic)</span>
          <span className="badge-btn text-neon-cyan">WEB 1.0 FOREVER</span>
          <span className="badge-btn text-neon-yellow">RESIST THE ALGO</span>
        </div>

        {/* About blurb */}
        <div className="border-2 dashed border-muted/30 p-4 mb-6 text-left max-w-lg mx-auto text-sm text-soft-white/70"
          style={{ borderStyle: "dashed" }}
        >
          <div className="pixel-title text-neon-cyan text-base mb-2">
            wtf is this?
          </div>
          <p>
            a collection of news, images, and observations proving we already
            live in the cyberpunk future sci-fi warned us about. updated whenever
            something makes me go &quot;oh no, this is literally cyberpunk.&quot;
          </p>
          <p className="mt-2 text-muted text-xs">
            curated by a human (for now)
          </p>
        </div>

        {/* ASCII art footer */}
        <pre className="text-[0.45rem] sm:text-[0.55rem] text-muted/40 select-none leading-tight mb-4 overflow-hidden">
{`
    ___________________________________________
   /                                           \\
  |  the future is already here --              |
  |  it's just not evenly distributed           |
  |                          - william gibson   |
   \\___________________________________________ /
`}
        </pre>

        <div className="text-[0.6rem] text-muted/30 tracking-widest uppercase pixel-title">
          you didn&apos;t ask for this timeline but here we are
        </div>
      </footer>
    </main>
  );
}
