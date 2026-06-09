"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const BLOCK_CHARS = ["░", "▒", "▓", "█"];

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

const SEG_SIZE = 8;

interface SegmentGlitch {
  offsetX: number;
  chars: string;
  opacity: number;
}

function randChars(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += BLOCK_CHARS[(Math.random() * 4) | 0];
  return s;
}

function fillPattern(pattern: string, count: number): string {
  let text = "";
  while (text.length < count) text += pattern;
  return text.slice(0, count);
}

export default function FooterGlitch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [glitchMap, setGlitchMap] = useState<Map<string, SegmentGlitch>>(
    new Map()
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getCharCount = useCallback(
    (rowIndex: number) => {
      const row = ROWS[rowIndex];
      const charW = CHAR_WIDTHS[row.fontSize] || 9;
      const letterSpacing = row.fontSize === "1.4rem" ? 4 : 6;
      return Math.ceil(width / (charW + letterSpacing));
    },
    [width]
  );

  useEffect(() => {
    if (!width) return;
    let tickTimer: ReturnType<typeof setTimeout>;
    let clearTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const next = new Map<string, SegmentGlitch>();
      const roll = Math.random();

      if (roll < 0.35) {
        // Scattered — random segments across all rows
        const count = 2 + ((Math.random() * 6) | 0);
        for (let i = 0; i < count; i++) {
          const r = (Math.random() * 5) | 0;
          const cc = getCharCount(r);
          const seg = (Math.random() * Math.ceil(cc / SEG_SIZE)) | 0;
          const len = Math.min(SEG_SIZE, cc - seg * SEG_SIZE);
          next.set(`${r}-${seg}`, {
            offsetX: (Math.random() - 0.5) * 8,
            chars: randChars(len),
            opacity: 0.5 + Math.random() * 0.5,
          });
        }
      } else if (roll < 0.6) {
        // Slice — entire row shifts
        const r = (Math.random() * 5) | 0;
        const cc = getCharCount(r);
        const segCount = Math.ceil(cc / SEG_SIZE);
        const offsetX =
          (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 10);
        for (let s = 0; s < segCount; s++) {
          const len = Math.min(SEG_SIZE, cc - s * SEG_SIZE);
          next.set(`${r}-${s}`, {
            offsetX,
            chars: randChars(len),
            opacity: ROWS[r].opacity + 0.25,
          });
        }
      } else if (roll < 0.8) {
        // Block — rectangular region across adjacent rows
        const startRow = (Math.random() * 5) | 0;
        const rowSpan = Math.min(
          1 + ((Math.random() * 3) | 0),
          5 - startRow
        );
        const segStart = (Math.random() * 6) | 0;
        const segSpan = 2 + ((Math.random() * 4) | 0);
        for (let r = startRow; r < startRow + rowSpan; r++) {
          const cc = getCharCount(r);
          for (let s = segStart; s < segStart + segSpan; s++) {
            const charStart = s * SEG_SIZE;
            if (charStart >= cc) continue;
            const len = Math.min(SEG_SIZE, cc - charStart);
            next.set(`${r}-${s}`, {
              offsetX: (Math.random() - 0.5) * 6,
              chars: randChars(len),
              opacity: 0.5 + Math.random() * 0.4,
            });
          }
        }
      } else {
        // Burst — many segments at once
        const count = 10 + ((Math.random() * 12) | 0);
        for (let i = 0; i < count; i++) {
          const r = (Math.random() * 5) | 0;
          const cc = getCharCount(r);
          const seg = (Math.random() * Math.ceil(cc / SEG_SIZE)) | 0;
          const len = Math.min(SEG_SIZE, cc - seg * SEG_SIZE);
          next.set(`${r}-${seg}`, {
            offsetX: (Math.random() - 0.5) * 14,
            chars: randChars(len),
            opacity: 0.3 + Math.random() * 0.7,
          });
        }
      }

      setGlitchMap(next);
      clearTimer = setTimeout(
        () => setGlitchMap(new Map()),
        60 + Math.random() * 120
      );
      tickTimer = setTimeout(tick, 200 + Math.random() * 600);
    };

    tickTimer = setTimeout(tick, 300);
    return () => {
      clearTimeout(tickTimer);
      clearTimeout(clearTimer);
    };
  }, [width, getCharCount]);

  return (
    <div
      ref={containerRef}
      className="divider-glitch mb-2 select-none"
      aria-hidden="true"
    >
      {width > 0 &&
        ROWS.map((row, ri) => {
          const charW = CHAR_WIDTHS[row.fontSize] || 9;
          const letterSpacing = row.fontSize === "1.4rem" ? 4 : 6;
          const count = Math.ceil(width / (charW + letterSpacing));
          const baseText = fillPattern(row.pattern, count);
          const segCount = Math.ceil(count / SEG_SIZE);
          const segments: React.ReactNode[] = [];

          for (let s = 0; s < segCount; s++) {
            const start = s * SEG_SIZE;
            const glitch = glitchMap.get(`${ri}-${s}`);

            if (glitch) {
              segments.push(
                <span
                  key={s}
                  className="glitch-seg"
                  style={{
                    transform: `translateX(${glitch.offsetX}px)`,
                    opacity: glitch.opacity,
                  }}
                >
                  {glitch.chars}
                </span>
              );
            } else {
              segments.push(
                <span key={s}>
                  {baseText.slice(start, Math.min(start + SEG_SIZE, count))}
                </span>
              );
            }
          }

          return (
            <div
              key={ri}
              className="glitch-row"
              style={{ fontSize: row.fontSize, opacity: row.opacity }}
            >
              {segments}
            </div>
          );
        })}
    </div>
  );
}
