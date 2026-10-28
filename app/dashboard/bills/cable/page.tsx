"use client";

import { useEffect, useState } from "react";
import { IcBadgeCheck } from "@/components/app/icons";
import { Alert, Button, Card, Field, PageHeader, SelectField, Skeleton, cx } from "@/components/app/ui";
import { FAILED_BODY, Outcome, PENDING_BODY } from "@/components/app/outcome";
import { PinSheet } from "@/components/app/pin_sheet";
import { useAccount } from "@/features/app/account_context";
import { errorMessage, newReference } from "@/lib/api/client";
import { bills, purchaseOutcome, type CablePlan, type PurchaseOutcome } from "@/lib/api/wymlink";
import { naira, normalizeNgPhone, toNumber } from "@/lib/format";

export default function CablePage() {
  const { home, refresh } = useAccount();
  const [providers, setProviders] = useState<Array<{ identifier: string; name: string }> | null>(null);
  const [provider, setProvider] = useState("");
  const [plans, setPlans] = useState<CablePlan[] | null>(null);
  const [planCode, setPlanCode] = useState("");
  const [iuc, setIuc] = useState("");
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState<{ status: PurchaseOutcome; body: string } | null>(null);
  const balance = home?.wallet.balance ?? 0;
  const plan = plans?.find((p) => p.plan_code === planCode) ?? null;
  const price = plan ? toNumber(plan.amount) : 0;

  useEffect(() => {
    bills
      .cableProviders()
      .then((r) => setProviders(r.providers ?? []))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!provider) return;
    setPlans(null);
    setPlanCode("");
    setCustomer(null);
    bills
      .cablePlans(provider)
      .then((r) => setPlans([...(r.plans ?? [])].sort((a, b) => toNumber(a.amount) - toNumber(b.amount))))
      .catch((e) => setError(errorMessage(e)));
  }, [provider]);

  const verify = async () => {
    if (!provider || iuc.length < 8) return setError("Enter a valid smartcard / IUC number.");
    setVerifying(true);
    setError(null);
    setCustomer(null);
    try {
      const r = await bills.verifyCable(provider, iuc);
      if (!r.customer_name) throw new Error(r.message ?? "We couldn't find that smartcard number.");
      setCustomer(r.customer_name);
    } catch (e) {
      setError(errorMessage(e) === "Something went wrong." ? "We couldn't verify that smartcard number. Check it and try again." : errorMessage(e));
    } finally {
      setVerifying(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <Outcome
            status={done.status}
            title={done.status === "success" ? "Subscription paid" : done.status === "pending" ? "Payment processing" : "Payment failed"}
            body={done.status === "success" ? done.body : done.status === "pending" ? PENDING_BODY : FAILED_BODY}
            againLabel="Pay another"
            onAgain={() => setDone(null)}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Cable TV" subtitle="Renew DStv, GOtv or StarTimes in seconds." />
      <Card>
        {!providers ? (
          <Skeleton className="h-48" />
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!customer) return setError("Verify the smartcard number first.");
              if (!plan) return setError("Choose a package.");
              if (!normalizeNgPhone(phone)) return setError("Enter a valid phone number for the receipt.");
              if (price > balance) return setError(`Not enough balance (${naira(balance)}). Add money first.`);
              setError(null);
              setReference(newReference("cab"));
            }}
          >
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Provider</p>
              <div className="grid grid-cols-3 gap-2">
                {providers.map((p) => (
                  <button
                    key={p.identifier}
                    type="button"
                    onClick={() => setProvider(p.identifier)}
                    aria-pressed={provider === p.identifier}
                    className={cx("rounded-xl border-2 py-3 text-sm font-semibold transition", provider === p.identifier ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line hover:border-brand-200")}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {provider && (
              <>
                <Field
                  label="Smartcard / IUC number"
                  inputMode="numeric"
                  value={iuc}
                  onChange={(e) => {
                    setIuc(e.target.value.replace(/\D/g, ""));
                    setCustomer(null);
                  }}
                  onBlur={() => iuc.length >= 8 && !customer && void verify()}
                  suffix={
                    <Button type="button" size="sm" variant="ghost" loading={verifying} onClick={() => void verify()}>
                      Verify
                    </Button>
                  }
                />
                {customer && (
                  <div className="flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm">
                    <IcBadgeCheck className="text-ok" /> <span className="font-medium text-ink">{customer}</span>
                  </div>
                )}
                <SelectField label="Package" value={planCode} onChange={(e) => setPlanCode(e.target.value)} disabled={!plans}>
                  <option value="">{plans ? "Choose a package" : "Loading packages…"}</option>
                  {plans?.map((p) => (
                    <option key={p.plan_code} value={p.plan_code}>
                      {p.display ?? p.plan_code} — {naira(p.amount, { whole: true })}
                    </option>
                  ))}
                </SelectField>
                <Field label="Phone number" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} hint="For the provider's receipt." />
              </>
            )}

            {error && <Alert tone="bad">{error}</Alert>}
            <Button type="submit" block size="lg" disabled={!provider}>
              {plan ? `Pay ${naira(price, { whole: true })}` : "Continue"}
            </Button>
          </form>
        )}
      </Card>

      <PinSheet
        open={reference !== null}
        onClose={() => setReference(null)}
        summary={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-soft">Package</dt>
            <dd className="text-right font-semibold">{plan?.display}</dd>
            <dt className="text-ink-soft">Customer</dt>
            <dd className="text-right font-medium">{customer}</dd>
            <dt className="text-ink-soft">Amount</dt>
            <dd className="text-right font-semibold">{naira(price)}</dd>
          </dl>
        }
        onConfirm={async (transactionPin) => {
          const tx = await bills.buyCable({
            internalReference: reference!,
            identifier: provider,
            plan: planCode,
            iuc,
            phone: normalizeNgPhone(phone)!,
            amount: price,
            transactionPin,
          });
          setReference(null);
          setDone({ status: purchaseOutcome(tx), body: `${plan?.display} for ${customer} has been paid.` });
          void refresh();
        }}
      />
    </div>
  );
}
