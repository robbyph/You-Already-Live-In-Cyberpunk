"use client";

import { useEffect, useState } from "react";

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

export default function Header() {
  const [visitorCount] = useState(
    () => Math.floor(Math.random() * 90000) + 13337
  );
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  const ticker = TICKER_PHRASES.join("  ///  ");

  return (
    <header className="relative px-4 pt-6 pb-2 max-w-5xl mx-auto">
      {/* ASCII art top border */}
      <pre className="text-neon-cyan text-[0.5rem] sm:text-[0.6rem] text-center select-none opacity-60 overflow-hidden leading-tight">
{`╔══════════════════════════════════════════════════════════════════╗
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
╚══════════════════════════════════════════════════════════════════╝`}
      </pre>

      {/* Main title */}
      <div className="text-center my-6">
        <h1 className="pixel-title text-4xl sm:text-6xl md:text-7xl text-hot-pink crt-flicker leading-none">
          YOU ALREADY LIVE
        </h1>
        <h1 className="pixel-title text-3xl sm:text-5xl md:text-6xl text-neon-cyan mt-1 leading-none">
          IN CYBERPUNK
        </h1>
        <div className="mt-3 text-muted text-sm">
          <span className="text-lime">&#9608;</span>{" "}
          a collection of proof that the dystopia is now{" "}
          <span className="text-lime">&#9608;</span>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="border-y-2 border-dashed border-hot-pink/40 py-1 my-4">
        <div className="marquee-track">
          <span className="marquee-text text-neon-yellow pixel-title text-sm sm:text-base tracking-widest">
            {ticker}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-muted mt-2 mb-4">
        <div>
          <span className="text-neon-orange">visitors:</span>{" "}
          <span className="text-lime pixel-title text-sm">{visitorCount.toLocaleString()}</span>
        </div>
        {lastUpdated && (
          <div>
            <span className="text-neon-orange">last updated:</span>{" "}
            <span className="text-soft-white">{lastUpdated}</span>
          </div>
        )}
        <div className="hidden sm:block">
          <span className="text-hot-pink blink">&#9679;</span>{" "}
          <span className="text-neon-cyan">LIVE FEED</span>
        </div>
      </div>

      {/* Decorative divider */}
      <div className="divider-blocks select-none">
        ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
      </div>
    </header>
  );
}
