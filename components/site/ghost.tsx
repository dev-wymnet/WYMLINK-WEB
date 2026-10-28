import { cx } from "@/lib/cx";

// The faint "pixel" texture at the top of the big panels: rows of tiny triangles, bars and
// dots, barely visible, fading out downwards. Built once as a repeating SVG tile.
function tile() {
  // Deterministic pseudo-random numbers, so server and client render the same tile.
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const W = 240;
  const H = 48;
  let shapes = "";
  for (let row = 0; row < 4; row++) {
    for (let x = 4; x < W; x += 6 + Math.floor(rand() * 9)) {
      const y = row * 12 + 3 + rand() * 4;
      const kind = rand();
      if (kind < 0.4) shapes += `<path d="M${x} ${y + 5}l2.5-5 2.5 5z"/>`;
      else if (kind < 0.7) shapes += `<rect x="${x}" y="${y}" width="1.6" height="${3 + Math.round(rand() * 3)}" rx=".5"/>`;
      else if (kind < 0.9) shapes += `<circle cx="${x + 1}" cy="${y + 3}" r="1.3"/>`;
      else shapes += `<path d="M${x} ${y}h4l-2 4z"/>`;
    }
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' fill='#1d2422'>${shapes}</svg>`)}")`;
}

const TILE = tile();

export function Ghost({ className, height = 320 }: { className?: string; height?: number }) {
  return (
    <div
      aria-hidden
      className={cx("pointer-events-none absolute inset-x-0 top-0 opacity-[0.032]", className)}
      style={{
        height,
        backgroundImage: TILE,
        backgroundSize: "240px 48px",
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 20%, #000 45%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 20%, #000 45%, transparent 100%)",
      }}
    />
  );
}
