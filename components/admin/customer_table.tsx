"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IcChevronLeft, IcChevronRight, IcChevronRight as IcGo, IcSearch, IcUsers } from "@/components/app/icons";
import { Alert, Badge, Empty, Skeleton } from "@/components/app/ui";
import { cx } from "@/lib/cx";
import { ApiError, errorMessage } from "@/lib/api/client";
import { adminApi, type CustomerRow, type KycState, type Pagination } from "@/lib/api/admin";
import { dateTime } from "@/lib/format";

export const kycBadge = (s: KycState | undefined) => {
  // Older backends don't send per-check statuses in lists: show unknown, not a guess.
  if (s === undefined || s === null) return <span className="text-ink-faint">—</span>;
  const v = String(s).toUpperCase();
  if (v === "VERIFIED") return <Badge tone="ok">Verified</Badge>;
  if (v === "FAILED") return <Badge tone="bad">Failed</Badge>;
  if (v === "REVOKED") return <Badge tone="bad">Revoked</Badge>;
  return <Badge tone="neutral">Not submitted</Badge>;
};

export function CustomerTable({ kycStatus, showStatusFilter, emptyTitle }: { kycStatus?: string; showStatusFilter?: boolean; emptyTitle: string }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  // Each result remembers which request it answers; a stale one is never shown.
  const reqKey = `${kycStatus ?? ""}|${query}|${status}|${page}`;
  const [result, setResult] = useState<{ key: string; rows: CustomerRow[] | null; pg: Pagination | null; error: string | null } | null>(null);
  const current = result?.key === reqKey ? result : null;
  const rows = current?.rows ?? null;
  const pg = current?.pg ?? null;
  const error = current?.error ?? null;

  // Debounce typing into the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let alive = true;
    const q = { search: query || undefined, status: status || undefined, page, limit: 20 };
    adminApi
      .customers({ ...q, kycStatus })
      // Backends older than the "review" filter reject it: fall back to all failed checks.
      .catch((e) => {
        if (kycStatus === "review" && e instanceof ApiError && e.code === "VALIDATION_ERROR") return adminApi.customers({ ...q, kycStatus: "failed" });
        throw e;
      })
      .then((r) => alive && setResult({ key: reqKey, rows: r.data, pg: r.pagination, error: null }))
      .catch((e) => alive && setResult({ key: reqKey, rows: null, pg: null, error: errorMessage(e) }));
    return () => {
      alive = false;
    };
  }, [kycStatus, query, status, page, reqKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
          <IcSearch className="text-ink-faint" aria-hidden />
          <span className="sr-only">Search customers</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" className="h-full w-full bg-transparent text-sm outline-none" />
        </label>
        {showStatusFilter && (
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Account status"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm"
          >
            <option value="">All accounts</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        )}
      </div>

      {error && <Alert tone="bad">{error}</Alert>}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
        {!rows && !error ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows && rows.length === 0 ? (
          <Empty icon={<IcUsers />} title={emptyTitle} body={query ? `Nothing matches “${query}”.` : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">BVN</th>
                  <th className="px-3 py-3 font-semibold">NIN</th>
                  <th className="px-3 py-3 font-semibold">Account</th>
                  <th className="px-3 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3" aria-label="Open" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows?.map((c) => (
                  <tr key={c.id} className="group hover:bg-canvas">
                    <td className="px-5 py-3">
                      <Link href={`/admin/customers/${c.id}`} className="block">
                        <span className="block font-medium text-ink group-hover:text-brand-700">{c.name || "—"}</span>
                        <span className="block text-xs text-ink-soft">{c.email ?? c.phone}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">{kycBadge(c.bvnStatus)}</td>
                    <td className="px-3 py-3">{kycBadge(c.ninStatus)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={c.status === "active" ? "ok" : "bad"}>{c.status === "active" ? "Active" : "Disabled"}</Badge>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{dateTime(c.joinedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/customers/${c.id}`} aria-label={`Open ${c.name}`} className="inline-grid size-8 place-items-center rounded-lg text-ink-faint hover:bg-white hover:text-ink">
                        <IcGo />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>
            {pg.total} customers · page {pg.page} of {pg.totalPages}
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={cx("grid size-9 place-items-center rounded-lg ring-1 ring-line", page <= 1 ? "opacity-40" : "hover:bg-white")} aria-label="Previous page">
              <IcChevronLeft />
            </button>
            <button disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)} className={cx("grid size-9 place-items-center rounded-lg ring-1 ring-line", page >= pg.totalPages ? "opacity-40" : "hover:bg-white")} aria-label="Next page">
              <IcChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
