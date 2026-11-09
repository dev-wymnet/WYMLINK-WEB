"use client";

import { useCallback, useEffect, useState } from "react";
import { IcSparkles } from "@/components/app/icons";
import { Alert, Badge, Button, Card, Field, Modal, PageHeader, Skeleton } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { adminApi, type PromoOrder, type PromoOverview, type PromoSettings } from "@/lib/api/admin";
import { useAdmin } from "@/features/admin/admin_context";
import { dateTime, naira } from "@/lib/format";

// The free event (backend modules/promo). While it runs, customers get data, airtime and the
// base TV plans free within their allowances, paid from WymNet's Peyflex wallet. Super admins
// start it and change allowances; any staff member can end it (the kill switch).

const DEFAULTS: PromoSettings = {
  title: "Wymlink Launch Day",
  message: "Free data, airtime and TV today, on us! No money needed in your account. Just pick and buy.",
  dataMax: 8000,
  airtimeMax: 5000,
  tvPlans: ["gotv-easy", "dstv-starter36"],
  tvPerProvider: 1,
  budget: null,
};

const PRODUCT: Record<string, string> = { data: "Data", airtime: "Airtime", cable: "TV" };
const TONE = { success: "ok", pending: "warn", failed: "bad" } as const;

function SettingsForm({ initial, catalogue, submitLabel, onSubmit }: { initial: PromoSettings; catalogue: PromoOverview["tvCatalogue"]; submitLabel: string; onSubmit: (s: PromoSettings) => Promise<void> }) {
  const [s, setS] = useState(initial);
  const [budget, setBudget] = useState(initial.budget === null ? "" : String(initial.budget));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const num = (v: string) => Number(v.replace(/[^\d.]/g, "") || 0);
  const providers = ["gotv", "dstv", "startimes"].filter((p) => catalogue.some((c) => c.provider === p));
  const toggle = (code: string) => setS((x) => ({ ...x, tvPlans: x.tvPlans.includes(code) ? x.tvPlans.filter((c) => c !== code) : [...x.tvPlans, code] }));

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await onSubmit({ ...s, budget: budget.trim() ? num(budget) : null });
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Title (shown to customers)" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Message in the popup</span>
        <textarea
          value={s.message}
          onChange={(e) => setS({ ...s, message: e.target.value })}
          rows={3}
          className="rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Free data per customer" prefix="₦" inputMode="numeric" value={String(s.dataMax)} onChange={(e) => setS({ ...s, dataMax: num(e.target.value) })} hint="Also per phone number" />
        <Field label="Free airtime per customer" prefix="₦" inputMode="numeric" value={String(s.airtimeMax)} onChange={(e) => setS({ ...s, airtimeMax: num(e.target.value) })} hint="Also per phone number" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Free TV plans (pick each provider&apos;s base plan)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {providers.map((p) => (
            <div key={p} className="rounded-2xl border border-line p-3">
              <p className="mb-2 text-sm font-semibold uppercase text-ink-soft">{p}</p>
              <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                {catalogue
                  .filter((c) => c.provider === p)
                  .sort((a, b) => Number(a.amount) - Number(b.amount))
                  .map((c) => (
                    <li key={c.planCode}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-canvas">
                        <input type="checkbox" checked={s.tvPlans.includes(c.planCode)} onChange={() => toggle(c.planCode)} className="accent-[var(--color-brand-600)]" />
                        <span className="flex-1">{c.name}</span>
                        <span className="tabular-nums text-ink-soft">{naira(c.amount, { whole: true })}</span>
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        {!catalogue.length && <p className="text-sm text-ink-soft">Couldn&apos;t load TV plans from Peyflex. Selected: {s.tvPlans.join(", ") || "none"}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Free TV subscriptions per provider" inputMode="numeric" value={String(s.tvPerProvider)} onChange={(e) => setS({ ...s, tvPerProvider: num(e.target.value) })} hint="Per customer and per smartcard" />
        <Field label="Total budget (optional)" prefix="₦" inputMode="numeric" placeholder="No limit" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))} hint="Free purchases stop once this much is given out" />
      </div>
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" size="lg" loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}

export default function EventPage() {
  const { admin } = useAdmin();
  const superAdmin = admin?.role === "super_admin";
  const [data, setData] = useState<PromoOverview | null>(null);
  const [orders, setOrders] = useState<PromoOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await adminApi.promo();
      setData(d);
      setError(null);
      if (d.current) setOrders((await adminApi.promoOrders(d.current.id)).orders);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  // Live while an event runs: refresh every 10 seconds.
  useEffect(() => {
    let alive = true;
    const tick = () => alive && void load();
    tick();
    const t = setInterval(tick, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [load]);

  const ev = data?.active ?? null;
  const cur = data?.current ?? null;
  const stats = cur?.stats;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Free event" subtitle="Free data, airtime and TV for customers, paid from WymNet's Peyflex wallet." />
      {error && <Alert tone="bad">{error}</Alert>}
      {notice && (
        <Alert tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {!data ? (
        <Skeleton className="h-64 w-full" />
      ) : ev ? (
        <Card className="border-2 border-brand-600">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="relative mt-1 flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
                  <span className="relative inline-flex size-3 rounded-full bg-ok" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ok">Live since {dateTime(ev.startedAt)}</p>
                  <h2 className="text-xl font-semibold text-ink">{ev.title}</h2>
                  <p className="text-sm text-ink-soft">{ev.message}</p>
                </div>
              </div>
              <Button variant="danger" size="lg" onClick={() => setConfirmEnd(true)}>
                End event now
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Given out", v: naira(stats?.committed ?? 0, { whole: true }) },
                { k: "Customers", v: String(stats?.customers ?? 0) },
                { k: "Budget left", v: stats?.budgetLeft === null || stats?.budgetLeft === undefined ? "No limit" : naira(stats.budgetLeft, { whole: true }) },
                { k: "Peyflex wallet", v: stats?.peyflexBalance ? naira(stats.peyflexBalance, { whole: true }) : "—" },
              ].map(({ k, v }) => (
                <div key={k} className="rounded-2xl bg-canvas p-4">
                  <dt className="text-xs text-ink-soft">{k}</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["data", "airtime", "cable"] as const).map((p) => {
                const row = stats?.byProduct.find((b) => b.product === p);
                return (
                  <div key={p} className="rounded-2xl border border-line p-4">
                    <p className="text-sm font-semibold text-ink">{PRODUCT[p]}</p>
                    <p className="text-2xl font-semibold tabular-nums">{naira(row?.deliveredAmount ?? 0, { whole: true })}</p>
                    <p className="text-xs text-ink-soft">
                      {row?.delivered ?? 0} delivered · {row?.pending ?? 0} pending · {row?.failed ?? 0} failed
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-ink-soft">
              Allowances: data {naira(ev.dataMax, { whole: true })}, airtime {naira(ev.airtimeMax, { whole: true })} per customer and per phone number. TV:{" "}
              {ev.tvPlans.map((c) => data.tvCatalogue.find((t) => t.planCode === c)?.name ?? c).join(", ") || "none"}, {ev.tvPerProvider} per provider.
            </p>
            {superAdmin && !editing && (
              <div>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Change allowances
                </Button>
              </div>
            )}
            {superAdmin && editing && (
              <div className="border-t border-line pt-5">
                <SettingsForm
                  initial={{ title: ev.title, message: ev.message, dataMax: Number(ev.dataMax), airtimeMax: Number(ev.airtimeMax), tvPlans: ev.tvPlans, tvPerProvider: ev.tvPerProvider, budget: ev.budget === null ? null : Number(ev.budget) }}
                  catalogue={data.tvCatalogue}
                  submitLabel="Save changes"
                  onSubmit={async (s) => {
                    await adminApi.updatePromo(ev.id, s);
                    setEditing(false);
                    setNotice("Allowances updated. They apply to the next purchase.");
                    await load();
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <IcSparkles className="text-3xl text-brand-600" aria-hidden />
            <div>
              <h2 className="font-semibold text-ink">No event running</h2>
              <p className="text-sm text-ink-soft">Customers pay for everything as usual.</p>
            </div>
          </div>
          {superAdmin ? (
            <SettingsForm
              initial={DEFAULTS}
              catalogue={data.tvCatalogue}
              submitLabel="Start the event now"
              onSubmit={async (s) => {
                await adminApi.startPromo(s);
                setNotice("The event is live. Customers see the popup when they open the app or website.");
                await load();
              }}
            />
          ) : (
            <p className="text-sm text-ink-soft">A super admin starts events.</p>
          )}
        </Card>
      )}

      {cur && (
        <Card flush>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="font-semibold text-ink">{ev ? "Free purchases (live)" : `Last event: ${cur.title}`}</h2>
            {!ev && cur.endedAt && <Badge tone="neutral">Ended {dateTime(cur.endedAt)}</Badge>}
          </div>
          {!orders ? (
            <Skeleton className="m-5 h-40" />
          ) : orders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">No free purchases yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-ink-soft">
                  <tr>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">What</th>
                    <th className="px-3 py-3 font-medium">To</th>
                    <th className="px-3 py-3 text-right font-medium">Amount</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{o.customer}</p>
                        <p className="text-xs text-ink-soft">{o.customerCode}</p>
                      </td>
                      <td className="px-3 py-3">{PRODUCT[o.product] ?? o.product}{o.planName ? ` · ${o.planName}` : ""}</td>
                      <td className="px-3 py-3 tabular-nums">{o.recipient}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{naira(o.amount, { whole: true })}</td>
                      <td className="px-3 py-3">
                        <Badge tone={TONE[o.status]}>{o.status === "success" ? "Delivered" : o.status === "pending" ? "Pending" : "Failed"}</Badge>
                        {o.status === "failed" && o.lastError && <p className="text-xs text-ink-soft">{o.lastError}</p>}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{dateTime(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={confirmEnd} onClose={() => !ending && setConfirmEnd(false)} title="End the free event?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">Free purchases stop immediately. Anything already sent to Peyflex finishes. You can start a new event later.</p>
          <Button
            variant="danger"
            block
            size="lg"
            loading={ending}
            onClick={async () => {
              if (!ev) return;
              setEnding(true);
              try {
                await adminApi.endPromo(ev.id);
                setConfirmEnd(false);
                setNotice("The event has ended. Free purchases are off.");
                await load();
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setEnding(false);
              }
            }}
          >
            Yes, end it now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
