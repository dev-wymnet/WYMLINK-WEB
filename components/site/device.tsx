import type { CSSProperties } from "react";
import Image from "next/image";
import { IcLock } from "@/components/app/icons";
import { cx } from "@/lib/cx";

// A realistic phone showing a real screenshot from the Wymlink app: brushed-metal rim,
// black bezel, camera island and side buttons. Width comes from className (default 323px);
// everything else scales with it. Screenshots live in public/assets/app (720 × 1470).
const BUTTON = "absolute w-[3px] bg-[linear-gradient(90deg,#8e8e95,#e9e9ec_60%,#b4b4ba)]";

// className sizes and positions the phone (it is often `absolute`); the frame inside is the
// positioned box for the side buttons, so the two never fight over `position`.
export function DevicePhone({ src, alt, className, style, priority, sizes = "323px" }: { src: string; alt: string; className?: string; style?: CSSProperties; priority?: boolean; sizes?: string }) {
  return (
    <div className={cx("w-[323px] shrink-0", className)} style={style}>
      <div className="relative">
        <span className={cx(BUTTON, "-left-[2px] top-[19%] h-[5%] rounded-l-sm")} aria-hidden />
        <span className={cx(BUTTON, "-left-[2px] top-[27%] h-[8.5%] rounded-l-sm")} aria-hidden />
        <span className={cx(BUTTON, "-left-[2px] top-[37.5%] h-[8.5%] rounded-l-sm")} aria-hidden />
        <span className={cx(BUTTON, "-right-[2px] top-[29%] h-[12.5%] rounded-r-sm")} aria-hidden />
        <div className="rounded-[18%/8.6%] bg-[linear-gradient(160deg,#f6f6f8_0%,#c9c9ce_16%,#eeeef1_36%,#aaaab1_60%,#e4e4e8_82%,#b6b6bc_100%)] p-[1.25%] shadow-[0_40px_80px_-30px_rgba(15,20,40,0.38),0_16px_32px_-16px_rgba(15,20,40,0.22),inset_0_0_0_1px_rgba(255,255,255,0.55)]">
          <div className="rounded-[17%/8.1%] bg-[#060607] p-[2.6%]">
            <div className="relative aspect-[720/1470] overflow-hidden rounded-[14%/6.9%] bg-white">
              <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" priority={priority} />
              <span className="absolute left-1/2 top-[1.5%] h-[3.5%] w-[29%] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A desktop browser window (macOS chrome) showing a screenshot, fading into the panel below.
export function BrowserWindow({ src, alt, title, className }: { src: string; alt: string; title: string; className?: string }) {
  return (
    <div
      className={cx("overflow-hidden rounded-[18px] bg-[#141519] ring-1 ring-inset ring-white/10", className)}
      style={{ maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)" }}
    >
      <div className="relative flex h-9 items-center gap-2 border-b border-white/[0.06] px-4" aria-hidden>
        <span className="size-[11px] rounded-full bg-[#ff5f57]" />
        <span className="size-[11px] rounded-full bg-[#febc2e]" />
        <span className="size-[11px] rounded-full bg-[#28c840]" />
        <span className="absolute left-1/2 top-1/2 flex h-6 w-[min(300px,50%)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-md bg-white/[0.06] text-[11px] text-white/60">
          <IcLock className="text-[11px]" /> {title}
        </span>
      </div>
      <div className="relative aspect-[1440/900]">
        <Image src={src} alt={alt} fill sizes="(min-width: 1080px) 986px, 100vw" className="object-cover object-top" />
      </div>
    </div>
  );
}
