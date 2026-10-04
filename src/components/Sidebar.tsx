"use client";

import { useEffect, useRef, useState } from "react";
import SiteInfo from "./SiteInfo";

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

    // Match the CSS breakpoint. Header and other visible stars are independent.
    const hidden = window.matchMedia('(max-width: 900px)');
    const content = feed.querySelector('.feed-batches');
    if (!content) return;
    let cols = 0;
    let stars: StarPos[] = [];
    const measure = () => {
      if (hidden.matches) return;
      const contentBottom = content.getBoundingClientRect().bottom;
      const starsTop = starsEl.getBoundingClientRect().top;
      const available = Math.max(0, contentBottom - starsTop);
      setFieldHeight(available);

      const sidebarWidth = starsEl.getBoundingClientRect().width || 260;
      const nextCols = Math.max(1, Math.floor(sidebarWidth / SIDEBAR_CELL_W));
      const rows = Math.max(0, Math.floor(available / SIDEBAR_CELL_H));
      if (nextCols !== cols) {
        cols = nextCols;
        stars = [];
      }
      const count = rows * cols;
      if (count === stars.length) return;

      // Extend the same scattered field as batches arrive, without moving or
      // restarting the desktop stars that are already on screen.
      stars = stars.slice(0, count);
      for (let i = stars.length; i < count; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        stars.push({
          x: ((c + 0.15 + Math.random() * 0.7) / cols) * 100,
          y: (r + 0.15 + Math.random() * 0.7) * SIDEBAR_CELL_H,
          char: Math.random() < 0.5 ? '✦' : '✧',
          delay: -(Math.random() * 8),
          size: 0.7 + Math.random() * 0.6,
        });
      }
      setSidebarStars(stars);
    };
    const ro = new ResizeObserver(measure);
    const updateVisibility = () => {
      ro.disconnect();
      if (hidden.matches) {
        stars = [];
        cols = 0;
        setSidebarStars([]);
        setFieldHeight(0);
        return;
      }
      measure();
      // The masonry reserves its height with padding before images load.
      ro.observe(content, { box: 'border-box' });
    };
    updateVisibility();
    hidden.addEventListener('change', updateVisibility);
    return () => {
      ro.disconnect();
      hidden.removeEventListener('change', updateVisibility);
    };
  }, []);

  return (
    <aside className="page-sidebar">
      <SiteInfo />

      {/* ═══ STAR FIELD ═══ */}
      <div ref={starsRef} className="sidebar-stars" style={fieldHeight > 0 ? { height: fieldHeight } : undefined} aria-hidden="true">
        {sidebarStars.map((star, i) => (
          <span
            key={i}
            className="star-twinkle"
            style={{
              position: 'absolute',
              left: `${star.x.toFixed(1)}%`,
              top: `${star.y.toFixed(1)}px`,
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
