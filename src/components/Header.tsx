"use client";

import { useRef, useEffect, useState, useMemo } from "react";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TICKER_PHRASES = [
  "YOUR TOASTER HAS A MORE POWERFUL PROCESSOR THAN THE APOLLO MISSIONS",
  "YOU NO LONGER OWN YOUR OWN DNA SEQUENCE",
  "AI IS WRITING YOUR CHILDREN'S HOMEWORK",
  "FACIAL RECOGNITION AT EVERY CORNER STORE",
  "YOUR CAR SELLS YOUR DRIVING DATA",
  "NEURAL IMPLANTS ARE FDA APPROVED",
  "ROBOT DOGS PATROL THE STREETS",
  "DEEPFAKES HAVE ENTERED THE COURTROOM",
  "YOUR GAIT IS YOUR NEW FINGERPRINT",
  "PLATE READERS LOG YOUR LOCATION HUNDREDS OF TIMES A MONTH",
  "YOUR TV WATCHES YOU MORE THAN YOU WATCH IT",
  "YOUR KEYBOARD RHYTHM IS BIOMETRIC",
  "YOUR VACUUM SOLD THE FLOORPLAN OF YOUR HOME",
  "AI POLICING DECIDES WHO GETS WATCHED"
];

function MarqueeBorder() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({
        w: Math.round(e.contentRect.width),
        h: Math.round(e.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const cx = w / 2;

  const left = `M${cx},${h} L0,${h} L0,0 L${cx},0`;
  const right = `M${cx},${h} L${w},${h} L${w},0 L${cx},0`;

  return (
    <div ref={ref} className="absolute inset-[-2px] pointer-events-none z-10">
      {w > 0 && (
        <svg width={w} height={h} style={{ overflow: 'visible' }} aria-hidden="true">
          <defs>
            <filter id="marquee-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={left} className="marquee-dots" />
          <path d={right} className="marquee-dots" />
        </svg>
      )}
    </div>
  );
}

// Row offsets for 3-row vertical distribution (px)
const ROW_OFFSETS = [-7, 0, 7] as const;
// Conservative px-per-star estimate (char + margins + letter-spacing)
const STAR_PX = 27;

function starY(i: number): number {
  const rowIndex = Math.floor(Math.abs(Math.sin(i * 127.1)) * 3) % 3;
  const noise = Math.sin(i * 3.7 + 0.9) * 2;
  return ROW_OFFSETS[rowIndex] + noise;
}

export default function Header() {
  const shuffled = useMemo(() => shuffle(TICKER_PHRASES), []);
  const ticker = shuffled.join("  ╱╱╱  ");
  const star1Ref = useRef<HTMLSpanElement>(null);
  const star2Ref = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [starCount, setStarCount] = useState(0);
  const [starPhase, setStarPhase] = useState(false);

  useEffect(() => {
    const s1 = star1Ref.current;
    const s2 = star2Ref.current;
    if (!s1 || !s2) return;
    const t = document.timeline.currentTime as number;
    [...s1.getAnimations(), ...s2.getAnimations()].forEach(a => { a.startTime = t; });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStarPhase(s => !s), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = dividerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setStarCount(Math.max(3, Math.floor(w / STAR_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="relative px-4 pt-4 pb-2 max-w-[1300px] mx-auto" id="top">
      {/* Pixel-bordered header panel */}
      <div className="marquee-panel p-4 sm:p-6 mb-4 relative">
        <MarqueeBorder />
        {/* Pixel art eye + title row */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* CSS pixel art eye */}
          <div className="pixel-eye hidden sm:block flex-shrink-0" aria-hidden="true" />

          <div className="text-center">
            <h1 className="edge-title text-4xl sm:text-6xl md:text-7xl text-hot-pink crt-flicker pulsar-glow leading-none">
              YOU ALREADY LIVE
            </h1>
            <h1 className="emphasis-title text-3xl sm:text-5xl md:text-6xl text-neon-cyan crt-flicker pulsar-glow mt-1 leading-none">
              IN CYBERPUNK
            </h1>
          </div>

          {/* CSS pixel art eye (mirrored) */}
          <div
            className="pixel-eye hidden sm:block flex-shrink-0"
            style={{ transform: "scale(3) scaleX(-1)" }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-4 text-center text-muted text-sm">
          <span ref={star1Ref} className={`${starPhase ? 'text-neon-purple' : 'text-neon-cyan'} star-pulse`}>
            {starPhase ? '✧' : '✦'}
          </span>{" "}
          dystopia is now!{" "}
          <span ref={star2Ref} className={`${starPhase ? 'text-neon-cyan' : 'text-neon-purple'} star-pulse`}>
            {starPhase ? '✦' : '✧'}
          </span>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="border-y-2 border-dashed border-hot-pink/40 py-1 my-3">
        <div className="marquee-track">
          <span className="marquee-text text-neon-purple pixel-title text-sm sm:text-base tracking-widest">
            {ticker + "  ╱╱╱  " + ticker + "  ╱╱╱  "}
          </span>
        </div>
      </div>

      {/* Decorative divider — count driven by container width, never wraps */}
      <div ref={dividerRef} className="divider-blocks select-none my-3.5 py-3 -mx-3.5" aria-hidden="true">
        {Array.from({ length: starCount }, (_, i) => (
          <span
            key={i}
            className="star-twinkle"
            style={{
              animationDelay: `${-(i * 0.7 + Math.sin(i * 2.3) * 1.5 + 1.5).toFixed(2)}s`,
              '--y': `${starY(i).toFixed(1)}px`,
              '--size': (0.7 + Math.abs(Math.sin(i * 1.9 + 0.5)) * 0.6).toFixed(2),
            } as React.CSSProperties}
          >
            {i % 2 === 0 ? '✦' : '✧'}
          </span>
        ))}
      </div>
    </header>
  );
}
