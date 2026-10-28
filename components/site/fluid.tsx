"use client";

import { useEffect, useRef, useState } from "react";
import { FluidField, type FluidSettings } from "@/lib/fluid/engine";
import { cx } from "@/lib/cx";

// The moving colour at the bottom of each coloured panel (lib/fluid/engine.ts), with the
// reference's settings and Wymlink teal palettes (darkest stop last). Skipped for reduced
// motion and without WebGL2; the panel's CSS gradient shows then.
export const FLUID_PALETTES = {
  hero: ["#e4f5f0", "#bfe6dc", "#a9ddd0"],
  kit: ["#dbefe9", "#bfe3d9", "#aedbd0"],
  trust: ["#d9eee8", "#bce2d8", "#acdacf"],
  foot: ["#dcefe9", "#c0e3d9", "#b0dccf"],
  dark: ["#17221f", "#1d332d", "#213a33"],
} satisfies Record<string, FluidSettings["colors"]>;

export type FluidPalette = keyof typeof FLUID_PALETTES;

const settings = (colors: FluidSettings["colors"]): FluidSettings => ({
  colors,
  stops: [0.2, 0.85, 1],
  motion: { speed: 0.15, morph: 0.35, flow: 0.75 },
  texture: { scale: 1, octaves: 3.5, warp: 0.25 },
  origin: { x: 0.5, y: -0.2 },
  fade: { start: 0, end: 3, ease: [0.75, 0.5, 0.5, 1], fromBottom: true },
  chroma: 0.25,
  fluid: { dissipation: 0.98, curl: 5, radius: 1.25, force: 6000, ambient: 1.8, distort: 0.0015, follow: 0.15 },
  render: { refHeight: 640, scale: 0.1, blur: 2 },
});

export function FluidBackground({ palette, className }: { palette: FluidPalette; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const h = host.current;
    const c = canvas.current;
    if (!h || !c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let field: FluidField;
    try {
      field = new FluidField(c, h, settings(FLUID_PALETTES[palette]));
    } catch (err) {
      console.warn("FluidBackground: WebGL setup failed, showing the plain gradient", err);
      return;
    }
    // Runs only while the panel is on screen.
    const io = new IntersectionObserver(([e]) => field.setActive(Boolean(e?.isIntersecting)), { rootMargin: "100px" });
    io.observe(h);
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
      field.teardown();
    };
  }, [palette]);

  return (
    <div ref={host} aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvas} className={cx("block h-full w-full transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} />
    </div>
  );
}
