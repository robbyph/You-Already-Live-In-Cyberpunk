"use client";

import { useEffect, useRef, useState } from "react";
import BadgeWall from "./BadgeWall";

const SIDEBAR_CELL_W = 65;
const SIDEBAR_CELL_H = 80;

type StarPos = { x: number; y: number; char: string; delay: number; size: number };

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

  const starsRef = useRef<HTMLDivElement>(null);
  const [sidebarStars, setSidebarStars] = useState<StarPos[]>([]);
  const [fieldHeight, setFieldHeight] = useState(0);

  useEffect(() => {
    setVisitorCount(Math.floor(Math.random() * 90000) + 13337);
    setStatus(STATUSES[Math.floor(Math.random() * STATUSES.length)]);
  }, []);

  useEffect(() => {
    const starsEl = starsRef.current;
    const main = starsEl?.closest('.page-layout')?.querySelector('.page-main');
    const feed = main?.firstElementChild;
    if (!starsEl || !main || !feed) return;
    let prevGrid = '';
    const measure = () => {
      const lastPost = feed.lastElementChild;
      if (!lastPost) return;
      const contentBottom = lastPost.getBoundingClientRect().bottom;
      const starsTop = starsEl.getBoundingClientRect().top;
      const available = Math.max(0, contentBottom - starsTop);
      if (available <= 0) return;

      setFieldHeight(available);

      const sidebarWidth = starsEl.getBoundingClientRect().width || 260;
      const cols = Math.max(1, Math.floor(sidebarWidth / SIDEBAR_CELL_W));
      const rows = Math.max(1, Math.floor(available / SIDEBAR_CELL_H));
      const gridKey = `${cols}x${rows}`;
      if (gridKey === prevGrid) return;
      prevGrid = gridKey;

      const stars: StarPos[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          stars.push({
            x: ((c + 0.15 + Math.random() * 0.7) / cols) * 100,
            y: ((r + 0.15 + Math.random() * 0.7) / rows) * 100,
            char: Math.random() < 0.5 ? '✦' : '✧',
            delay: -(Math.random() * 8),
            size: 0.7 + Math.random() * 0.6,
          });
        }
      }
      setSidebarStars(stars);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(main);
    return () => ro.disconnect();
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
        <div className="text-xs flex flex-col gap-1 text-soft-white/70">
          <strong>Texts</strong>
          <span>&#9733; Cyber-Marx</span>
          <span>&#9733; Cyber-Proletariat</span>
          <span>&#9733; Cybernetic Revolutionaries</span>
          <span>&#9733; How Not to Network a Nation</span>
          <span className="pb-1">&#9733; Towards a New Socialism</span>
          <strong>Novels</strong>
          <span >&#9733; Pattern Recognition</span>
          <span >&#9733; The Peripheral</span>
          <span >&#9733; Snow Crash</span>
          <span className="pb-1">&#9733; The Dispossessed</span>
          <strong>Games</strong>
          <span >&#9733; Disco Elysium</span>
          <span >&#9733; Cruelty Squad</span>
          <span >&#9733; Citizen Sleeper</span>
          <span className="pb-1">&#9733; Deus Ex</span>
          <strong>Film</strong>
          <span >&#9733; Ghost in the Shell</span>
          <span >&#9733; Blade Runner</span>
          <span className="pb-1">&#9733; Akira</span>
          <strong>Television</strong>
          <span >&#9733; Cyberpunk: Edgerunners</span>
          <span className="pb-1">&#9733; Severance</span>
        </div>
      </div>

      {/* ═══ GIBSON QUOTE ═══ */}
      <div className="sidebar-panel pixel-border-pink text-center">
        <p className="text-xs text-soft-white/70 italic leading-relaxed">
          &ldquo;the future is already here &mdash; it&rsquo;s just not evenly distributed&rdquo;
        </p>
        <p className="text-[0.65rem] text-muted mt-1">
          &mdash; william gibson
        </p>
      </div>

      {/* ═══ STAR FIELD ═══ */}
      <div ref={starsRef} className="sidebar-stars" style={fieldHeight > 0 ? { height: fieldHeight } : undefined} aria-hidden="true">
        {sidebarStars.map((star, i) => (
          <span
            key={i}
            className="star-twinkle"
            style={{
              position: 'absolute',
              left: `${star.x.toFixed(1)}%`,
              top: `${star.y.toFixed(1)}%`,
              margin: 0,
              animationDelay: `${star.delay.toFixed(2)}s`,
              '--delay': `${star.delay.toFixed(2)}s`,
              '--y': '0px',
              '--size': star.size.toFixed(2),
            } as React.CSSProperties}
          >
            <span className="star-glyph-solid">✦</span>
            <span className="star-glyph-hollow">✧</span>
          </span>
        ))}
      </div>
    </aside>
  );
}
