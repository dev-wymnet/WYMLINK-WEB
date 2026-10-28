"use client";

import { useEffect, useMemo, useState } from "react";
import { IcReceipt } from "@/components/app/icons";
import { Alert, Badge, Card, CopyButton, Empty, Modal, PageHeader, Skeleton, cx, statusTone } from "@/components/app/ui";
import { LedgerItem } from "@/components/app/ledger_item";
import { errorMessage } from "@/lib/api/client";
import { wallet, type LedgerRow } from "@/lib/api/wymlink";
import { dateTime, naira, relativeDay, titleCase } from "@/lib/format";

type Filter = "all" | "in" | "out";

export default function TransactionsPage() {
  const [rows, setRows] = useState<LedgerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<LedgerRow | null>(null);

  useEffect(() => {
    wallet
      .transactions(200)
      .then((r) => setRows(r.transactions ?? []))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const groups = useMemo(() => {
    const list = (rows ?? []).filter((r) => (filter === "all" ? true : filter === "in" ? r.direction === "credit" : r.direction === "debit"));
    const map = new Map<string, LedgerRow[]>();
    for (const r of list) {
      const k = relativeDay(r.createdAt);
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()];
  }, [rows, filter]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Transactions" subtitle="Every naira in and out of your wallet." />
      <div className="flex gap-2" role="tablist">
        {(["all", "in", "out"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cx("rounded-full px-4 py-2 text-sm font-medium transition", filter === f ? "bg-ink text-white" : "bg-white text-ink-soft shadow-[var(--shadow-card)] hover:text-ink")}
          >
            {f === "all" ? "All" : f === "in" ? "Money in" : "Money out"}
          </button>
        ))}
      </div>

      {error && <Alert tone="bad">{error}</Alert>}

      <Card flush>
        {!rows && !error ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Empty icon={<IcReceipt />} title="Nothing here yet" body="Your payments and deposits will show up here." />
        ) : (
          groups.map(([day, items]) => (
            <section key={day}>
              <h2 className="sticky top-16 z-10 border-b border-line bg-canvas/95 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-ink-soft backdrop-blur">{day}</h2>
              <ul className="divide-y divide-line">
                {items.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => setOpen(t)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-canvas sm:px-6">
                      <LedgerItem row={t} meta={new Date(t.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </Card>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title="Receipt">
        {open && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <p className={cx("text-3xl font-semibold tabular-nums", open.direction === "credit" ? "text-ok" : "text-ink")}>
                {open.direction === "credit" ? "+" : "−"}
                {naira(open.amount)}
              </p>
              <div className="mt-2">
                <Badge tone={statusTone(open.status)}>{titleCase(open.status)}</Badge>
              </div>
            </div>
            <dl className="divide-y divide-line rounded-2xl border border-line text-sm">
              {[
                ["Type", titleCase(open.transactionType)],
                ["Description", open.description || "—"],
                ["Date", dateTime(open.createdAt)],
                ["Balance before", open.balanceBefore != null ? naira(open.balanceBefore) : "—"],
                ["Balance after", open.balanceAfter != null ? naira(open.balanceAfter) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
              {open.referenceCode && (
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-ink-soft">Reference</dt>
                  <dd className="flex items-center gap-1 font-mono text-xs text-ink">
                    <span className="max-w-[160px] truncate">{open.referenceCode}</span>
                    <CopyButton value={open.referenceCode} label="" />
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-center text-xs text-ink-faint">Problem with this transaction? Email info@wymnet.org with the reference.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
