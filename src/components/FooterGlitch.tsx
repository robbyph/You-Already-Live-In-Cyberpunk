"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = [
  { pattern: "░░░▒░░▒░░░▒░░▒▓░░▒░░░▒░░░▒░░▓░▒░░░▒░░▒░░░▒░░▒▓░░▒░░░▒░░░", fontSize: "0.6rem", opacity: 0.25 },
  { pattern: "▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░", fontSize: "0.9rem", opacity: 0.35 },
  { pattern: "▓█▓▒░▒▓██▓▒░▒▓█▓▒░▒▓██▓▒░▒▓█", fontSize: "1.4rem", opacity: 0.45 },
  { pattern: "▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░", fontSize: "0.9rem", opacity: 0.35 },
  { pattern: "░░▒░░░▒▓░░▒░░░▒░░▓░░▒░░░▒░░▓░▒░░░▒▓░░▒░░░▒░░▓░░▒░░░", fontSize: "0.6rem", opacity: 0.25 },
];

const CHAR_WIDTHS: Record<string, number> = {
  "0.6rem": 5.8,
  "0.9rem": 9.6,
  "1.4rem": 13.2,
};

export default function FooterGlitch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="divider-glitch mb-2 select-none" aria-hidden="true">
      {width > 0 && ROWS.map((row, i) => {
        const charW = CHAR_WIDTHS[row.fontSize] || 9;
        const letterSpacing = row.fontSize === "1.4rem" ? 4 : 6;
        const effectiveCharW = charW + letterSpacing;
        const count = Math.ceil(width / effectiveCharW);
        const pat = row.pattern;
        let text = "";
        while (text.length < count) text += pat;
        text = text.slice(0, count);

        return (
          <div
            key={i}
            className="glitch-row"
            style={{ fontSize: row.fontSize, opacity: row.opacity }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
