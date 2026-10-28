import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";

// The Wymlink mark: the logo's teal hexagon with the W cut out (the same vector as the mobile
// app, viewBox 912 × 992). `tone="light"` draws it white for dark backgrounds.
export const LogoMark = ({ size = 34, tone = "dark", className }: { size?: number; tone?: "dark" | "light"; className?: string }) => (
  <Image
    src={tone === "light" ? "/assets/brand/wymlink-mark-white.svg" : "/assets/brand/wymlink-mark.svg"}
    alt=""
    width={Math.round((size * 912) / 992)}
    height={size}
    unoptimized
    priority
    className={className}
  />
);

// The app icon (the teal mark on white), as it appears on a phone's home screen.
export const AppIcon = ({ size = 28, className }: { size?: number; className?: string }) => (
  <Image src="/assets/brand/app-icon-192.png" alt="" width={size} height={size} className={cx("rounded-[28%]", className)} />
);

export const Brand = ({ href = "/", tone = "dark", className }: { href?: string; tone?: "dark" | "light"; className?: string }) => (
  <Link href={href} className={cx("inline-flex items-center gap-2", className)} aria-label="Wymlink home">
    <LogoMark size={30} tone={tone} />
    <span className={cx("text-[21px] font-[550] tracking-[calc(0.05em_-_0.7px)]", tone === "dark" ? "text-ink" : "text-white")}>Wymlink</span>
  </Link>
);
