"use client";

import Link from "next/link";
import { useState } from "react";
import { IcSmartphone, IcSparkles, IcTv, IcWifi, IcZap } from "@/components/app/icons";
import { Button, Modal } from "@/components/app/ui";
import { useAccount } from "@/features/app/account_context";
import { naira, toNumber } from "@/lib/format";
import type { PromoState } from "@/lib/api/wymlink";

// The free event (backend modules/promo): a popup when a signed-in customer arrives during
// one, and a banner on the dashboard with what they have left.

const SEEN_KEY = (id: string) => `wl-event-seen:${id}`;

export const freeLeft = (promo: PromoState | null) => ({
  data: toNumber(promo?.mine?.dataLeft ?? 0),
  airtime: toNumber(promo?.mine?.airtimeLeft ?? 0),
  electricity: toNumber(promo?.mine?.electricityLeft ?? 0),
});

// Base TV plans still free for this customer (each provider counts separately).
export const freeTvPlans = (promo: PromoState | null) =>
  (promo?.event?.tvPlans ?? []).filter((p) => (promo?.mine?.tvUsed?.[p.provider] ?? 0) < (promo?.event?.tvPerProvider ?? 0));

const tvLabel = (provider: string) => (provider === "gotv" ? "GOtv" : provider === "dstv" ? "DStv" : provider.charAt(0).toUpperCase() + provider.slice(1));

function Allowances({ promo, onPick }: { promo: PromoState; onPick?: () => void }) {
  const left = freeLeft(promo);
  const tv = freeTvPlans(promo);
  const rows = [
    { href: "/dashboard/airtime?tab=data", icon: IcWifi, label: "Data", value: left.data > 0 ? `${naira(left.data, { whole: true })} free` : "Used up", on: left.data > 0 },
    { href: "/dashboard/airtime", icon: IcSmartphone, label: "Airtime", value: left.airtime > 0 ? `${naira(left.airtime, { whole: true })} free` : "Used up", on: left.airtime > 0 },
    ...(toNumber(promo.event?.electricityMax ?? 0) > 0
      ? [{ href: "/dashboard/bills/electricity", icon: IcZap, label: "Electricity", value: left.electricity > 0 ? `${naira(left.electricity, { whole: true })} free` : "Used up", on: left.electricity > 0 }]
      : []),
    ...(promo.event?.tvPlans ?? []).map((p) => {
      const on = tv.some((t) => t.planCode === p.planCode);
      return { href: `/dashboard/bills/cable?provider=${p.provider}`, icon: IcTv, label: `${tvLabel(p.provider)} ${p.name.replace(/^(gotv|dstv)\s*/i, "")}`, value: on ? "Free" : "Used", on };
    }),
  ];
  return (
    <ul className="grid gap-2">
      {rows.map(({ href, icon: Icon, label, value, on }) => (
        <li key={label}>
          <Link
            href={href}
            onClick={onPick}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${on ? "border-brand-200 bg-brand-50 hover:border-brand-400" : "pointer-events-none border-line bg-canvas opacity-60"}`}
          >
            <Icon className="text-xl text-brand-700" aria-hidden />
            <span className="flex-1 font-medium text-ink">{label}</span>
            <span className={`text-sm font-semibold ${on ? "text-brand-700" : "text-ink-soft"}`}>{value}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Shown once per browser session for each event, as soon as the customer is in.
const seenEvent = (id: string) => {
  try {
    return sessionStorage.getItem(SEEN_KEY(id)) === "1";
  } catch {
    return false;
  }
};

export function EventPopup() {
  const { promo } = useAccount();
  const id = promo?.event?.id ?? null;
  const [dismissed, setDismissed] = useState<string | null>(null);
  // Rendered only in the signed-in (client-side) dashboard, so session storage is there.
  const open = Boolean(id) && dismissed !== id && !seenEvent(id!);

  const close = () => {
    setDismissed(id);
    try {
      if (id) sessionStorage.setItem(SEEN_KEY(id), "1");
    } catch {}
  };

  if (!promo?.event) return null;
  return (
    <Modal open={open} onClose={close} title={promo.event.title}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-brand-600 p-4 text-white">
          <IcSparkles className="mt-0.5 shrink-0 text-2xl" aria-hidden />
          <p className="text-[15px] leading-relaxed">{promo.event.message}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Everything below is on us today. No money needed in your account.</p>
          <Allowances promo={promo} onPick={close} />
        </div>
        <Button block size="lg" onClick={close}>
          Start buying
        </Button>
      </div>
    </Modal>
  );
}

// On purchase forms during an event: pay with the free allowance (default) or the wallet.
export function FreeToggle({ on, onChange, title, detail }: { on: boolean; onChange: (v: boolean) => void; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <IcSparkles className="shrink-0 text-2xl text-brand-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-soft">{on ? detail : "Paying from your balance instead."}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Use the free allowance"
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// Dashboard banner while an event runs.
export function EventBanner() {
  const { promo } = useAccount();
  if (!promo?.event) return null;
  return (
    <section aria-label={promo.event.title} className="overflow-hidden rounded-3xl bg-brand-600 text-white shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <IcSparkles className="mt-0.5 shrink-0 text-2xl" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold">{promo.event.title}</h2>
            <p className="text-sm text-brand-100">{promo.event.message}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-2 text-ink">
          <Allowances promo={promo} />
        </div>
      </div>
    </section>
  );
}
