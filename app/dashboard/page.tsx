"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IcArrowUpRight,
  IcChevronRight,
  IcCircleCheck,
  IcEye,
  IcEyeOff,
  IcIdCard,
  IcKeyRound,
  IcPlus,
  IcReceipt,
  IcRefreshCw,
  IcSmartphone,
  IcTv,
  IcWifi,
  IcZap,
} from "@/components/app/icons";
import { Alert, Button, Card, CopyButton, Empty, Skeleton, cx } from "@/components/app/ui";
import { LedgerItem } from "@/components/app/ledger_item";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { useAccount } from "@/features/app/account_context";
import { naira, relativeDay } from "@/lib/format";

const ACTIONS = [
  { href: "/dashboard/airtime", label: "Airtime", icon: IcSmartphone },
  { href: "/dashboard/airtime?tab=data", label: "Data", icon: IcWifi },
  { href: "/dashboard/bills/cable", label: "Cable TV", icon: IcTv },
  { href: "/dashboard/bills/electricity", label: "Electricity", icon: IcZap },
  { href: "/dashboard/transfer", label: "Transfer", icon: IcArrowUpRight },
];

function Setup() {
  const { needsPin, bvnVerified, ninVerified, pinStatus, loading } = useAccount();
  if (loading) return null;
  const kycDone = bvnVerified || ninVerified;
  const pinKnown = pinStatus !== null;
  const steps = [
    { done: pinKnown ? !needsPin : false, title: "Create your transaction PIN", body: "Approves every payment you make.", href: "/dashboard/security?setup=pin", icon: IcKeyRound },
    { done: kycDone, title: "Verify your identity", body: "Add your BVN or NIN to unlock higher limits.", href: "/dashboard/security#kyc", icon: IcIdCard },
  ];
  const left = steps.filter((s) => !s.done);
  if (!left.length) return null;
  return (
    <Card className="bg-tint">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Finish setting up your account</h2>
          <p className="text-sm text-ink-soft">
            {steps.length - left.length} of {steps.length} done
          </p>
        </div>
        <div className="h-2 w-28 overflow-hidden rounded-full bg-brand-100" aria-hidden>
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${((steps.length - left.length) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {steps.map(({ done, title, body, href, icon: Icon }) => (
          <li key={title}>
            <Link
              href={done ? "#" : href}
              aria-disabled={done}
              className={cx(
                "flex items-center gap-3 rounded-2xl border bg-white p-4 transition",
                done ? "pointer-events-none border-line opacity-70" : "border-brand-100 hover:border-brand-500",
              )}
            >
              <span className={cx("grid size-10 shrink-0 place-items-center text-2xl", done ? "text-ok" : "text-brand-600")}>
                {done ? <IcCircleCheck /> : <Icon />}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-ink">{title}</span>
                <span className="block text-sm text-ink-soft">{done ? "Done" : body}</span>
              </span>
              {!done && <IcChevronRight className="text-ink-faint" />}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function WalletCard() {
  const { home, loading } = useAccount();
  const [hidden, setHidden] = useState(false);
  const w = home?.wallet;
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-brand-600 p-6 text-white shadow-[var(--shadow-pop)] sm:p-7">
      {/* The same flat card as the mobile app, with its two soft rings. */}
      <div className="pointer-events-none absolute -right-14 -top-16 size-60 rounded-full border-[28px] border-white/[0.07]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-white/[0.06]" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 text-sm text-brand-100">
          Available balance
          <button onClick={() => setHidden((h) => !h)} aria-label={hidden ? "Show balance" : "Hide balance"} className="rounded-md p-1 hover:bg-white/10">
            {hidden ? <IcEye /> : <IcEyeOff />}
          </button>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-10 w-48 bg-white/20" />
        ) : (
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{hidden ? "₦ ••••••" : naira(w?.balance)}</p>
        )}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          {w?.accountNumber ? (
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-brand-100">Your account · {w.bankName || "Wymlink"}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold tracking-wider tabular-nums">{w.accountNumber}</p>
                <span className="[&_button]:text-white [&_button:hover]:bg-white/10">
                  <CopyButton value={w.accountNumber} />
                </span>
              </div>
            </div>
          ) : (
            !loading && <p className="max-w-xs text-sm text-brand-100">Your account number appears here once your identity is verified.</p>
          )}
          <Button variant="light" href="/dashboard/fund">
            <IcPlus /> Add money
          </Button>
        </div>
      </div>
    </section>
  );
}

function Activity() {
  const { recent, loading } = useAccount();
  const rows = recent ?? [];
  return (
    <Card flush>
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
        <h2 className="font-semibold text-ink">Recent activity</h2>
        <Link href="/dashboard/transactions" className="text-sm font-medium text-brand-600 hover:underline">
          See all
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3 p-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty icon={<IcReceipt />} title="No activity yet" body="Add money to your wallet to buy airtime, data and pay bills." />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
              <LedgerItem row={t} meta={relativeDay(t.createdAt)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function DashboardHome() {
  const { user } = Use_Auth_Context();
  const { home, error, refresh } = useAccount();
  const [refreshing, setRefreshing] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">{greeting},</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{user?.firstName ?? "there"} 👋</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Refresh"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }}
        >
          <IcRefreshCw className={cx(refreshing && "animate-spin")} /> <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {error && (
        <Alert tone="bad" title="We couldn't load your account">
          {error}
        </Alert>
      )}

      <Setup />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <WalletCard />
        <Card>
          <h2 className="mb-4 font-semibold text-ink">Your totals</h2>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { k: "Money in", v: naira(home?.analytics.totalFunded ?? 0, { whole: true }) },
              { k: "Money spent", v: naira(home?.analytics.totalSpent ?? 0, { whole: true }) },
              { k: "Airtime buys", v: home?.analytics.airtimePurchases ?? 0 },
              { k: "Data buys", v: home?.analytics.dataPurchases ?? 0 },
            ].map(({ k, v }) => (
              <div key={k} className="rounded-2xl bg-canvas p-4">
                <dt className="text-xs text-ink-soft">{k}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <section aria-label="Quick actions">
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {ACTIONS.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link href={href} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white px-1 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-4">
                <span className="grid size-10 place-items-center text-3xl text-brand-600 sm:size-12 sm:text-4xl">
                  <Icon aria-hidden />
                </span>
                <span className="text-[11px] font-medium text-ink sm:text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Activity />
    </div>
  );
}
