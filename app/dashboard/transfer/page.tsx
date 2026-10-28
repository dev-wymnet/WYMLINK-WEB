"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IcBadgeCheck, IcCircleCheck, IcClock, IcSearch } from "@/components/app/icons";
import { Alert, Button, Card, Field, PageHeader, Skeleton, cx } from "@/components/app/ui";
import { PinSheet } from "@/components/app/pin_sheet";
import { useAccount } from "@/features/app/account_context";
import { errorMessage } from "@/lib/api/client";
import { payouts, type Bank } from "@/lib/api/wymlink";
import { naira, toNumber } from "@/lib/format";

function BankPicker({ banks, value, onChange }: { banks: Bank[]; value: Bank | null; onChange: (b: Bank) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? banks.filter((b) => b.name.toLowerCase().includes(s)) : banks).slice(0, 60);
  }, [banks, q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={box} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink" htmlFor="bank-search">
        Bank
      </label>
      <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <IcSearch className="text-ink-faint" aria-hidden />
        <input
          id="bank-search"
          role="combobox"
          aria-expanded={open}
          aria-controls="bank-list"
          autoComplete="off"
          placeholder="Search for a bank"
          value={open ? q : value?.name ?? ""}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          onChange={(e) => setQ(e.target.value)}
          className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
        />
      </div>
      {open && (
        <ul id="bank-list" role="listbox" className="absolute top-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-[var(--shadow-pop)]">
          {list.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-soft">No bank matches “{q}”.</li>
          ) : (
            list.map((b) => (
              <li key={b.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value?.code === b.code}
                  onClick={() => {
                    onChange(b);
                    setOpen(false);
                  }}
                  className={cx("w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-canvas", value?.code === b.code && "bg-brand-50 font-medium text-brand-700")}
                >
                  {b.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function TransferPage() {
  const { home, refresh } = useAccount();
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [account, setAccount] = useState("");
  // Name lookup result, keyed by the bank + account it was for, so stale answers are ignored.
  const [lookup, setLookup] = useState<{ key: string; name?: string; error?: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ reference: string; status: string } | null>(null);
  const balance = home?.wallet.balance ?? 0;
  const lookupKey = bank && account.length === 10 ? `${bank.code}:${account}` : null;
  const current = lookupKey && lookup?.key === lookupKey ? lookup : null;
  const name = current?.name ?? null;
  const resolving = Boolean(lookupKey && !current);

  useEffect(() => {
    payouts
      .banks()
      .then((r) => setBanks([...r.banks].sort((a, b) => a.name.localeCompare(b.name))))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  // Look up the account name as soon as we have a bank and 10 digits.
  useEffect(() => {
    if (!lookupKey) return;
    const [bankCode, accountNumber] = lookupKey.split(":");
    let alive = true;
    payouts
      .resolve(bankCode, accountNumber)
      .then((r) => alive && setLookup({ key: lookupKey, name: r.accountName }))
      .catch((e) => alive && setLookup({ key: lookupKey, error: errorMessage(e) }));
    return () => {
      alive = false;
    };
  }, [lookupKey]);

  // Follow the transfer until the bank confirms it.
  useEffect(() => {
    if (!result || !["PENDING", "PROCESSING"].includes(result.status.toUpperCase())) return;
    let tries = 0;
    const t = setInterval(async () => {
      tries += 1;
      try {
        const s = await payouts.status(result.reference);
        if (s.status !== result.status) setResult({ reference: s.reference, status: s.status });
      } catch {
        /* keep polling */
      }
      if (tries >= 20) clearInterval(t);
    }, 4000);
    return () => clearInterval(t);
  }, [result]);

  if (result) {
    const st = result.status.toUpperCase();
    const ok = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(st);
    const failed = ["FAILED", "REVERSED", "CANCELLED"].includes(st);
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className={cx("grid size-16 place-items-center rounded-full text-3xl", ok ? "bg-ok-soft text-ok" : failed ? "bg-bad-soft text-bad" : "bg-warn-soft text-warn")}>
              {ok ? <IcCircleCheck /> : <IcClock />}
            </span>
            <h2 className="text-xl font-semibold">{ok ? "Transfer successful" : failed ? "Transfer failed" : "Transfer on its way"}</h2>
            <p className="max-w-sm text-ink-soft">
              {ok
                ? `${naira(amount)} has been sent to ${name}.`
                : failed
                  ? "The bank declined this transfer. Any money taken has been returned to your balance."
                  : `We're sending ${naira(amount)} to ${name}. This usually takes under a minute.`}
            </p>
            <p className="text-xs text-ink-faint">Reference: {result.reference}</p>
            <div className="mt-3 flex gap-3">
              <Button variant="secondary" href="/dashboard/transactions">
                View receipt
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setAmount("");
                  setNote("");
                }}
              >
                New transfer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Transfer" subtitle="Send money to any Nigerian bank account." />
      <Card>
        {!banks ? (
          <Skeleton className="h-64" />
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              const amt = toNumber(amount);
              if (!name) return setError("Enter a valid account so we can confirm the name.");
              if (amt < 100) return setError("The minimum transfer is ₦100.");
              if (amt > balance) return setError(`Not enough balance (${naira(balance)}).`);
              setError(null);
              setConfirming(true);
            }}
          >
            <BankPicker banks={banks} value={bank} onChange={setBank} />
            <Field label="Account number" inputMode="numeric" maxLength={10} value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} />
            {resolving && <Skeleton className="h-11" />}
            {name && (
              <div className="flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm">
                <IcBadgeCheck className="text-ok" /> <span className="font-medium text-ink">{name}</span>
              </div>
            )}
            <Field label="Amount" inputMode="numeric" prefix="₦" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} hint={`Balance: ${naira(balance)}`} />
            <Field label="Note (optional)" maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's it for?" />
            {(error ?? current?.error) && <Alert tone="bad">{error ?? current?.error}</Alert>}
            <Button type="submit" block size="lg" disabled={!name}>
              {toNumber(amount) ? `Send ${naira(amount, { whole: true })}` : "Continue"}
            </Button>
          </form>
        )}
      </Card>

      <PinSheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm transfer"
        summary={
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-soft">To</dt>
            <dd className="text-right font-semibold">{name}</dd>
            <dt className="text-ink-soft">Account</dt>
            <dd className="text-right font-medium">
              {account} · {bank?.name}
            </dd>
            <dt className="text-ink-soft">Amount</dt>
            <dd className="text-right font-semibold">{naira(amount)}</dd>
          </dl>
        }
        onConfirm={async (transactionPin) => {
          const r = await payouts.create({
            amount: String(toNumber(amount)),
            bankCode: bank!.code,
            accountNumber: account,
            narration: note.trim() || `Transfer to ${name}`,
            transactionPin,
          });
          setConfirming(false);
          setResult(r);
          void refresh();
        }}
      />
    </div>
  );
}
