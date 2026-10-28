"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";

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

// "Money in" pill over the hero phone: a pulsing dot and an amount whose digits roll like
// an odometer to each new example payment.
const AMOUNTS = ["25,000.00", "12,500.00", "48,250.00", "10,030.00", "37,500.00"];
const SLOT_EM = 1.25;

function Wheel({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1.25em] w-[0.62em] overflow-hidden align-top">
      <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(.33,1,.68,1)]" style={{ transform: `translateY(-${digit * SLOT_EM}em)` }}>
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="h-[1.25em] text-center leading-[1.25em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export function LiveCredit({ className }: { className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % AMOUNTS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const amount = AMOUNTS[i]!;
  return (
    <div className={cx("pointer-events-none inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white/95 py-2 pl-3 pr-4 text-ink shadow-[0_12px_32px_-12px_rgb(11_18_32/0.35),0_0_0_1px_rgb(11_18_32/0.05)] backdrop-blur", className)} aria-hidden>
      <span className="live-dot size-2 rounded-full bg-ok" />
      <span className="text-[13px] font-medium text-ink/60">Money in</span>
      <span className="inline-flex text-[15px] font-semibold tabular-nums leading-[1.25em] tracking-[-0.2px]">
        <span>₦</span>
        {[...amount].map((ch, k) =>
          /\d/.test(ch) ? <Wheel key={k} digit={Number(ch)} /> : ch === " " ? null : (
            <span key={k} className="inline-block">
              {ch}
            </span>
          ),
        )}
      </span>
    </div>
  );
}
