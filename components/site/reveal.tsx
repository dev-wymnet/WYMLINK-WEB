"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Entrance choreography (timings measured from the reference site). A group shows its
// pieces once it scrolls into view, or straight away for the hero; the motion itself is
// CSS (globals.css, "Reveal"), keyed off data-shown. Without JavaScript or with reduced
// motion everything is simply visible.

export function RevealGroup({ children, className, immediate, as: Tag = "div", style }: { children: ReactNode; className?: string; immediate?: boolean; as?: "div" | "section"; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (immediate) {
      // Next frame, so the hidden state paints first and the transition runs.
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);
  return (
    <Tag ref={ref} data-reveal="" data-shown={shown ? "" : undefined} className={className} style={style}>
      {children}
    </Tag>
  );
}

