"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader, Skeleton } from "@/components/app/ui";
import { CustomerTable } from "@/components/admin/customer_table";
import { cx } from "@/lib/cx";

const TABS = [
  // Backend kycStatus filter: review = a BVN or NIN submitted and waiting for staff.
  { id: "review", label: "Needs review", empty: "Nothing waiting. New BVN and NIN submissions appear here." },
  { id: "failed", label: "Rejected", empty: "No rejected checks." },
  { id: "none", label: "Not started", empty: "Every customer has started verification." },
  { id: "verified", label: "Verified", empty: "No verified customers yet." },
] as const;

function KycQueue() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = TABS.find((t) => t.id === params.get("tab")) ?? TABS[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="KYC reviews" subtitle="Open a customer to see their checks and approve or reject them. Every decision is logged." />
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-[var(--shadow-card)] sm:self-start">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab.id === t.id}
            onClick={() => router.replace(`/admin/kyc?tab=${t.id}`)}
            className={cx("whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium", tab.id === t.id ? "bg-ink text-white" : "text-ink-soft hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CustomerTable key={tab.id} kycStatus={tab.id} emptyTitle={tab.empty} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <KycQueue />
    </Suspense>
  );
}
