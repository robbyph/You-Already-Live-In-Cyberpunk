const BADGES = [
  { text: "BEST VIEWED AT 2AM", bg: "var(--color-card-dark)", border: "var(--color-hot-pink)", color: "var(--color-hot-pink)" },
  { text: "MADE WITH HTML", bg: "var(--color-bg)", border: "var(--color-neon-cyan)", color: "var(--color-neon-cyan)" },
  { text: "ANTI-NFT", bg: "var(--color-card-mid)", border: "var(--color-hot-pink)", color: "var(--color-hot-pink)" },
  { text: "WEB 1.0 4EVER", bg: "var(--color-bg)", border: "var(--color-mint)", color: "var(--color-mint)" },
  { text: "NO AI SLOP", bg: "var(--color-card-dark)", border: "var(--color-neon-purple)", color: "var(--color-neon-purple)" },
  { text: "RESIST ALGO", bg: "var(--color-bg)", border: "var(--color-neon-purple)", color: "var(--color-neon-purple)" },
  { text: "NO COOKIES (ironic)", bg: "var(--color-card-dark)", border: "var(--color-deep-rose)", color: "var(--color-deep-rose)" },
  { text: "MADE W/ INSOMNIA", bg: "var(--color-bg)", border: "var(--color-neon-cyan)", color: "var(--color-neon-cyan)" },
  { text: "HUMAN CURATED", bg: "var(--color-bg-alt)", border: "var(--color-mint)", color: "var(--color-mint)" },
  { text: "ANTI-CORPO", bg: "var(--color-card-mid)", border: "var(--color-hot-pink)", color: "var(--color-hot-pink)" },
];

export default function BadgeWall() {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {BADGES.map((badge) => (
        <div
          key={badge.text}
          className="badge-88x31"
          style={{
            background: badge.bg,
            borderColor: badge.border,
            color: badge.color,
          }}
        >
          {badge.text}
        </div>
      ))}
    </div>
  );
}
