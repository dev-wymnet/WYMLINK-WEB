import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";

// The Wymlink globe: the same vector mark as the mobile app (viewBox 1100 × 900).
export const LogoMark = ({ size = 34, className }: { size?: number; className?: string }) => (
  <Image src="/assets/brand/wymlink-globe.svg" alt="" width={size} height={Math.round((size * 900) / 1100)} unoptimized priority className={className} />
);

// The app icon (the globe on brand blue), as it appears on a phone's home screen.
export const AppIcon = ({ size = 28, className }: { size?: number; className?: string }) => (
  <Image src="/assets/brand/app-icon-192.png" alt="" width={size} height={size} className={cx("rounded-[28%]", className)} />
);

export const Brand = ({ href = "/", tone = "dark", className }: { href?: string; tone?: "dark" | "light"; className?: string }) => (
  <Link href={href} className={cx("inline-flex items-center gap-2", className)} aria-label="Wymlink home">
    <LogoMark size={34} />
    <span className={cx("text-[21px] font-[550] tracking-[-0.7px]", tone === "dark" ? "text-ink" : "text-white")}>Wymlink</span>
  </Link>
);
