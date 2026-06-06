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
      imageUrl: entry.localImage
        ? `/api/media/${slug}/${entry.localImage}`
        : "",
      description: entry.description || entry.title,
      link:
        entry.links[0] ||
        (entry.bookmarks[0]?.link ?? undefined),
      tags: entry.tags,
      date: entry.date || "2025-01-01",
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
      <footer className="max-w-[1300px] mx-auto px-4 pb-10 text-center relative z-1">
        <hr className="divider-neon mb-6" />

        {/* ASCII art footer */}
        <pre className="text-[0.45rem] sm:text-[0.55rem] text-muted/40 select-none leading-tight mb-4 overflow-hidden">
{`    ___________________________________________
   /                                           \\
  |  the future is already here --              |
  |  it's just not evenly distributed           |
  |                          - william gibson   |
   \\___________________________________________ /`}
        </pre>

        <div className="divider-glitch mb-4 select-none">
          &#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;&#9617;&#9618;&#9619;&#9608;&#9619;&#9618;&#9617;
        </div>

        <div className="text-[0.55rem] text-muted/25 tracking-widest uppercase pixel-title">
          you didn&apos;t ask for this timeline but here we are
        </div>
      </footer>
    </div>
  );
}
