import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOU ALREADY LIVE IN CYBERPUNK",
  description:
    "A curated collection of news, images, and everyday evidence that you already live in cyberpunk.",
  openGraph: {
    title: "YOU ALREADY LIVE IN CYBERPUNK",
    description: "High Tech, High Inequality. Dystopia is Now!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
