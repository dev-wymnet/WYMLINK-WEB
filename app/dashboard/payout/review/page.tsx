"use client";

import { App_Button } from "@/components/ui_components/app_button";
import { TransactionPinModal } from "@/features/payouts/components/TransactionPinModal";
import { usePayout } from "@/features/payouts/state/usePayout";
import { appName } from "@/data/constants/app_name";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function PayoutReviewPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-2xl p-4" />}>
      <PayoutReviewInner />
    </Suspense>
  );
}

function PayoutReviewInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const bankName = sp.get("bankName") || "";
  const bankCode = sp.get("bankCode") || "";
  const accountNumber = sp.get("accountNumber") || "";
  const accountName = sp.get("accountName") || "";
  const amount = sp.get("amount") || "";
  const description = sp.get("description") || "";

  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);

  const { state, submit } = usePayout();

  const onAuthorize = async () => {
    const res = await submit({
      amount,
      bankCode,
      accountNumber,
      narration: description || "Wallet payout",
      transactionPin: String(pin).slice(0, 4),
    });
    if ((res as any).ok) {
      setPinVisible(false);
      const p = new URLSearchParams({
        amount,
        bankName,
        accountNumber,
        accountName,
        reference: (res as any).reference ?? "",
      });
      router.replace(`/dashboard/payout/success?${p.toString()}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <h1 className="mb-2 text-2xl font-bold">Review transfer</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Please confirm the details below before authorizing this transfer.
      </p>

      <div className="mb-4 rounded-lg border bg-white p-4">
        <div className="text-xs text-gray-500">You&apos;re sending</div>
        <div className="text-3xl font-bold">
          ₦
          {Number(amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {appName}{" "}
          Wallet
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 text-xs text-gray-500">RECIPIENT</div>
        <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
            {(accountName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {accountName || "Recipient"}
            </span>
            <span className="truncate text-xs text-gray-500">{bankName}</span>
            <span className="truncate text-xs text-gray-500">
              {accountNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1 text-xs text-gray-500">TRANSFER DETAILS</div>
        <div className="rounded-lg border bg-white p-3">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-500">From</span>
            <span>{appName} Wallet</span>
          </div>
          <div className="h-px w-full bg-gray-100" />
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-500">Amount</span>
            <span>
              ₦
              {Number(amount).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {description ? (
            <>
              <div className="h-px w-full bg-gray-100" />
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-500">Description</span>
                <span className="max-w-[55%] truncate text-right">
                  {description}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {state.error ? (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      ) : null}

      <App_Button className="w-full" onClick={() => setPinVisible(true)}>
        Confirm transfer
      </App_Button>
      <p className="mt-2 text-center text-xs text-gray-500">
        By authorizing, you confirm that the recipient and transfer amount are
        correct.
      </p>

      <TransactionPinModal
        open={pinVisible}
        onClose={() => setPinVisible(false)}
        onConfirm={onAuthorize}
        pin={pin}
        setPin={setPin}
        loading={state.isBusy}
        error={state.error}
        title="Authorize transfer"
        description="Enter your transaction PIN to authorize this transfer."
        confirmText="Authorize"
      />
    </div>
  );
}
