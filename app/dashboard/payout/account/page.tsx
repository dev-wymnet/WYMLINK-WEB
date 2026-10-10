"use client";

import { useState } from "react";
import { App_Input } from "@/components/ui_components/app_input";
import { App_Button } from "@/components/ui_components/app_button";
import { BankSelectionModal } from "@/features/payouts/components/BankSelectionModal";
import { BankSelector } from "@/features/payouts/components/BankSelector";
import { useRecipientValidation } from "@/features/payouts/hooks/useRecipientValidation";
import { useRouter } from "next/navigation";

export default function PayoutAccountPage() {
  const router = useRouter();
  const { banks, bank, accountNumber, verifying, error, accountName, canContinue, selectBank, updateAccountNumber } = useRecipientValidation();
  const [open, setOpen] = useState(false);

  const onContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    const params = new URLSearchParams({
      bankCode: bank!.code,
      bankName: bank!.name,
      accountNumber,
      accountName,
    });
    router.push(`/dashboard/payout/details?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <h1 className="mb-2 text-2xl font-bold">Send money</h1>
      <p className="mb-6 text-sm text-muted-foreground">Choose the recipient&apos;s bank and enter their 10-digit account number. We&apos;ll confirm the account name before you continue.</p>

      <form className="flex flex-col gap-4" onSubmit={onContinue}>
        <div>
          <label className="mb-2 block text-sm font-medium">Bank</label>
          <BankSelector bank={bank} onClick={() => setOpen(true)} />
        </div>

        <App_Input
          id="accountNumber"
          label="Account number"
          placeholder="10 digits"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => updateAccountNumber(e.target.value)}
          maxLength={10}
          required
        />

        {verifying ? (
          <div className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm text-gray-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Verifying account…
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        ) : accountName ? (
          <div className="flex items-center gap-3 rounded-md border bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {bank?.logo ? <img src={bank.logo as any} alt={bank.name} className="h-8 w-8 rounded-full" /> : <div className="h-8 w-8 rounded-full bg-gray-200" />}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{accountName}</div>
              <div className="truncate text-xs text-gray-500">{bank?.name} · {accountNumber}</div>
            </div>
            <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Verified</div>
          </div>
        ) : bank && accountNumber.length === 10 ? null : (
          <p className="text-sm text-gray-500">{bank ? "Enter the 10-digit account number to verify." : "Select a bank to get started."}</p>
        )}

        <div className="mt-4">
          <App_Button className="w-full" disabled={!canContinue}>Continue</App_Button>
        </div>
      </form>

      <BankSelectionModal
        visible={open}
        banks={banks}
        selected={bank}
        onClose={() => setOpen(false)}
        onSelect={(b) => { selectBank(b); setOpen(false); }}
      />
    </div>
  );
}
