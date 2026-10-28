"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IcLandmark, IcRefreshCw } from "@/components/app/icons";
import { Alert, Badge, Button, Card, Field, Modal, PageHeader, SelectField, Skeleton } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { adminApi, type CollectionAccount, type CollectionRow, type OwedSummary } from "@/lib/api/admin";
import { useAdmin } from "@/features/admin/admin_context";
import { dateTime, naira } from "@/lib/format";

// Purchases are paid from WymNet's provider balance and deducted from the customer's
// Wymlink wallet, but the customer's money stays in their Moneta account. This page moves
// it to WymNet's bank: never more than the customer owes, never more than their account holds.

const STATUS: Record<CollectionRow["status"], { label: string; tone: "ok" | "bad" | "warn" | "neutral" }> = {
  success: { label: "Paid to WymNet", tone: "ok" },
  failed: { label: "Failed (nothing moved)", tone: "bad" },
  unknown: { label: "Waiting for Moneta", tone: "warn" },
  processing: { label: "Sending", tone: "neutral" },
};

export default function CollectionsPage() {
  const { can, admin } = useAdmin();
  const manage = can("ADMIN_MANAGE_PAYOUTS");
  const superAdmin = admin?.role === "super_admin";

  const [account, setAccount] = useState<CollectionAccount | null | undefined>(undefined);
  const [owed, setOwed] = useState<OwedSummary | null>(null);
  const [history, setHistory] = useState<CollectionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (withBalances = false) => {
    try {
      const [a, o, h] = await Promise.all([adminApi.collectionAccount(), adminApi.owed(withBalances), adminApi.collections()]);
      setError(null);
      setAccount(a.account);
      setOwed(o);
      setHistory(h.collections);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);
  useEffect(() => {
    let alive = true;
    Promise.all([adminApi.collectionAccount(), adminApi.owed(false), adminApi.collections()])
      .then(([a, o, h]) => {
        if (!alive) return;
        setAccount(a.account);
        setOwed(o);
        setHistory(h.collections);
      })
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, []);

  const owing = useMemo(() => owed?.customers.filter((c) => Number(c.owed) > 0) ?? [], [owed]);

  if (!can("ADMIN_VIEW_PAYOUTS")) {
    return <Alert tone="bad" title="Finance access needed">Only finance and super admins can see collections.</Alert>;
  }

  const collectOne = async (userId: string, name: string) => {
    if (!window.confirm(`Collect what ${name} owes into WymNet's bank account? It's paid from their Moneta account.`)) return;
    setBusyId(userId);
    setError(null);
    setNotice(null);
    try {
      const r = await adminApi.collect(userId);
      setNotice(r.skipped ? `${name}: ${r.reason}` : `${name}: ${naira(r.collection?.sent)} sent to WymNet (${STATUS[r.collection!.status].label}).`);
      await load(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const collectAll = async () => {
    if (!window.confirm(`Collect from every customer who owes enough (${owing.length} owing)? Each one is a separate payout from their Moneta account.`)) return;
    setBusyId("all");
    setError(null);
    setNotice(null);
    try {
      const r = await adminApi.collectAll();
      const done = r.results.filter((x) => !x.skipped).length;
      setNotice(`${done} of ${r.attempted} collected.${r.results.some((x) => x.skipped) ? " Skipped: " + r.results.filter((x) => x.skipped).map((x) => `${x.name} (${x.reason})`).join("; ") : ""}`);
      await load(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collections"
        subtitle="Money customers spent on airtime, data and bills is paid by WymNet first. Collect it from their Moneta accounts into WymNet's bank."
        action={
          <Button
            variant="secondary"
            loading={checking}
            onClick={async () => {
              setChecking(true);
              await load(true);
              setChecking(false);
            }}
          >
            <IcRefreshCw aria-hidden /> Check live balances
          </Button>
        }
      />

      {error && <Alert tone="bad">{error}</Alert>}
      {notice && (
        <Alert tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Where collections are paid */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700">
            <IcLandmark aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-soft">Collections are paid to</p>
            {account === undefined ? (
              <Skeleton className="mt-1 h-6 w-64" />
            ) : account ? (
              <p className="font-semibold text-ink">
                {account.accountName} · {account.accountNumber} · {account.bankName}
              </p>
            ) : (
              <p className="font-semibold text-bad">No bank account set yet</p>
            )}
          </div>
          {superAdmin && (
            <Button variant={account ? "secondary" : "primary"} onClick={() => setEditingAccount(true)}>
              {account ? "Change bank account" : "Set bank account"}
            </Button>
          )}
        </div>
        {!superAdmin && !account && <p className="mt-3 text-sm text-ink-soft">A super admin has to set the bank account before anything can be collected.</p>}
      </Card>

      {/* Totals */}
      {owed ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Spent on purchases" value={naira(owed.totals.spent)} />
          <Stat label="Already collected" value={naira(owed.totals.collected)} />
          <Stat label="Waiting for Moneta" value={naira(owed.totals.inFlight)} />
          <Stat label="Still to collect" value={naira(owed.totals.owed)} strong />
        </div>
      ) : (
        <Skeleton className="h-24" />
      )}

      {/* Who owes */}
      <Card flush>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-semibold text-ink">Customers who owe</h2>
            <p className="text-sm text-ink-soft">
              Moneta charges {owed ? naira(owed.fee) : "a fee"} per payout from the customer&apos;s account. WymNet absorbs it, so their account ends up matching their Wymlink balance.
            </p>
          </div>
          {manage && owing.length > 0 && (
            <Button onClick={collectAll} loading={busyId === "all"} disabled={!account || busyId !== null}>
              Collect from everyone
            </Button>
          )}
        </div>
        {!owed ? (
          <Skeleton className="m-6 h-32" />
        ) : owing.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-ink-soft">Nobody owes anything right now.</p>
        ) : (
          <ul className="divide-y divide-line">
            {owing.map((c) => (
              <li key={c.userId} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-sm text-ink-soft">
                    Account {c.accountNumber} · spent {naira(c.spent)} · collected {naira(c.collected)}
                    {c.lastCollectedAt ? ` · last ${dateTime(c.lastCollectedAt)}` : ""}
                  </p>
                  {c.vaBalance !== null && (
                    <p className="text-sm text-ink-soft">
                      In their Moneta account now: <span className="font-medium text-ink">{naira(c.vaBalance)}</span>
                      {c.collectable !== null && Number(c.collectable) > 0 ? ` · can collect ${naira(c.collectable)}` : " · not enough to collect after the fee"}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-soft">Owes</p>
                  <p className="text-lg font-semibold text-ink">{naira(c.owed)}</p>
                </div>
                {Number(c.inFlight) > 0 && <Badge tone="warn">{naira(c.inFlight)} waiting</Badge>}
                {manage && (
                  <Button size="sm" onClick={() => collectOne(c.userId, c.name)} loading={busyId === c.userId} disabled={!account || busyId !== null || Number(c.inFlight) > 0}>
                    Collect
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* History */}
      <Card flush>
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-semibold text-ink">Collection history</h2>
          <p className="text-sm text-ink-soft">Every collection is recorded, with who ran it, in the audit log.</p>
        </div>
        {!history ? (
          <Skeleton className="m-6 h-32" />
        ) : history.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-ink-soft">No collections yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {h.customer ?? "Customer"} <span className="font-normal text-ink-soft">· {h.accountNumber}</span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    {dateTime(h.createdAt)} · owed {naira(h.owedBefore)}
                    {h.vaBalanceBefore !== null ? ` · account held ${naira(h.vaBalanceBefore)}` : ""} · fee {naira(h.fee)}
                    {h.providerReference ? ` · ref ${h.providerReference}` : ""}
                  </p>
                  {h.lastError && h.status !== "success" && <p className="text-sm text-bad">{h.lastError}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-soft">Sent to WymNet</p>
                  <p className="font-semibold text-ink">{naira(h.sent)}</p>
                </div>
                <Badge tone={STATUS[h.status].tone}>{STATUS[h.status].label}</Badge>
                {manage && (h.status === "unknown" || h.status === "processing") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busyId === h.id}
                    onClick={async () => {
                      setBusyId(h.id);
                      try {
                        await adminApi.refreshCollection(h.id);
                        await load();
                      } catch (e) {
                        setError(errorMessage(e));
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    Check with Moneta
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SetAccount
        open={editingAccount}
        current={account ?? null}
        onClose={() => setEditingAccount(false)}
        onSaved={(a) => {
          setEditingAccount(false);
          setAccount(a);
          setNotice(`Collections now go to ${a.accountName} (${a.accountNumber}, ${a.bankName}).`);
        }}
      />
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Card>
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={strong ? "mt-1 text-2xl font-semibold text-brand-700" : "mt-1 text-2xl font-semibold text-ink"}>{value}</p>
    </Card>
  );
}

function SetAccount({ open, current, onClose, onSaved }: { open: boolean; current: CollectionAccount | null; onClose: () => void; onSaved: (a: CollectionAccount) => void }) {
  const [banks, setBanks] = useState<{ code: string; name: string }[] | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || banks) return;
    adminApi
      .collectionBanks()
      .then((r) => setBanks(r.banks))
      .catch((e) => setError(errorMessage(e)));
  }, [open, banks]);

  const submit = async () => {
    if (!bankCode) return setError("Choose the bank.");
    if (!/^\d{10}$/.test(accountNumber)) return setError("Account numbers are 10 digits.");
    setBusy(true);
    setError(null);
    try {
      const r = await adminApi.setCollectionAccount(bankCode, accountNumber);
      onSaved(r.account);
      setAccountNumber("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={current ? "Change the collection bank account" : "Set the collection bank account"} dismissible={!busy}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <p className="text-sm text-ink-soft">
          All collections are paid into this account. The account name is checked with the bank and shown back to you; it can&apos;t be typed in.
          {current ? ` Currently: ${current.accountName}, ${current.accountNumber} (${current.bankName}).` : ""}
        </p>
        <SelectField label="Bank" value={bankCode} onChange={(e) => setBankCode(e.target.value)} disabled={!banks}>
          <option value="">{banks ? "Choose the bank" : "Loading banks…"}</option>
          {banks?.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </SelectField>
        <Field id="collection-account" label="Account number" inputMode="numeric" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} />
        {error && <Alert tone="bad">{error}</Alert>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" block onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" block loading={busy}>
            Check and save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
