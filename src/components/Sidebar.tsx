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
          a carefully curated collection of news, images, and other media snippets, offering an insight into our current cyberpunk circumstances.
        </p>
        <p className="text-xs text-muted mt-2">
          High Tech, High Inequality
        </p>
        <div className="mt-3 text-[0.6rem] text-muted/50">
          fuck israel
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

      {/* ═══ LINKS ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-cyan)", borderStyle: "solid" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-neon-cyan)" }}>
          &#9670; check out
        </div>
        <div className="text-xs flex flex-col gap-1 text-muted">
          <strong>Texts</strong>
          <span >&#9733; Principles of Communism</span>
          <span>&#9733; Towards a New Socialism</span>
          <span>&#9733; Cybernetic Revolutionaries</span>
          <span>&#9733; How Not to Network a Nation</span>
          <span>&#9733; Cyber-Marx</span>
          <span>&#9733; Cyber-Proletariat</span>
          <span className="pb-1">&#9733; The Dispossessed</span>
          <strong>Games</strong>
          <span >&#9733; Disco Elysium</span>
          <span className="pb-1">&#9733; Deus Ex</span>
          <strong>Film</strong>
          <span >&#9733; Ghost in the Shell</span>
          <span className="pb-1">&#9733; Akira</span>
          <strong>Television</strong>
          <span className="pb-1">&#9733; Severance</span>
        </div>
      </div>
    </aside>
  );
}
