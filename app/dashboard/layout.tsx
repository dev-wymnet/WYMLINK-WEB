"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  IcArrowUpRight,
  IcHouse,
  IcLifeBuoy,
  IcLogOut,
  IcReceipt,
  IcShieldCheck,
  IcSmartphone,
  IcUser,
  IcWallet,
  IcZap,
} from "@/components/app/icons";
import { Brand } from "@/components/app/brand";
import { cx } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { AccountProvider, useAccount } from "@/features/app/account_context";

const NAV = [
  { href: "/dashboard", label: "Home", icon: IcHouse, exact: true },
  { href: "/dashboard/fund", label: "Add money", icon: IcWallet },
  { href: "/dashboard/airtime", label: "Airtime & data", icon: IcSmartphone },
  { href: "/dashboard/bills", label: "Bills", icon: IcZap },
  { href: "/dashboard/transfer", label: "Transfer", icon: IcArrowUpRight },
  { href: "/dashboard/transactions", label: "Transactions", icon: IcReceipt },
  { href: "/dashboard/security", label: "Security & KYC", icon: IcShieldCheck },
  { href: "/dashboard/profile", label: "Profile", icon: IcUser },
];
// Bottom bar on phones: Bills also covers airtime & data (the Bills page links to them).
const MOBILE_NAV: Array<(typeof NAV)[number] & { short: string; also?: string[] }> = [
  { ...NAV[0], short: "Home" },
  { ...NAV[3], short: "Pay bills", also: ["/dashboard/airtime"] },
  { ...NAV[4], short: "Transfer" },
  { ...NAV[5], short: "History" },
  { ...NAV[7], short: "Profile", also: ["/dashboard/security"] },
];

const isActive = (path: string, href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(`${href}/`));

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = Use_Auth_Context();
  const { needsPin, bvnVerified, ninVerified, loading } = useAccount();
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "W";
  const setupLeft = !loading && (needsPin || !(bvnVerified || ninVerified));

  const signOut = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <Brand href="/dashboard" className="px-2" />
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(path, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-canvas hover:text-ink",
                )}
              >
                <Icon className="text-lg" aria-hidden />
                {label}
                {href === "/dashboard/security" && setupLeft && <span className="ml-auto size-2 rounded-full bg-warn" aria-label="Action needed" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-line pt-4">
          <a href="mailto:info@wymnet.org" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">
            <IcLifeBuoy className="text-lg" aria-hidden /> Help & support
          </a>
          <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-ink-soft hover:bg-bad-soft hover:text-bad">
            <IcLogOut className="text-lg" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand href="/dashboard" className="lg:hidden" />
          <p className="hidden text-sm text-ink-soft lg:block">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-canvas" aria-label="Your profile">
            <span className="grid size-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{initials}</span>
            <span className="hidden text-sm font-medium sm:block">{user?.firstName ?? "Account"}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Main">
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map(({ href, short, icon: Icon, exact, also }) => {
            const active = isActive(path, href, exact) || Boolean(also?.some((a) => isActive(path, a)));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-brand-600" : "text-ink-faint")}
                >
                  <Icon className="text-xl" aria-hidden />
                  {short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { isHydrated, isAuthenticated } = Use_Auth_Context();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) router.replace(`/auth/login?next=${encodeURIComponent(path)}`);
    else setReady(true);
  }, [isHydrated, isAuthenticated, router, path]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas" aria-busy="true">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  return (
    <AccountProvider>
      <Shell>{children}</Shell>
    </AccountProvider>
  );
}
