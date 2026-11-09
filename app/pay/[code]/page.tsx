"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IcBuilding2, IcCircleAlert } from "@/components/app/icons";
import { Brand } from "@/components/app/brand";
import { Alert, Button, Card, Field, Skeleton } from "@/components/app/ui";
import { Outcome, PENDING_BODY } from "@/components/app/outcome";
import { PinSheet } from "@/components/app/pin_sheet";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { AccountProvider, useAccount } from "@/features/app/account_context";
import { errorMessage, newReference } from "@/lib/api/client";
import { businesses, type BusinessInfo } from "@/lib/api/wymlink";
import { naira, toNumber } from "@/lib/format";

// Where a WymNet business's QR code leads (/pay/<code>): any phone camera opens it. Shows the
// business, then the signed-in customer enters an amount and their PIN; the money moves from
// their Wymlink account to the business's.

function PayForm({ business }: { business: BusinessInfo }) {
  const { home, refresh, loading } = useAccount();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState<{ status: "success" | "pending" | "failed"; amount: number } | null>(null);
  const balance = home?.wallet.balance ?? 0;

  if (done) {
    return (
      <Outcome
        status={done.status}
        title={done.status === "success" ? `Paid ${business.name}` : done.status === "pending" ? "Payment processing" : "Payment failed"}
        body={done.status === "success" ? `${naira(done.amount)} sent to ${business.name}. Show this screen as your receipt.` : done.status === "pending" ? PENDING_BODY : "Nothing was taken from your account."}
        againLabel="Pay again"
        onAgain={() => setDone(null)}
      />
    );
  }

  return (
    <>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const amt = toNumber(amount);
          if (!amt || amt < 100) return setError("The minimum payment is ₦100.");
          if (amt > balance) return setError(`Not enough balance (${naira(balance)}). Add money first.`);
          setError(null);
          setReference(newReference("biz"));
        }}
      >
        <Field
          label="Amount"
          inputMode="decimal"
          prefix="₦"
          placeholder="0"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          hint={loading ? "Checking your balance…" : `Balance: ${naira(balance)}`}
        />
        {error && <Alert tone="bad">{error}</Alert>}
        <Button type="submit" block size="lg" disabled={!toNumber(amount)}>
          {toNumber(amount) ? `Pay ${naira(amount)}` : "Continue"}
        </Button>
        {!loading && balance < 100 && (
          <Button variant="secondary" block href="/dashboard/fund">
            Add money first
          </Button>
        )}
      </form>
      <PinSheet
        open={reference !== null}
        onClose={() => setReference(null)}
        summary={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-soft">Pay</dt>
            <dd className="text-right font-semibold">{business.name}</dd>
            <dt className="text-ink-soft">Amount</dt>
            <dd className="text-right font-semibold">{naira(amount)}</dd>
          </dl>
        }
        onConfirm={async (transactionPin) => {
          const amt = toNumber(amount);
          const r = await businesses.pay(business.code, { amount: amt.toFixed(2), transactionPin, reference: reference! });
          setReference(null);
          setDone({ status: r.transfer.status, amount: amt });
          setAmount("");
          void refresh();
        }}
      />
    </>
  );
}

export default function PayBusinessPage() {
  const { code } = useParams<{ code: string }>();
  const { isHydrated, isAuthenticated } = Use_Auth_Context();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const here = `/pay/${encodeURIComponent(code ?? "")}`;

  useEffect(() => {
    if (!code) return;
    businesses
      .get(code)
      .then(setBusiness)
      .catch((e) => setError(errorMessage(e)));
  }, [code]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-md items-center px-5">
          <Brand href="/" />
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col gap-5 px-5 py-8">
        {error ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <IcCircleAlert className="text-4xl text-bad" aria-hidden />
              <h1 className="text-lg font-semibold">This code can&apos;t take payments</h1>
              <p className="text-sm text-ink-soft">{error}</p>
            </div>
          </Card>
        ) : !business ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-3xl text-brand-600">
                  <IcBuilding2 aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink-soft">You&apos;re paying</p>
                  <h1 className="truncate text-xl font-semibold tracking-tight">{business.name}</h1>
                  <p className="text-xs text-ink-faint">A WymNet Data Solutions business · {business.code}</p>
                </div>
              </div>
            </Card>
            <Card>
              {!business.acceptsPayments ? (
                <Alert tone="warn">{business.name} isn&apos;t taking payments right now.</Alert>
              ) : !isHydrated ? (
                <Skeleton className="h-32 w-full" />
              ) : isAuthenticated ? (
                <AccountProvider>
                  <PayForm business={business} />
                </AccountProvider>
              ) : (
                <div className="flex flex-col gap-3 text-center">
                  <p className="text-sm text-ink-soft">Sign in to pay from your Wymlink account.</p>
                  <Button block size="lg" href={`/auth/login?next=${encodeURIComponent(here)}`}>
                    Sign in to pay
                  </Button>
                  <Button block variant="secondary" href={`/auth/signup?next=${encodeURIComponent(here)}`}>
                    Create a free account
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
