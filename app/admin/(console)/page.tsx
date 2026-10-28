"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IcArrowRight, IcBadgeCheck, IcCircleAlert, IcClock, IcUsers } from "@/components/app/icons";
import { PageHeader, Skeleton } from "@/components/app/ui";
import { adminApi } from "@/lib/api/admin";
import { useAdmin } from "@/features/admin/admin_context";

const TILES = [
  { key: "review", label: "Needs review", body: "A check failed and nothing is verified yet.", icon: IcCircleAlert, href: "/admin/kyc?tab=review" },
  { key: "pending", label: "Not started", body: "Signed up but haven't submitted BVN or NIN.", icon: IcClock, href: "/admin/kyc?tab=pending" },
  { key: "verified", label: "Verified", body: "At least one identity check passed.", icon: IcBadgeCheck, href: "/admin/kyc?tab=verified" },
  { key: "all", label: "All customers", body: "Every customer account.", icon: IcUsers, href: "/admin/customers" },
] as const;

export default function AdminOverview() {
  const { admin } = useAdmin();
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    for (const t of TILES) {
      adminApi
        .customers({ kycStatus: t.key === "all" ? undefined : t.key, limit: 1 })
        // Older backends don't know "review": count failed checks instead.
        .catch((e) => (t.key === "review" ? adminApi.customers({ kycStatus: "failed", limit: 1 }) : Promise.reject(e)))
        .then((r) => setCounts((c) => ({ ...c, [t.key]: r.pagination.total })))
        .catch(() => setCounts((c) => ({ ...c, [t.key]: null })));
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome, ${admin?.firstName ?? "admin"}`} subtitle="Identity checks and customer accounts at a glance." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TILES.map(({ key, label, body, icon: Icon, href }) => (
          <li key={key}>
            <Link href={href} className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-brand-200">
              <span className="mb-4 grid size-10 place-items-center text-2xl text-brand-600">
                <Icon />
              </span>
              <span className="text-sm text-ink-soft">{label}</span>
              <span className="mt-1 text-3xl font-semibold tabular-nums">{key in counts ? (counts[key] ?? "—") : <Skeleton className="h-9 w-16" />}</span>
              <span className="mt-2 flex-1 text-xs text-ink-soft">{body}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                Open <IcArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
