"use client";

import { useRef, useEffect, useState } from "react";

const TICKER_PHRASES = [
  "YOUR TOASTER HAS A CPU MORE POWERFUL THAN THE APOLLO MISSIONS",
  "MEGACORPS OWN YOUR DNA SEQUENCE",
  "AI IS WRITING YOUR KIDS' HOMEWORK",
  "FACIAL RECOGNITION AT EVERY CORNER STORE",
  "YOUR CAR SELLS YOUR DRIVING DATA",
  "NEURAL IMPLANTS ARE FDA APPROVED",
  "ROBOT DOGS PATROL THE STREETS",
  "THE ALGORITHM KNOWS YOU'RE READING THIS",
  "DEEPFAKES HAVE ENTERED THE COURTROOM",
  "WELCOME TO THE FUTURE NOBODY ASKED FOR",
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
    <div ref={ref} className="absolute inset-[-3px] pointer-events-none z-10">
      {w > 0 && (
        <svg width={w} height={h} aria-hidden="true">
          <defs>
            <filter id="marquee-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={left} pathLength={100} className="marquee-dots" />
          <path d={right} pathLength={100} className="marquee-dots" />
        </svg>
      )}
    </div>
  );
}

export default function Header() {
  const ticker = TICKER_PHRASES.join("  ╱╱╱  ");
  const star1Ref = useRef<HTMLSpanElement>(null);
  const star2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s1 = star1Ref.current;
    const s2 = star2Ref.current;
    if (!s1 || !s2) return;
    const t = document.timeline.currentTime as number;
    [...s1.getAnimations(), ...s2.getAnimations()].forEach(a => { a.startTime = t; });
  }, []);

  return (
    <header className="relative px-4 pt-4 pb-2 max-w-[1300px] mx-auto" id="top">
      {/* Pixel-bordered header panel */}
      <div className="pixel-border p-4 sm:p-6 mb-4 relative">
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
          <span ref={star1Ref} className="text-neon-cyan star-pulse">&#10022;</span>{" "}
          dystopia is now!{" "}
          <span ref={star2Ref} className="text-neon-cyan star-pulse">&#10022;</span>
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

      {/* Decorative divider */}
      <div className="divider-blocks select-none my-2">
        ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦
      </div>
    </header>
  );
}
