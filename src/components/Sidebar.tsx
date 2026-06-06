"use client";

import { useEffect, useState } from "react";
import BadgeWall from "./BadgeWall";

const STATUSES = [
  "doom-scrolling the dystopia",
  "extremely cyberpunk rn",
  "watching robot dogs on youtube",
  "reading about brain chips",
  "questioning reality (again)",
  "the algorithm knows im here",
];

export default function Sidebar() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setVisitorCount(Math.floor(Math.random() * 90000) + 13337);
    setStatus(STATUSES[Math.floor(Math.random() * STATUSES.length)]);
  }, []);

  return (
    <aside className="page-sidebar">
      {/* ═══ ABOUT ═══ */}
      <div className="sidebar-panel pixel-border-pink">
        <div className="sidebar-panel-title">
          &#9670; what is this?
        </div>
        <p className="text-xs text-soft-white/70 leading-relaxed">
          a carefully curated collection of news, images, and other media snippets, offering an insight into our present cyberpunk circumstances.
        </p>
        <p className="text-xs text-muted mt-2">
          Cyberpunk is High Tech, High Inequality
        </p>
        <div className="mt-3 text-[0.6rem] text-muted/50">
          curated by a human (for now)
        </div>
      </div>

      {/* ═══ LINKS ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-cyan)", borderStyle: "solid" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-neon-cyan)" }}>
          &#9670; cool links
        </div>
        <div className="text-xs flex flex-col gap-1 text-muted">
          <span>&#9733; <a href="https://interconnection.neocities.org/" target="_blank" rel="noopener noreferrer">interconnection.neocities.org</a></span>
          <span>&#9733; <a href="https://www.massline.org/" target="_blank" rel="noopener noreferrer">massline.org</a></span>
          <span>&#9733; <a href="https://bannedthought.net/" target="_blank" rel="noopener noreferrer">bannedthought.net</a></span>
          <span>&#9733; <a href="https://artificial-art.neocities.org//" target="_blank" rel="noopener noreferrer">artificial-art.neocities.org</a></span>
        </div>
      </div>
    </aside>
  );
}
