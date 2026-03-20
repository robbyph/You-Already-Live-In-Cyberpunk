const BADGES = [
  { text: "BEST VIEWED AT 2AM", bg: "#1a0a3e", border: "#ff2a6d", color: "#ff2a6d" },
  { text: "MADE WITH HTML", bg: "#0d0221", border: "#05d9e8", color: "#05d9e8" },
  { text: "ANTI-NFT", bg: "#2a0020", border: "#ff2a6d", color: "#ff2a6d" },
  { text: "WEB 1.0 4EVER", bg: "#0d0221", border: "#39ff14", color: "#39ff14" },
  { text: "NO AI SLOP", bg: "#1a0a3e", border: "#f0ff00", color: "#f0ff00" },
  { text: "RESIST ALGO", bg: "#0d0221", border: "#d300c5", color: "#d300c5" },
  { text: "NO COOKIES (ironic)", bg: "#1a0a3e", border: "#ff6e27", color: "#ff6e27" },
  { text: "MADE W/ INSOMNIA", bg: "#0d0221", border: "#05d9e8", color: "#05d9e8" },
  { text: "HUMAN CURATED", bg: "#150535", border: "#39ff14", color: "#39ff14" },
  { text: "ANTI-CORPO", bg: "#2a0020", border: "#ff2a6d", color: "#ff2a6d" },
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
