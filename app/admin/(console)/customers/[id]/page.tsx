"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IcArrowLeft, IcFingerprint, IcIdCard, IcLandmark, IcMail, IcPhone, IcShieldAlert } from "@/components/app/icons";
import { Alert, Badge, Button, Card, CopyButton, Modal, Skeleton, statusTone } from "@/components/app/ui";
import { kycBadge } from "@/components/admin/customer_table";
import { cx } from "@/lib/cx";
import { errorMessage } from "@/lib/api/client";
import { adminApi, type CustomerDetail, type CustomerTx, type KycCheck } from "@/lib/api/admin";
import { describeKycReason, useAdmin } from "@/features/admin/admin_context";
import { dateTime, naira, titleCase } from "@/lib/format";

type Decision = { type: "bvn" | "nin" | "both"; decision: "approve" | "reject" };

// The customer's Moneta account number. It opens by itself once BVN and NIN are both approved;
// while it is opening the page checks again every few seconds.
function AccountCard({ customer }: { customer: CustomerDetail }) {
  const va = customer.virtualAccount;
  const setup = customer.accountSetup;
  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center text-3xl text-brand-600">
          <IcLandmark />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Account number</h2>
          {va ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-2xl font-semibold tracking-wider">{va.accountNumber}</span>
              <CopyButton value={va.accountNumber} />
              <p className="w-full text-sm text-ink-soft">
                {va.bankName} · {va.accountName} · opened {dateTime(va.openedAt)}
              </p>
            </div>
          ) : setup === "opening" ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
              <span className="size-4 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" aria-hidden />
              Opening with Providus Bank. This page updates by itself, usually within a minute.
            </p>
          ) : setup === "needs_details" ? (
            <p className="mt-1 text-sm text-ink-soft">Verified before Wymlink kept the BVN for this. The customer gets their number by entering BVN and NIN once in the app (Add money).</p>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">Opens automatically as soon as both BVN and NIN are approved.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function CheckCard({ type, check, canReview, onDecide }: { type: "bvn" | "nin"; check: KycCheck; canReview: boolean; onDecide: (d: Decision) => void }) {
  const status = String(check.status ?? "PENDING").toUpperCase();
  const submitted = Boolean(check.last4);
  const reason = describeKycReason(check.failureReason);
  const Icon = type === "bvn" ? IcFingerprint : IcIdCard;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center text-2xl text-ink-soft">
            <Icon />
          </span>
          <div>
            <p className="font-semibold text-ink">{type === "bvn" ? "Bank Verification Number" : "National Identification Number"}</p>
            <p className="text-sm text-ink-soft">{submitted ? `Ending in ${check.last4}` : "Nothing submitted yet"}</p>
          </div>
        </div>
        {kycBadge(check.status)}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-soft">Verified at</dt>
          <dd className="font-medium">{check.verifiedAt ? dateTime(check.verifiedAt) : "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Provider reference</dt>
          <dd className="truncate font-mono text-xs">{check.providerReference ?? "—"}</dd>
        </div>
      </dl>
      {reason && <Alert tone={status === "VERIFIED" ? "info" : "bad"}>{reason}</Alert>}
      {canReview && (
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Button size="sm" disabled={!submitted || status === "VERIFIED"} onClick={() => onDecide({ type, decision: "approve" })}>
            Approve {type.toUpperCase()}
          </Button>
          <Button size="sm" variant="secondary" disabled={status === "FAILED"} onClick={() => onDecide({ type, decision: "reject" })}>
            {status === "VERIFIED" ? "Revoke" : "Reject"} {type.toUpperCase()}
          </Button>
          {!submitted && <p className="w-full text-xs text-ink-soft">Approval needs the customer to submit their {type.toUpperCase()} first.</p>}
        </div>
      )}
    </div>
  );
}

