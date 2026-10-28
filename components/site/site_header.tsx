"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IcMenuLines, IcX } from "@/components/app/icons";
import { AppIcon, Brand } from "@/components/app/brand";
import { cx } from "@/lib/cx";
import { MENUS, type MenuItem } from "@/components/site/content";

// The session hint cookie only changes on sign-in/out (full navigations), so
// there is nothing to subscribe to; the server render always says "signed out".
const noSubscribe = () => () => {};
const useSignedIn = () =>
  useSyncExternalStore(
    noSubscribe,
    () => document.cookie.split("; ").some((c) => c.startsWith("wl_s=")),
    () => false,
  );

function MenuCard({ item, onPick }: { item: MenuItem; onPick?: () => void }) {
  const Icon = item.icon === "app" ? null : item.icon;
  return (
    <Link href={item.href} onClick={onPick} className="flex items-center gap-4 rounded-[24px] border border-ink/5 bg-white px-4 py-[15px] transition-colors hover:bg-[#fafafb]">
      <span className="grid size-10 shrink-0 place-items-center">{Icon ? <Icon className="text-[30px] text-ink/40" /> : <AppIcon size={40} className="rounded-[11px]" />}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-[450] leading-tight tracking-[-0.15px] text-ink">{item.title}</span>
        <span className="mt-1 block truncate text-[15px] leading-tight tracking-[-0.15px] text-ink/55">{item.body}</span>
      </span>
    </Link>
  );
}

// Floats over the page: transparent at the top, frosted once the page scrolls under it, and
// solid white with a menu of cards when a section is open. "dark" is for pages with a dark top.
export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" | "brand" }) {
  const path = usePathname();
  const signedIn = useSignedIn();
  const [menu, setMenu] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shownPath, setShownPath] = useState(path);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dark = tone !== "light" && !menu;

  // Close menus after navigating (state adjusted during render, not in an effect).
  if (shownPath !== path) {
    setShownPath(path);
    setMenu(null);
    setMobile(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const first = requestAnimationFrame(onScroll); // a reload can land mid-page
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const open = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  };

  const navCls = (active: boolean) =>
    cx(
      "inline-flex h-8 items-center rounded-full px-4 text-sm font-[450] transition-colors",
      dark ? (active ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.08] hover:text-white") : active ? "bg-ink/[0.03] text-ink" : "text-ink/65 hover:bg-ink/[0.03] hover:text-ink",
    );
  const items = MENUS.find((m) => m.label === menu)?.items ?? [];

  return (
    <header
      onMouseLeave={closeSoon}
      onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-200 ease-out",
        menu ? "bg-white shadow-[0_1px_0_rgb(11_18_32/0.06)]" : scrolled && (dark ? "bg-[#0f1013]/80 shadow-[0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-[25px]" : "bg-white/90 shadow-[0_1px_0_rgb(11_18_32/0.05)] backdrop-blur-[25px]"),
      )}
    >
      <div className={cx("mx-auto flex max-w-[1082px] items-center px-6 transition-[height] duration-200 ease-out sm:px-12", scrolled && !menu ? "h-16" : "h-[76px] sm:h-[82px]")}>
        <Brand tone={dark ? "light" : "dark"} className="mr-auto" />

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Main">
          {MENUS.map((m) => (
            <button key={m.label} type="button" aria-expanded={menu === m.label} onMouseEnter={() => open(m.label)} onClick={() => setMenu((v) => (v === m.label ? null : m.label))} className={navCls(menu === m.label)}>
              {m.label}
            </button>
          ))}
          {!signedIn && (
            <Link href="/auth/login" className={navCls(false)}>
              Sign in
            </Link>
          )}
        </nav>
        <Link
          href={signedIn ? "/dashboard" : "/auth/signup"}
          className={cx("ml-4 hidden h-8 items-center rounded-full px-4 text-sm font-[450] tracking-[-0.14px] transition-colors lg:inline-flex", dark ? "bg-white text-ink hover:bg-[#ebebeb]" : "bg-ink text-white hover:bg-[#262b38]")}
        >
          {signedIn ? "Dashboard" : "Get started"}
        </Link>

        <button type="button" onClick={() => setMobile(true)} aria-label="Open menu" className={cx("grid size-10 place-items-center lg:hidden", dark ? "text-white" : "text-ink")}>
          <IcMenuLines className="text-2xl" />
        </button>
      </div>

      {menu && (
        <div className="hidden lg:block" onMouseEnter={() => menu && open(menu)}>
          <ul className="mx-auto grid max-w-[1082px] grid-cols-3 gap-4 px-12 pb-5">
            {items.map((item) => (
              <li key={item.href + item.title}>
                <MenuCard item={item} onPick={() => setMenu(null)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {mobile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-[76px] shrink-0 items-center justify-between px-6">
            <Brand />
            <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="grid size-10 place-items-center text-ink">
              <IcX className="text-2xl" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {MENUS.map((m) => (
              <div key={m.label} className="mb-6">
                <p className="mb-3 text-sm font-[450] tracking-[0.01em] text-brand-400">{m.label}</p>
                <ul className="flex flex-col gap-3">
                  {m.items.map((item) => (
                    <li key={item.href + item.title}>
                      <MenuCard item={item} onPick={() => setMobile(false)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 flex-col gap-3 border-t border-ink/5 p-5">
            {signedIn ? (
              <Link href="/dashboard" className="flex h-12 items-center justify-center rounded-full bg-ink text-[17px] font-medium text-white">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="flex h-12 items-center justify-center rounded-full bg-brand-500 text-[17px] font-medium text-white">
                  Create free account
                </Link>
                <Link href="/auth/login" className="flex h-12 items-center justify-center rounded-full bg-brand-500/10 text-[17px] font-medium text-brand-600">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
