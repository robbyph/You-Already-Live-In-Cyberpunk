import Header from "@/components/Header";
import Feed from "@/components/Feed";
import Sidebar from "@/components/Sidebar";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import { FeedPost } from "@/data/types";

export default async function Home() {
  const reader = createReader(process.cwd(), config);
  const allEntries = await reader.collections.entries.all();

  const posts: FeedPost[] = allEntries
    .map(({ slug, entry }) => ({
      id: slug,
      imageUrl: entry.image
        ? `/api/media/${slug}/${entry.image}`
        : "",
      description: entry.description || entry.title,
      link: entry.link || undefined,
    }))
    .filter((post) => post.imageUrl || post.description);

  return (
    <div>
      <Header />

      <div className="page-layout">
        <div className="page-main">
          <Feed posts={posts} />
        </div>
        <Sidebar />
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="max-w-[1300px] mx-auto px-4 pb-5 text-center relative z-1">
        <hr className="divider-neon mb-6" />

        <div className="divider-glitch mt-12 mb-2 select-none">
          <div className="glitch-row" style={{fontSize: '0.6rem', opacity: 0.25}}>&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9618;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9619;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9618;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;</div>
          <div className="glitch-row" style={{fontSize: '0.9rem', opacity: 0.35}}>&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;</div>
          <div className="glitch-row" style={{fontSize: '1.4rem', opacity: 0.45}}>&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;</div>
          <div className="glitch-row" style={{fontSize: '0.9rem', opacity: 0.35}}>&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;</div>
          <div className="glitch-row" style={{fontSize: '0.6rem', opacity: 0.25}}>&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9619;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;&#9618;&#9617;&#9617;&#9619;&#9617;&#9617;&#9618;&#9617;&#9617;&#9617;</div>
        </div>

                {/* ASCII art footer */}
        <pre className="text-[0.65rem] sm:text-[0.8rem] text-muted/70 select-none leading-tight mb-4 overflow-hidden">
{`    ___________________________________________
   /                                           \\
  |  the future is already here --              |
  |  it's just not evenly distributed           |
  |                          - william gibson   |
   \\___________________________________________ /`}
        </pre>

      </footer>
    </div>
  );
}
