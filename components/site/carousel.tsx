"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IcChevronLeft, IcChevronRight } from "@/components/app/icons";
import { cx } from "@/lib/cx";

// A row of cards that scrolls sideways, with round arrow buttons above it. The row runs to
// the edge of the panel and fades out there.
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const row = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    const first = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(first);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * 381, behavior: "smooth" });
  const arrow = "grid size-8 place-items-center rounded-full bg-white/50 text-ink/50 shadow-[0_0_0_1px_rgb(11_18_32/0.05)] transition hover:bg-white/85 disabled:opacity-40";

  return (
    <div>
      <div className="flex justify-end gap-2">
        <button type="button" className={arrow} onClick={() => go(-1)} disabled={edge.start} aria-label="Previous">
          <IcChevronLeft />
        </button>
        <button type="button" className={arrow} onClick={() => go(1)} disabled={edge.end} aria-label="Next">
          <IcChevronRight />
        </button>
      </div>
      <div
        ref={row}
        role="region"
        aria-label={label}
        className={cx("-mr-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 pr-5 sm:-mr-12 sm:pr-12", "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}
        style={{ maskImage: "linear-gradient(to right, #000 82%, transparent)", WebkitMaskImage: "linear-gradient(to right, #000 82%, transparent)" }}
      >
        {children}
      </div>
    </div>
  );
}
