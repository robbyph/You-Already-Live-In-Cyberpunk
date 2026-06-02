const BADGES = [
  { text: "BEST VIEWED AT 2AM", bg: "#1a0a3e", border: "#ff2a6d", color: "#ff2a6d" },
  { text: "MADE WITH HTML", bg: "#0d0221", border: "#05d9e8", color: "#05d9e8" },
  { text: "ANTI-NFT", bg: "#2a0020", border: "#ff2a6d", color: "#ff2a6d" },
  { text: "WEB 1.0 4EVER", bg: "#0d0221", border: "#2de2a0", color: "#2de2a0" },
  { text: "NO AI SLOP", bg: "#1a0a3e", border: "#b44aff", color: "#b44aff" },
  { text: "RESIST ALGO", bg: "#0d0221", border: "#b44aff", color: "#b44aff" },
  { text: "NO COOKIES (ironic)", bg: "#1a0a3e", border: "#c4165c", color: "#c4165c" },
  { text: "MADE W/ INSOMNIA", bg: "#0d0221", border: "#05d9e8", color: "#05d9e8" },
  { text: "HUMAN CURATED", bg: "#150535", border: "#2de2a0", color: "#2de2a0" },
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
