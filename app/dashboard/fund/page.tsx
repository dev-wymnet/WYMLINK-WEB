"use client";

import { IcBuilding2, IcClock, IcLoaderCircle, IcShieldCheck } from "@/components/app/icons";
import { Alert, Card, CopyButton, PageHeader, Skeleton } from "@/components/app/ui";
import { AccountNumberPending } from "@/components/app/account_pending";
import { useAccount } from "@/features/app/account_context";
import { useEffect, useRef } from "react";
import { wallet } from "@/lib/api/wymlink";

// While this page is open, check the bank for deposits every minute: a deposit whose
// notification never reached us is found here and credited (the backend checks the bank
// at most once every 10 minutes per customer, so this is cheap).
function useDepositCheck(onNew: () => void) {
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const { deposits } = await wallet.deposits(20);
        const credited = deposits.filter((d) => d.status === "credited").map((d) => d.id);
        if (!alive) return;
        if (seen.current && credited.some((id) => !seen.current!.has(id))) onNew();
        seen.current = new Set(credited);
      } catch {
        /* try again next minute */
      }
    };
    void check();
    const t = setInterval(check, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [onNew]);
}

export default function FundPage() {
  const { home, loading, refresh } = useAccount();
  useDepositCheck(refresh);
  const w = home?.wallet;
  // Moneta names the account "MONETA TECH(WYMNET-<customer ID>)": banks show that name.
  const name = w?.accountName || home?.user.fullName;
  const code = home?.user.customerCode;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Add money" subtitle="Transfer from any Nigerian bank app to your personal Wymlink account." />

      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : w?.accountNumber ? (
        <Card flush className="overflow-hidden">
          <div className="bg-brand-600 px-6 py-7 text-white">
            <p className="text-sm text-brand-100">Your Wymlink account number</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-semibold tracking-[0.12em] tabular-nums">{w.accountNumber}</p>
              <span className="[&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
                <CopyButton value={w.accountNumber} label="Copy number" />
              </span>
            </div>
          </div>
          <dl className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-6 py-4">
              <dt className="text-xs text-ink-soft">Bank</dt>
              <dd className="font-medium text-ink">{w.bankName || "—"}</dd>
            </div>
            <div className="px-6 py-4">
              <dt className="text-xs text-ink-soft">Account name</dt>
              <dd className="break-words font-medium text-ink">{name || "—"}</dd>
            </div>
            <div className="px-6 py-4">
              <dt className="text-xs text-ink-soft">Your customer ID</dt>
              <dd className="font-medium tracking-wider text-ink">{code || "—"}</dd>
            </div>
          </dl>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-14 place-items-center text-4xl text-brand-600">
              <IcLoaderCircle className="animate-spin" />
            </span>
            <h2 className="font-semibold text-ink">Setting up your account number</h2>
            <AccountNumberPending className="max-w-md text-sm text-ink-soft" />
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold text-ink">How it works</h2>
        <ol className="flex flex-col gap-4">
          {[
            { icon: IcBuilding2, t: "Open your bank app", b: "Choose transfer to another bank and enter the account number above." },
            { icon: IcClock, t: "Money arrives in minutes", b: "Your Wymlink balance updates automatically — no need to send proof." },
            { icon: IcShieldCheck, t: "Only you can spend it", b: "Every payment needs your 4-digit transaction PIN." },
          ].map(({ icon: Icon, t, b }, i) => (
            <li key={t} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center text-ink-soft text-2xl">
                <Icon aria-hidden />
              </span>
              <div>
                <p className="font-medium text-ink">
                  {i + 1}. {t}
                </p>
                <p className="text-sm text-ink-soft">{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Alert tone="info" title="Delayed deposit?">
        Transfers usually land within minutes. If yours hasn&apos;t arrived after 30 minutes, email info@wymnet.org with your bank&apos;s receipt.
      </Alert>
    </div>
  );
}
