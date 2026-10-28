"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IcSmartphone, IcWifi } from "@/components/app/icons";
import { Alert, Button, Card, Field, PageHeader, Skeleton, cx } from "@/components/app/ui";
import { FAILED_BODY, Outcome, PENDING_BODY } from "@/components/app/outcome";
import { PinSheet } from "@/components/app/pin_sheet";
import { useAccount } from "@/features/app/account_context";
import { errorMessage, newReference } from "@/lib/api/client";
import { purchaseOutcome, telecom, type AirtimeNetwork, type DataNetwork, type DataPlan, type PurchaseOutcome } from "@/lib/api/wymlink";
import { guessNetwork, naira, normalizeNgPhone, toNumber } from "@/lib/format";

const NETWORK_STYLE: Record<string, string> = {
  mtn: "bg-[#ffcc00] text-black",
  airtel: "bg-[#e40000] text-white",
  glo: "bg-[#50b651] text-white",
  "9mobile": "bg-[#006b3f] text-white",
};
const baseNetwork = (id: string) => (id.startsWith("mtn") ? "mtn" : id.startsWith("glo") ? "glo" : id.startsWith("airtel") ? "airtel" : id.startsWith("9mobile") ? "9mobile" : id);
// "GLO DATA (CG)" -> "GLO (CG)", "AIRTEL (GIFTING)" -> "Airtel (Gifting)", "9MOBILE" -> "9mobile"
const prettyNetwork = (name: string) =>
  name
    .split(" ")
    .filter((w) => w && w !== "DATA")
    .map((w) => {
      if (w === "9MOBILE") return "9mobile";
      const m = w.match(/^([(]?)([A-Z]{4,})([)]?)$/);
      return m ? m[1] + m[2][0] + m[2].slice(1).toLowerCase() + m[3] : w;
    })
    .join(" ");
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

// "1GB = N796 (7Days)" -> { size: "1GB", validity: "7 Days" }
const parsePlan = (p: DataPlan) => {
  const label = String(p.label ?? p.display ?? p.name ?? p.plan_code);
  const size = label.split("=")[0]?.trim() || label;
  const validity = label.match(/\(([^)]+)\)/)?.[1]?.replace(/(\d)([A-Za-z])/, "$1 $2") ?? "";
  return { size, validity, amount: toNumber(p.amount) };
};

function NetworkPicker({ items, value, onChange }: { items: Array<{ id: string; name: string }>; value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Network</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onChange(n.id)}
            aria-pressed={value === n.id}
            className={cx(
              "flex items-center gap-2 rounded-xl border-2 p-2.5 text-left text-sm font-medium transition",
              value === n.id ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200",
            )}
          >
            <span className={cx("grid size-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold uppercase", NETWORK_STYLE[baseNetwork(n.id)] ?? "bg-canvas text-ink")}>
              {baseNetwork(n.id).slice(0, 3)}
            </span>
            <span className="leading-tight">{prettyNetwork(n.name)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type Done = { status: PurchaseOutcome; body: string };

const resultScreen = (kind: "Airtime" | "Data", done: Done, onAgain: () => void) => (
  <Outcome
    status={done.status}
    title={done.status === "success" ? `${kind} sent` : done.status === "pending" ? `${kind} is processing` : `${kind} purchase failed`}
    body={done.status === "success" ? done.body : done.status === "pending" ? PENDING_BODY : FAILED_BODY}
    onAgain={onAgain}
  />
);

function AirtimeForm({ networks }: { networks: AirtimeNetwork[] }) {
  const { home, refresh } = useAccount();
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const balance = home?.wallet.balance ?? 0;

  const onPhone = (v: string) => {
    setPhone(v);
    const g = guessNetwork(v);
    if (g && networks.some((n) => n.id === g)) setNetwork(g);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const amt = toNumber(amount);
    if (!normalizeNgPhone(phone)) e.phone = "Enter a valid Nigerian phone number.";
    if (!network) e.network = "Choose a network.";
    if (!amt || amt < 50) e.amount = "The minimum is ₦50.";
    else if (amt > 50000) e.amount = "The maximum per purchase is ₦50,000.";
    else if (amt > balance) e.amount = `Not enough balance (${naira(balance)}). Add money first.`;
    setErrors(e);
    return !Object.keys(e).length;
  };

  if (done) return resultScreen("Airtime", done, () => setDone(null));

  const netName = networks.find((n) => n.id === network)?.name ?? network.toUpperCase();
  return (
    <>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) setReference(newReference("air"));
        }}
      >
        <Field label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 000 0000" value={phone} onChange={(e) => onPhone(e.target.value)} error={errors.phone} />
        <NetworkPicker items={networks} value={network} onChange={setNetwork} />
        {errors.network && <p className="-mt-3 text-sm text-bad">{errors.network}</p>}
        <div className="flex flex-col gap-2">
          <Field label="Amount" inputMode="numeric" prefix="₦" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} error={errors.amount} hint={`Balance: ${naira(balance)}`} />
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={cx("rounded-full border px-3 py-1.5 text-sm font-medium", toNumber(amount) === a ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line text-ink-soft hover:border-brand-200")}
              >
                {naira(a, { whole: true })}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" block size="lg">
          Continue
        </Button>
      </form>
      <PinSheet
        open={reference !== null}
        onClose={() => setReference(null)}
        summary={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-soft">Airtime</dt>
            <dd className="text-right font-semibold">{naira(amount)}</dd>
            <dt className="text-ink-soft">To</dt>
            <dd className="text-right font-medium">
              {normalizeNgPhone(phone)} · {netName}
            </dd>
          </dl>
        }
        onConfirm={async (transactionPin) => {
          const tx = await telecom.buyAirtime({
            internalReference: reference!,
            network,
            amount: toNumber(amount),
            mobileNumber: normalizeNgPhone(phone)!,
            transactionPin,
          });
          setReference(null);
          setDone({ status: purchaseOutcome(tx), body: `${naira(amount)} ${netName} airtime is on its way to ${normalizeNgPhone(phone)}.` });
          setAmount("");
          void refresh();
        }}
      />
    </>
  );
}

