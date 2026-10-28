"use client";

import { useEffect, useState } from "react";
import { IcBadgeCheck } from "@/components/app/icons";
import { Alert, Button, Card, CopyButton, Field, PageHeader, SelectField, Skeleton, cx } from "@/components/app/ui";
import { FAILED_BODY, Outcome, PENDING_BODY } from "@/components/app/outcome";
import { PinSheet } from "@/components/app/pin_sheet";
import { useAccount } from "@/features/app/account_context";
import { errorMessage, newReference } from "@/lib/api/client";
import { bills, findToken, purchaseOutcome, type ElectricityPlan, type PurchaseOutcome } from "@/lib/api/wymlink";

type Done = { status: PurchaseOutcome; body: string; token: string | null; prepaid: boolean };
import { naira, normalizeNgPhone, toNumber } from "@/lib/format";

export default function ElectricityPage() {
  const { home, refresh } = useAccount();
  const [discos, setDiscos] = useState<ElectricityPlan[] | null>(null);
  const [disco, setDisco] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [meter, setMeter] = useState("");
  const [customer, setCustomer] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const balance = home?.wallet.balance ?? 0;
  const chosen = discos?.find((d) => d.plan_code === disco);
  const min = chosen?.min_amount ?? 1000;
  const max = chosen?.max_amount ?? 500000;

  useEffect(() => {
    bills
      .electricityPlans()
      .then((r) => setDiscos(r.plans ?? []))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const verify = async () => {
    if (!disco) return setError("Choose your electricity company first.");
    if (meter.length < 6) return setError("Enter a valid meter number.");
    setVerifying(true);
    setError(null);
    setCustomer(null);
    try {
      const r = await bills.verifyMeter(meter, disco, type);
      if (!r.customer_name) throw new Error(r.message ?? "We couldn't find that meter.");
      setCustomer(r.customer_name);
    } catch (e) {
      setError(errorMessage(e));
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
            title={done.status === "success" ? "Payment successful" : done.status === "pending" ? "Payment processing" : "Payment failed"}
            body={done.status === "success" ? done.body : done.status === "pending" ? PENDING_BODY : FAILED_BODY}
            againLabel="Pay another"
            onAgain={() => setDone(null)}
          >
            {done.status === "success" && done.prepaid && (
              <div className="mt-2 w-full max-w-sm rounded-2xl border border-line bg-canvas p-4">
                <p className="text-xs text-ink-soft">Your token</p>
                {done.token ? (
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <p className="font-mono text-xl font-semibold tracking-wider text-ink tabular-nums">{done.token}</p>
                    <CopyButton value={done.token.replace(/\s/g, "")} label="" />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-ink-soft">Your token will arrive by SMS on the phone number you entered.</p>
                )}
              </div>
            )}
          </Outcome>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Electricity" subtitle="Buy prepaid tokens or pay postpaid bills." />
      <Card>
        {!discos ? (
          <Skeleton className="h-56" />
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              const amt = toNumber(amount);
              if (!customer) return setError("Verify the meter number first.");
              if (amt < min || amt > max) return setError(`Enter an amount between ${naira(min, { whole: true })} and ${naira(max, { whole: true })}.`);
              if (amt > balance) return setError(`Not enough balance (${naira(balance)}). Add money first.`);
              if (!normalizeNgPhone(phone)) return setError("Enter a valid phone number for the token SMS.");
              setError(null);
              setReference(newReference("elc"));
            }}
          >
            <SelectField
              label="Electricity company"
              value={disco}
              onChange={(e) => {
                setDisco(e.target.value);
                setCustomer(null);
              }}
            >
              <option value="">Choose your DisCo</option>
              {discos.map((d) => (
                <option key={d.plan_code} value={d.plan_code}>
                  {d.plan_name}
                </option>
              ))}
            </SelectField>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Meter type</p>
              <div className="grid grid-cols-2 gap-2">
                {(["prepaid", "postpaid"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCustomer(null);
                    }}
                    aria-pressed={type === t}
                    className={cx("rounded-xl border-2 py-3 text-sm font-semibold capitalize transition", type === t ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line hover:border-brand-200")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Field
              label="Meter number"
              inputMode="numeric"
              value={meter}
              onChange={(e) => {
                setMeter(e.target.value.replace(/\D/g, ""));
                setCustomer(null);
              }}
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

            <Field label="Amount" inputMode="numeric" prefix="₦" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} hint={`Min ${naira(min, { whole: true })} · Balance ${naira(balance)}`} />
            <Field label="Phone number" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} hint="We'll send the token here too." />

            {error && <Alert tone="bad">{error}</Alert>}
            <Button type="submit" block size="lg">
              {toNumber(amount) ? `Pay ${naira(amount, { whole: true })}` : "Continue"}
            </Button>
          </form>
        )}
      </Card>

      <PinSheet
        open={reference !== null}
        onClose={() => setReference(null)}
        summary={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-soft">DisCo</dt>
            <dd className="text-right font-medium">{chosen?.plan_name}</dd>
            <dt className="text-ink-soft">Meter</dt>
            <dd className="text-right font-medium">
              {meter} · {customer}
            </dd>
            <dt className="text-ink-soft">Amount</dt>
            <dd className="text-right font-semibold">{naira(amount)}</dd>
          </dl>
        }
        onConfirm={async (transactionPin) => {
          const tx = await bills.buyElectricity({
            internalReference: reference!,
            meter,
            plan: disco,
            amount: toNumber(amount),
            type,
            phone: normalizeNgPhone(phone)!,
            providerName: chosen?.plan_name,
            transactionPin,
          });
          setReference(null);
          setDone({
            status: purchaseOutcome(tx),
            body: `${naira(amount)} of electricity for ${customer} has been paid.`,
            token: findToken(tx.providerResponse),
            prepaid: type === "prepaid",
          });
          setAmount("");
          void refresh();
        }}
      />
    </div>
  );
}
