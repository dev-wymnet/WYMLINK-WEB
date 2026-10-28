"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { IcDocument, IcIdCard, IcKeyRound, IcLayoutDashboard, IcLifeBuoy, IcLogOut, IcShieldCheck, IcUsers, IcLandmark } from "@/components/app/icons";
import { Brand } from "@/components/app/brand";
import { cx } from "@/lib/cx";
import { AdminProvider, ROLE_LABEL, useAdmin } from "@/features/admin/admin_context";

const NAV = [
  { href: "/admin", label: "Overview", icon: IcLayoutDashboard, exact: true },
  { href: "/admin/kyc", label: "KYC reviews", icon: IcIdCard },
  { href: "/admin/customers", label: "Customers", icon: IcUsers },
  { href: "/admin/support", label: "Support", icon: IcLifeBuoy },
  { href: "/admin/collections", label: "Collections", icon: IcLandmark, perm: "ADMIN_VIEW_PAYOUTS" },
  { href: "/admin/blog", label: "Blog", icon: IcDocument, roles: ["super_admin", "business_admin"] },
  { href: "/admin/staff", label: "Staff", icon: IcShieldCheck, perm: "ADMIN_MANAGE_ADMINS" },
  { href: "/admin/account", label: "Your account", icon: IcKeyRound },
];

function Console({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { admin, signOut, can, mustChangePassword } = useAdmin();
  const nav = NAV.filter((n) => (!("perm" in n) || !n.perm || can(n.perm)) && (!("roles" in n) || !n.roles || n.roles.includes(admin?.role ?? "")));

  // The backend refuses everything else until a temporary password is replaced.
  useEffect(() => {
    if (mustChangePassword && path !== "/admin/account") router.replace("/admin/account");
  }, [mustChangePassword, path, router]);

  if (!admin) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas" aria-busy="true">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink px-4 py-5 text-white lg:flex">
        <div className="flex items-center gap-2 px-2">
          <Brand href="/admin" tone="light" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300">Admin</span>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Admin">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path === href || path.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium", active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}
              >
                <Icon className="text-lg" aria-hidden /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="px-3 text-sm font-medium">
            {admin.firstName} {admin.lastName}
          </p>
          <p className="px-3 text-xs text-white/50">{ROLE_LABEL[admin.role] ?? admin.role}</p>
          <button onClick={() => void signOut()} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-white/60 hover:bg-white/5 hover:text-white">
            <IcLogOut className="text-lg" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <span className="font-semibold">Wymlink admin</span>
        <button onClick={() => void signOut()} className="text-sm font-medium text-ink-soft">
          Sign out
        </button>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 lg:hidden" aria-label="Admin">
        {nav.map(({ href, label, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cx("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium", active ? "bg-ink text-white" : "text-ink-soft")}>
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:ml-60 lg:max-w-none lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}

export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <Console>{children}</Console>
    </AdminProvider>
  );
}
