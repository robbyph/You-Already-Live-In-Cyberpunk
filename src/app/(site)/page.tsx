import Header from "@/components/Header";
import Feed from "@/components/Feed";
import Sidebar from "@/components/Sidebar";
import FooterGlitch from "@/components/FooterGlitch";
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
        <FooterGlitch />
      </footer>
    </div>
  );
}