function DataForm({ networks }: { networks: DataNetwork[] }) {
  const { home, refresh } = useAccount();
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [plans, setPlans] = useState<DataPlan[] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DataPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const balance = home?.wallet.balance ?? 0;
  const items = useMemo(() => networks.map((n) => ({ id: n.identifier, name: n.name })), [networks]);

  const chooseNetwork = (id: string) => {
    if (id === network) return;
    setNetwork(id);
    setPlans(null);
    setPlan(null);
    setPlansError(null);
  };

  const onPhone = (v: string) => {
    setPhone(v);
    const g = guessNetwork(v);
    if (!g || network.startsWith(g)) return;
    const match = items.find((n) => baseNetwork(n.id) === g);
    if (match) chooseNetwork(match.id);
  };

  useEffect(() => {
    if (!network) return;
    let alive = true;
    telecom
      .dataPlans(network)
      .then((r) => alive && setPlans([...(r.plans ?? [])].sort((a, b) => toNumber(a.amount) - toNumber(b.amount))))
      .catch((e) => alive && setPlansError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [network]);

  if (done) return resultScreen("Data", done, () => setDone(null));

  const chosen = plan ? parsePlan(plan) : null;
  return (
    <>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const errs: Record<string, string> = {};
          if (!normalizeNgPhone(phone)) errs.phone = "Enter a valid Nigerian phone number.";
          if (!plan) errs.plan = "Choose a data plan.";
          else if (parsePlan(plan).amount > balance) errs.plan = `Not enough balance (${naira(balance)}). Add money first.`;
          setErrors(errs);
          if (!Object.keys(errs).length) setReference(newReference("dat"));
        }}
      >
        <Field label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 000 0000" value={phone} onChange={(e) => onPhone(e.target.value)} error={errors.phone} />
        <NetworkPicker items={items} value={network} onChange={chooseNetwork} />
        {network && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Plan</p>
            {plansError ? (
              <Alert tone="bad">{plansError}</Alert>
            ) : !plans ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-ink-soft">No plans available for this network right now.</p>
            ) : (
              <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {plans.map((p) => {
                  const { size, validity, amount } = parsePlan(p);
                  const active = plan?.plan_code === p.plan_code;
                  return (
                    <button
                      key={p.plan_code}
                      type="button"
                      onClick={() => setPlan(p)}
                      aria-pressed={active}
                      className={cx("rounded-xl border-2 p-3 text-left transition", active ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200")}
                    >
                      <span className="block text-base font-semibold text-ink">{size}</span>
                      <span className="block text-xs text-ink-soft">{validity}</span>
                      <span className="mt-1 block text-sm font-medium text-brand-700">{naira(amount, { whole: true })}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.plan && <p className="mt-2 text-sm text-bad">{errors.plan}</p>}
          </div>
        )}
        <Button type="submit" block size="lg" disabled={!plan}>
          {chosen ? `Buy ${chosen.size} for ${naira(chosen.amount, { whole: true })}` : "Continue"}
        </Button>
      </form>
      <PinSheet
        open={reference !== null}
        onClose={() => setReference(null)}
        summary={
          chosen && (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-ink-soft">Plan</dt>
              <dd className="text-right font-semibold">
                {chosen.size} · {chosen.validity}
              </dd>
              <dt className="text-ink-soft">To</dt>
              <dd className="text-right font-medium">{normalizeNgPhone(phone)}</dd>
              <dt className="text-ink-soft">Amount</dt>
              <dd className="text-right font-semibold">{naira(chosen.amount)}</dd>
            </dl>
          )
        }
        onConfirm={async (transactionPin) => {
          const tx = await telecom.buyData({
            internalReference: reference!,
            network,
            planCode: plan!.plan_code,
            mobileNumber: normalizeNgPhone(phone)!,
            transactionPin,
          });
          setReference(null);
          setDone({ status: purchaseOutcome(tx), body: `${chosen?.size} data is on its way to ${normalizeNgPhone(phone)}.` });
          setPlan(null);
          void refresh();
        }}
      />
    </>
  );
}

function AirtimePage() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "data" ? "data" : "airtime";
  const [nets, setNets] = useState<{ airtimeNetworks: AirtimeNetwork[]; dataNetworks: DataNetwork[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    telecom
      .networks()
      .then(setNets)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Airtime & data" subtitle="Top up any Nigerian line instantly." />
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-[var(--shadow-card)]">
        {[
          { id: "airtime", label: "Airtime", icon: IcSmartphone },
          { id: "data", label: "Data", icon: IcWifi },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => router.replace(id === "data" ? "/dashboard/airtime?tab=data" : "/dashboard/airtime")}
            className={cx("flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition", tab === id ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink")}
          >
            <Icon aria-hidden /> {label}
          </button>
        ))}
      </div>
      <Card>
        {error ? (
          <Alert tone="bad" title="Couldn't load networks">
            {error}
          </Alert>
        ) : !nets ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-20" />
            <Skeleton className="h-12" />
          </div>
        ) : tab === "airtime" ? (
          <AirtimeForm networks={nets.airtimeNetworks} />
        ) : (
          <DataForm networks={nets.dataNetworks} />
        )}
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AirtimePage />
    </Suspense>
  );
}
