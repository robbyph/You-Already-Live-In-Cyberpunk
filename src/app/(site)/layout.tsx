import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOU ALREADY LIVE IN CYBERPUNK",
  description:
    "A collection of proof that the dystopian future is now. Updated whenever reality gets too cyberpunk.",
  openGraph: {
    title: "YOU ALREADY LIVE IN CYBERPUNK",
    description: "The dystopia is now. Here's the proof.",
    type: "website",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
