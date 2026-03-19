export default function Header() {
  return (
    <header className="relative py-12 px-6 text-center">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />

      <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase glow-cyan flicker">
        You Already Live
        <br />
        <span className="text-neon-magenta glow-magenta">In Cyberpunk</span>
      </h1>

      <p className="mt-4 text-sm sm:text-base text-text-muted max-w-xl mx-auto tracking-wide">
        The dystopian future is now. This is your feed from the world they
        warned us about.
      </p>

      {/* Decorative bottom line */}
      <div className="mt-8 h-[1px] bg-gradient-to-r from-transparent via-neon-magenta to-transparent opacity-30" />
    </header>
  );
}
