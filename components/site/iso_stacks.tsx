import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

// Three isometric stacks of Wymlink tiles (one, two and three slabs), rising left to right.
// Pure CSS 3D: each slab is a pile of thin slices with the face (and the globe) on top.
const TILE = 150; // tile size in px, before the isometric rotation
const SLAB = 40; // thickness of one slab
const GAP = 14; // space between slabs in a stack
const SLICES = 14; // slices that make up a slab's sides

const STACKS = [
  { layers: 1, x: -268, face: ["#b4c4ff", "#8ea5ff"], side: ["#d3ddff", "#a9bbff"] },
  { layers: 2, x: 0, face: ["#97acff", "#6f8cff"], side: ["#c2d0ff", "#91a8ff"] },
  { layers: 3, x: 268, face: ["#7590ff", "#4664ee"], side: ["#b0c1ff", "#7b95ff"] },
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(" ")})`;

const MARK: CSSProperties = {
  maskImage: "url(/assets/brand/mark-mono.png)",
  WebkitMaskImage: "url(/assets/brand/mark-mono.png)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
};

function Slab({ z, face, side, logo }: { z: number; face: string[]; side: string[]; logo: boolean }) {
  return (
    <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `translateZ(${z}px)` }}>
      {Array.from({ length: SLICES }, (_, i) => (
        <div key={i} className="absolute inset-0 rounded-[34px]" style={{ transform: `translateZ(${(i * SLAB) / SLICES}px)`, background: mix(side[0], side[1], i / (SLICES - 1)) }} />
      ))}
      <div
        className="absolute inset-0 grid place-items-center rounded-[34px]"
        style={{ transform: `translateZ(${SLAB}px)`, background: `linear-gradient(135deg, ${face[0]}, ${face[1]})`, boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.35)" }}
      >
        {logo && <span className="block h-[36%] w-[46%] rotate-45 bg-white" style={MARK} />}
      </div>
    </div>
  );
}

export function IsoStacks({ className }: { className?: string }) {
  return (
    <div className={cx("relative mx-auto h-[170px] w-full max-w-[820px] sm:h-[270px] lg:h-[330px]", className)} aria-hidden>
      <div className="absolute inset-0 origin-bottom scale-[0.44] sm:scale-[0.78] lg:scale-100">
        {STACKS.map((s) => (
          <div key={s.layers} className="absolute bottom-[70px] left-1/2" style={{ marginLeft: s.x - TILE / 2, width: TILE, height: TILE }}>
            <div className="absolute -inset-x-[12%] -bottom-[30%] h-[40%] rounded-full bg-[#4f6ef0]/[0.12] blur-2xl" />
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(-45deg)" }}>
              {Array.from({ length: s.layers }, (_, layer) => (
                <Slab key={layer} z={layer * (SLAB + GAP)} face={s.face} side={s.side} logo={layer === s.layers - 1} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
