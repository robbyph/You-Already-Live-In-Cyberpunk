"use client";

import { useEffect, useState } from "react";

function generateCircuitTile(): string {
  const SIZE = 600;
  const GRID = 25;
  const CELLS = Math.floor(SIZE / GRID);

  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;

  let seed = 24601;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const randInt = (min: number, max: number) =>
    Math.floor(rand() * (max - min + 1)) + min;

  // ── ground-fill hatching ──
  ctx.strokeStyle = "rgba(56,189,248,0.05)";
  ctx.lineWidth = 0.4;
  for (let i = -SIZE; i < SIZE * 2; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + SIZE, SIZE);
    ctx.stroke();
  }

  // ── bus traces (edge-to-edge, jog and return for seamless tiling) ──
  ctx.lineCap = "butt";
  const busH = [0.13, 0.31, 0.52, 0.71, 0.88];
  const busV = [0.11, 0.34, 0.56, 0.77, 0.93];

  ctx.strokeStyle = "rgba(56,189,248,0.22)";
  ctx.lineWidth = 0.8;

  for (const frac of busH) {
    const y = Math.round(frac * SIZE);
    const js = randInt(Math.round(SIZE * 0.15), Math.round(SIZE * 0.35));
    const je = randInt(Math.round(SIZE * 0.6), Math.round(SIZE * 0.8));
    const jd = GRID * (rand() < 0.5 ? 1 : -1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(js, y);
    ctx.lineTo(js, y + jd);
    ctx.lineTo(je, y + jd);
    ctx.lineTo(je, y);
    ctx.lineTo(SIZE, y);
    ctx.stroke();
  }

  for (const frac of busV) {
    const x = Math.round(frac * SIZE);
    const js = randInt(Math.round(SIZE * 0.15), Math.round(SIZE * 0.35));
    const je = randInt(Math.round(SIZE * 0.6), Math.round(SIZE * 0.8));
    const jd = GRID * (rand() < 0.5 ? 1 : -1);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, js);
    ctx.lineTo(x + jd, js);
    ctx.lineTo(x + jd, je);
    ctx.lineTo(x, je);
    ctx.lineTo(x, SIZE);
    ctx.stroke();
  }

  // ── components and branch traces ──
  for (let col = 0; col < CELLS; col++) {
    for (let row = 0; row < CELLS; row++) {
      const cx = col * GRID + GRID / 2;
      const cy = row * GRID + GRID / 2;
      const roll = rand();

      if (roll < 0.02) {
        // IC footprint
        const w = GRID * (1 + rand() * 0.6);
        const h = GRID * (0.55 + rand() * 0.35);
        ctx.strokeStyle = "rgba(139,92,246,0.16)";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        ctx.strokeStyle = "rgba(139,92,246,0.22)";
        ctx.lineWidth = 0.45;
        const pins = Math.max(2, Math.floor(w / 7));
        for (let p = 0; p < pins; p++) {
          const px = cx - w / 2 + (p + 0.5) * (w / pins);
          ctx.beginPath();
          ctx.moveTo(px, cy - h / 2);
          ctx.lineTo(px, cy - h / 2 - 3.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px, cy + h / 2);
          ctx.lineTo(px, cy + h / 2 + 3.5);
          ctx.stroke();
        }

        // pin-1 dot
        ctx.fillStyle = "rgba(139,92,246,0.14)";
        ctx.beginPath();
        ctx.arc(cx - w / 2 + 3.5, cy - h / 2 + 3.5, 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (roll < 0.06) {
        // via (annular ring)
        ctx.fillStyle = "rgba(56,189,248,0.30)";
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0e17";
        ctx.beginPath();
        ctx.arc(cx, cy, 1, 0, Math.PI * 2);
        ctx.fill();

        // branch trace from via
        ctx.strokeStyle = "rgba(56,189,248,0.20)";
        ctx.lineWidth = 0.55;
        const len = GRID * randInt(2, 4);
        const dir = randInt(0, 3);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        if (dir === 0) ctx.lineTo(cx + len, cy);
        else if (dir === 1) ctx.lineTo(cx, cy + len);
        else if (dir === 2) ctx.lineTo(cx - len, cy);
        else ctx.lineTo(cx, cy - len);
        ctx.stroke();
      } else if (roll < 0.09) {
        // SMD resistor/cap
        const vert = rand() < 0.5;
        ctx.fillStyle = "rgba(56,189,248,0.25)";
        if (vert) {
          ctx.fillRect(cx - 1.5, cy - 4, 3, 2.5);
          ctx.fillRect(cx - 1.5, cy + 1.5, 3, 2.5);
          ctx.strokeStyle = "rgba(56,189,248,0.14)";
          ctx.lineWidth = 0.3;
          ctx.strokeRect(cx - 2, cy - 4, 4, 8);
        } else {
          ctx.fillRect(cx - 4, cy - 1.5, 2.5, 3);
          ctx.fillRect(cx + 1.5, cy - 1.5, 2.5, 3);
          ctx.strokeStyle = "rgba(56,189,248,0.14)";
          ctx.lineWidth = 0.3;
          ctx.strokeRect(cx - 4, cy - 2, 8, 4);
        }
      } else if (roll < 0.11) {
        // through-hole pad
        ctx.fillStyle = "rgba(56,189,248,0.26)";
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
        ctx.fillStyle = "#0a0e17";
        ctx.beginPath();
        ctx.arc(cx, cy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (roll < 0.13) {
        // test point
        ctx.strokeStyle = "rgba(56,189,248,0.18)";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(56,189,248,0.12)";
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (roll < 0.19) {
        // L-shaped trace
        ctx.strokeStyle = "rgba(56,189,248,0.18)";
        ctx.lineWidth = 0.55;
        const len1 = GRID * randInt(1, 3);
        const len2 = GRID * randInt(1, 3);
        const dx = rand() < 0.5 ? len1 : -len1;
        const dy = rand() < 0.5 ? len2 : -len2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + dx, cy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
      }
    }
  }

  // ── pin headers ──
  for (let i = 0; i < 4; i++) {
    const hx = randInt(3, CELLS - 5) * GRID;
    const hy = randInt(3, CELLS - 3) * GRID;
    const pins = randInt(3, 7);
    const vert = rand() < 0.5;

    for (let p = 0; p < pins; p++) {
      const px = vert ? hx : hx + p * 5;
      const py = vert ? hy + p * 5 : hy;
      ctx.fillStyle = "rgba(56,189,248,0.22)";
      ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      ctx.fillStyle = "#0a0e17";
      ctx.beginPath();
      ctx.arc(px, py, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return c.toDataURL("image/png");
}

export default function CircuitBoardBg() {
  const [tileUrl, setTileUrl] = useState("");

  useEffect(() => {
    setTileUrl(generateCircuitTile());
  }, []);

  return (
    <div
      className="circuit-bg"
      style={tileUrl ? { backgroundImage: `url(${tileUrl})` } : undefined}
      aria-hidden="true"
    />
  );
}