export default function CustomerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { can, admin } = useAdmin();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [txs, setTxs] = useState<CustomerTx[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [statusChange, setStatusChange] = useState<"active" | "disabled" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canViewTx = can("ADMIN_VIEW_TRANSACTIONS");

  useEffect(() => {
    let alive = true;
    adminApi
      .customer(id)
      .then((r) => alive && setCustomer(r.customer))
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!canViewTx) return;
    let alive = true;
    adminApi
      .customerTransactions(id, 10)
      .then((r) => alive && setTxs(r.data))
      .catch(() => alive && setTxs([]));
    return () => {
      alive = false;
    };
  }, [id, canViewTx]);

  // After an admin action: fetch the customer again.
  const reload = useCallback(async () => {
    const r = await adminApi.customer(id);
    setCustomer(r.customer);
  }, [id]);

  // While the account number is being opened, look again every 4 s (about 2 minutes at most).
  const opening = customer?.accountSetup === "opening";
  useEffect(() => {
    if (!opening) return;
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      if (tries > 30) return clearInterval(t);
      void reload().catch(() => undefined);
    }, 4000);
    return () => clearInterval(t);
  }, [opening, reload]);

  const closeModal = () => {
    if (busy) return;
    setDecision(null);
    setStatusChange(null);
    setReason("");
    setActionError(null);
  };

  const submit = async () => {
    if (reason.trim().length < 5) return setActionError("Write a short reason (at least 5 characters). It's stored in the audit log.");
    setBusy(true);
    setActionError(null);
    try {
      if (decision?.type === "both") {
        // Approve whichever of BVN and NIN is still waiting, then the account opens by itself.
        const todo = (["bvn", "nin"] as const).filter((k) => String(customer?.kyc[k].status).toUpperCase() !== "VERIFIED");
        for (const type of todo) setCustomer((await adminApi.reviewKyc(id, { type, decision: "approve", reason: reason.trim() })).customer);
        await reload();
        setNotice("BVN and NIN approved. The account number is opening now and appears below. Both decisions are recorded under your name.");
      } else if (decision) {
        const r = await adminApi.reviewKyc(id, { type: decision.type, decision: decision.decision, reason: reason.trim() });
        setCustomer(r.customer);
        await reload();
        setNotice(`${decision.type.toUpperCase()} ${decision.decision === "approve" ? "approved" : "rejected"}. The decision is recorded under your name.`);
      } else if (statusChange) {
        await adminApi.setStatus(id, statusChange, reason.trim());
        await reload();
        setNotice(statusChange === "disabled" ? "Account disabled. The customer has been signed out everywhere." : "Account reactivated.");
      }
      setBusy(false);
      closeModal();
    } catch (e) {
      setActionError(errorMessage(e));
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/kyc" className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
          <IcArrowLeft /> Back
        </Link>
        <Alert tone="bad" title="Couldn't load this customer">
          {error}
        </Alert>
      </div>
    );
  }

  if (!customer) return <Skeleton className="h-96 w-full" />;

  const canReview = can("ADMIN_VERIFY_ACCOUNTS");
  const canManage = can("ADMIN_MANAGE_USERS");
  const active = customer.status === "active";
  const wallet = customer.wallets?.[0];
  const bvnS = String(customer.kyc.bvn.status).toUpperCase();
  const ninS = String(customer.kyc.nin.status).toUpperCase();
  const canApproveBoth = canReview && Boolean(customer.kyc.bvn.last4 && customer.kyc.nin.last4) && (bvnS !== "VERIFIED" || ninS !== "VERIFIED") && bvnS !== "FAILED" && ninS !== "FAILED";
  const modalTitle = decision?.type === "both"
    ? `Approve BVN and NIN for ${customer.name}`
    : decision
    ? `${decision.decision === "approve" ? "Approve" : "Reject"} ${decision.type.toUpperCase()} for ${customer.name}`
    : statusChange === "disabled"
      ? `Disable ${customer.name}'s account`
      : `Reactivate ${customer.name}'s account`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/kyc" className="inline-flex items-center gap-1 self-start text-sm font-medium text-ink-soft hover:text-ink">
        <IcArrowLeft /> Back to reviews
      </Link>

      {notice && (
        <Alert tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-lg font-semibold text-white">
              {`${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase()}
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                {customer.email && (
                  <span className="inline-flex items-center gap-1">
                    <IcMail aria-hidden /> {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="inline-flex items-center gap-1">
                    <IcPhone aria-hidden /> {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Badge tone={active ? "ok" : "bad"}>{active ? "Active" : "Disabled"}</Badge>
              <Badge tone={customer.kyc.status === "verified" ? "ok" : customer.kyc.status === "failed" ? "bad" : "neutral"}>KYC: {titleCase(customer.kyc.status)}</Badge>
            </div>
            {canManage && (
              <Button size="sm" variant={active ? "danger" : "secondary"} onClick={() => setStatusChange(active ? "disabled" : "active")}>
                {active ? "Disable account" : "Reactivate account"}
              </Button>
            )}
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-soft">Joined</dt>
            <dd className="font-medium">{dateTime(customer.joinedAt)}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Wallet balance</dt>
            <dd className="font-medium">{wallet ? naira(wallet.availableBalance) : "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Customer ID</dt>
            <dd className="truncate font-mono text-xs">{customer.id}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Identity checks</h2>
          {!canReview && <p className="text-sm text-ink-soft">Your role ({admin?.role}) can view checks but not decide them.</p>}
          {canApproveBoth && (
            <Button size="sm" onClick={() => setDecision({ type: "both", decision: "approve" })}>
              Approve BVN & NIN
            </Button>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CheckCard type="bvn" check={customer.kyc.bvn} canReview={canReview} onDecide={setDecision} />
          <CheckCard type="nin" check={customer.kyc.nin} canReview={canReview} onDecide={setDecision} />
        </div>
        <p className="mt-4 text-xs text-ink-soft">Compare the last digits with the customer&apos;s documents and check the name matches their profile before approving.</p>
      </Card>

      <AccountCard customer={customer} />

      {txs !== null && (
        <Card flush>
          <h2 className="px-6 pt-5 text-lg font-semibold">Recent transactions</h2>
          {txs.length === 0 ? (
            <p className="px-6 pb-6 pt-2 text-sm text-ink-soft">No transactions yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {txs.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-6 py-3 text-sm">
                  <span className="flex-1">
                    <span className="block font-medium">{t.description || titleCase(t.type ?? t.transactionType ?? "transaction")}</span>
                    <span className="block text-xs text-ink-soft">{dateTime(t.createdAt)}</span>
                  </span>
                  <span className={cx("font-semibold tabular-nums", t.direction === "credit" ? "text-ok" : "text-ink")}>
                    {t.direction === "credit" ? "+" : "−"}
                    {naira(t.amount)}
                  </span>
                  <Badge tone={statusTone(t.status)}>{titleCase(t.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Modal open={Boolean(decision || statusChange)} onClose={closeModal} title={modalTitle} dismissible={!busy}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="flex gap-3 rounded-2xl bg-warn-soft p-4 text-sm">
            <IcShieldAlert className="mt-0.5 shrink-0 text-warn" />
            <p className="text-ink">
              {decision?.decision === "approve"
                ? "Only approve after checking the customer's documents. Approval unlocks higher limits, and once BVN and NIN are both approved their account number opens automatically."
                : decision
                  ? "The customer will need to verify again before their limits increase."
                  : statusChange === "disabled"
                    ? "The customer will be signed out and can't log in or make payments until reactivated."
                    : "The customer will be able to sign in and make payments again."}{" "}
              This decision is saved in the audit log with your name.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason
            </label>
            <textarea
              id="reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={decision?.decision === "approve" ? "e.g. NIN slip and selfie match the profile name" : "e.g. Name on BVN doesn't match ID provided"}
              className="rounded-xl border border-line p-3 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              autoFocus
            />
          </div>
          {actionError && <Alert tone="bad">{actionError}</Alert>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" block onClick={closeModal} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" block loading={busy} variant={decision?.decision === "approve" || statusChange === "active" ? "primary" : "danger"}>
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
