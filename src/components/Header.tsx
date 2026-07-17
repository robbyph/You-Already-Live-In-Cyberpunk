"use client";

import { useRef, useEffect, useState } from "react";

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

const FIELD_HEIGHT = 50;
const CELL_W = 42;
const CELL_H = 25;

type StarPos = { x: number; y: number; char: string; delay: number; size: number };

export default function Header() {
  const [shuffled, setShuffled] = useState(TICKER_PHRASES);
  useEffect(() => { setShuffled(shuffle(TICKER_PHRASES)); }, []);
  const ticker = shuffled.join("  ╱╱╱  ");
  const star1Ref = useRef<HTMLSpanElement>(null);
  const star2Ref = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [headerStars, setHeaderStars] = useState<StarPos[]>([]);
  const [starPhase, setStarPhase] = useState(0);

  useEffect(() => {
    const s1 = star1Ref.current;
    const s2 = star2Ref.current;
    if (!s1 || !s2) return;
    const t = document.timeline.currentTime as number;
    [...s1.getAnimations(), ...s2.getAnimations()].forEach(a => { a.startTime = t; });
  }, []);

  useEffect(() => {
    const bounce = [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.4)', offset: 0.25 },
      { transform: 'scale(0.85)', offset: 0.55 },
      { transform: 'scale(1.1)', offset: 0.8 },
      { transform: 'scale(1)', offset: 1 },
    ];
    const id = setInterval(() => {
      setStarPhase(s => (s + 1) % 4);
      [star1Ref.current, star2Ref.current].forEach(el => {
        el?.animate(bounce, { duration: 500, easing: 'ease-out' });
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const starSolid = starPhase < 2;
  const starCyan = starPhase === 0 || starPhase === 3;

  useEffect(() => {
    const el = dividerRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    const cols = Math.max(1, Math.floor(w / CELL_W));
    const rows = Math.max(1, Math.floor(FIELD_HEIGHT / CELL_H));
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
    setHeaderStars(stars);
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
          <span ref={star1Ref} className={`${starCyan ? 'text-neon-cyan' : 'text-neon-purple'} star-phase`}><span className="star-swap"><span style={{ opacity: starSolid ? 1 : 0 }}>✦</span><span style={{ opacity: starSolid ? 0 : 1 }}>✧</span></span></span>{" "}
          dystopia is now!{" "}
          <span ref={star2Ref} className={`${starCyan ? 'text-neon-cyan' : 'text-neon-purple'} star-phase`}><span className="star-swap"><span style={{ opacity: starSolid ? 1 : 0 }}>✦</span><span style={{ opacity: starSolid ? 0 : 1 }}>✧</span></span></span>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="pt-1 mt-3">
        <div className="glitch-strip" aria-hidden="true">{"░▒▓█▓▒░".repeat(50)}</div>
        <div className="marquee-track hidden lg:block">
          <span className="marquee-text text-neon-purple pixel-title text-sm sm:text-base tracking-widest">
            {ticker + "  ╱╱╱  " + ticker + "  ╱╱╱  "}
          </span>
        </div>
        <div className="glitch-strip hidden lg:block" aria-hidden="true">{"░▒▓█▓▒░".repeat(50)}</div>
      </div>

      {/* Decorative star field */}
      <div ref={dividerRef} className="select-none mt-1 mb-3.5 mx-1 relative text-neon-purple opacity-60 text-[0.7rem] overflow-visible" style={{ height: FIELD_HEIGHT }} aria-hidden="true">
        {headerStars.map((star, i) => (
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
    </header>
  );
}
