"use client";

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
  const ticker = TICKER_PHRASES.join("  \u2571\u2571\u2571  ");

  return (
    <header className="relative px-4 pt-4 pb-2 max-w-[1300px] mx-auto" id="top">
      {/* Pixel-bordered header panel */}
      <div className="pixel-border p-4 sm:p-6 mb-4">
        <div className="text-center">
          <h1 className="edge-title text-4xl sm:text-6xl md:text-7xl text-hot-pink crt-flicker pulsar-glow leading-none">
            YOU ALREADY LIVE
          </h1>
          <h1 className="emphasis-title text-3xl sm:text-5xl md:text-6xl text-neon-cyan crt-flicker pulsar-glow mt-1 leading-none">
            IN CYBERPUNK
          </h1>
        </div>

        <div className="mt-4 text-center text-muted text-sm">
          <span className="text-neon-cyan">&#10022;</span>{" "}
          a collection of proof that the dystopia is now{" "}
          <span className="text-neon-cyan">&#10022;</span>
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
