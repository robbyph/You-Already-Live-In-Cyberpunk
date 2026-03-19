import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "You Already Live In Cyberpunk",
  description:
    "The dystopian future is now. A curated feed from the world they warned us about.",
  openGraph: {
    title: "You Already Live In Cyberpunk",
    description: "The dystopian future is now.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scanlines noise min-h-screen">{children}</body>
    </html>
  );
}
