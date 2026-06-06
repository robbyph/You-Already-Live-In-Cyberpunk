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
          &#9670; wtf is this?
        </div>
        <p className="text-xs text-soft-white/70 leading-relaxed">
          a collection of news, images, and observations proving we
          already live in the cyberpunk future sci-fi warned us about.
        </p>
        <p className="text-xs text-muted mt-2">
          updated whenever something makes me go
          &quot;oh no, this is literally cyberpunk.&quot;
        </p>
        <div className="mt-3 text-[0.6rem] text-muted/50">
          curated by a human (for now)
        </div>
      </div>

      {/* ═══ STATUS ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-cyan)", borderStyle: "dashed" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-neon-cyan)" }}>
          &#9670; current status
        </div>
        <div className="text-xs">
          <span className="text-deep-rose">mood:</span>{" "}
          <span className="text-neon-cyan">{status}</span>
        </div>
        <div className="text-xs mt-1">
          <span className="text-deep-rose">visitors:</span>{" "}
          <span className="text-neon-cyan pixel-title text-sm">{visitorCount.toLocaleString()}</span>
        </div>
        <div className="text-xs mt-1">
          <span className="text-hot-pink blink">&#9679;</span>{" "}
          <span className="text-neon-cyan text-[0.7rem]">LIVE FEED</span>
        </div>
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-purple)", borderStyle: "double" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-purple)", borderColor: "var(--color-neon-purple)" }}>
          &#9670; navigate
        </div>
        <div className="text-xs flex flex-col gap-1">
          <span className="text-neon-cyan">&#9654; <a href="#top" className="no-underline text-neon-cyan hover:text-hot-pink" style={{ textDecoration: "dashed underline" }}>back to top</a></span>
          <span className="text-neon-cyan">&#9654; <a href="#feed" className="no-underline text-neon-cyan hover:text-hot-pink" style={{ textDecoration: "dashed underline" }}>the feed</a></span>
          <span className="text-neon-cyan">&#9654; <a href="#badges" className="no-underline text-neon-cyan hover:text-hot-pink" style={{ textDecoration: "dashed underline" }}>badges</a></span>
        </div>
      </div>

      {/* ═══ BADGES ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-hot-pink)", borderStyle: "ridge" }} id="badges">
        <div className="sidebar-panel-title" style={{ color: "var(--color-hot-pink)", borderColor: "var(--color-hot-pink)" }}>
          &#9670; badges
        </div>
        <BadgeWall />
      </div>

      {/* ═══ WEBRING ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-purple)", borderStyle: "dotted" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-purple)", borderColor: "var(--color-neon-purple)" }}>
          &#9670; webring
        </div>
        <div className="webring-nav">
          <span className="webring-arrow">&laquo;</span>
          <span className="text-xs text-muted">dystopia ring</span>
          <span className="webring-arrow">&raquo;</span>
        </div>
        <div className="text-[0.55rem] text-center text-muted/40 mt-1">
          [ placeholder ]
        </div>
      </div>

      {/* ═══ LINKS ═══ */}
      <div className="sidebar-panel" style={{ borderColor: "var(--color-neon-cyan)", borderStyle: "solid" }}>
        <div className="sidebar-panel-title" style={{ color: "var(--color-neon-cyan)", borderColor: "var(--color-neon-cyan)" }}>
          &#9670; cool links
        </div>
        <div className="text-xs flex flex-col gap-1 text-muted">
          <span>&#9733; <a href="https://neocities.org" target="_blank" rel="noopener noreferrer">neocities.org</a></span>
          <span>&#9733; <a href="https://yesterweb.org" target="_blank" rel="noopener noreferrer">yesterweb.org</a></span>
          <span>&#9733; <a href="https://wiby.me" target="_blank" rel="noopener noreferrer">wiby.me</a></span>
        </div>
      </div>
    </aside>
  );
}
