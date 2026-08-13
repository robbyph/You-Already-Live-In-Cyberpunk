import Header from "@/components/Header";
import Feed from "@/components/Feed";
import Sidebar from "@/components/Sidebar";
import FooterGlitch from "@/components/FooterGlitch";
import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import { FeedPost } from "@/data/types";
import path from "path";
import { readFileSync } from "fs";
import sizeOf from "image-size";
import { connection } from "next/server";

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getImageDimensions(slug: string, filename: string) {
  try {
    const filePath = path.join(process.cwd(), "Entries", slug, filename);
    const buffer = readFileSync(filePath);
    const { width, height } = sizeOf(buffer);
    return { width, height };
  } catch {
    return { width: undefined, height: undefined };
  }
}

export default async function Home() {
  // Generate a new order for each visit instead of baking one into the build.
  await connection();

  const reader = createReader(process.cwd(), config);
  const allEntries = await reader.collections.entries.all();

  const posts: FeedPost[] = shuffle(allEntries)
    .map(({ slug, entry }) => {
      const dims = entry.image
        ? getImageDimensions(slug, entry.image)
        : { width: undefined, height: undefined };
      return {
        id: slug,
        imageUrl: entry.image
          ? `/api/media/${slug}/${entry.image}`
          : "",
        imageWidth: dims.width,
        imageHeight: dims.height,
        description: entry.description || entry.title,
      };
    })
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
