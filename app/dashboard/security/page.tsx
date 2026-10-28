"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IcBadgeCheck, IcFingerprint, IcIdCard, IcKeyRound, IcLock } from "@/components/app/icons";
import { Alert, Button, Card, Modal, PageHeader, Skeleton } from "@/components/app/ui";
import { useAccount } from "@/features/app/account_context";
import { BvnForm, ChangePinFlow, KycStatusRow, NinForm, PasswordResetFlow, ResetPinFlow, SetPinFlow } from "@/features/app/security_flows";

// ---------------- Page ----------------
type Sheet = null | "set-pin" | "change-pin" | "reset-pin" | "bvn" | "nin" | "password";
const SHEET_TITLES: Record<Exclude<Sheet, null>, string> = {
  "set-pin": "Create your transaction PIN",
  "change-pin": "Change your PIN",
  "reset-pin": "Reset your PIN",
  bvn: "Verify your BVN",
  nin: "Verify your NIN",
  password: "Change your password",
};

function SecurityPage() {
  const params = useSearchParams();
  const { pinStatus, verification, needsPin, refreshPin, refreshKyc, loading } = useAccount();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Deep links (?setup=pin, ?reset=pin) open their sheet once the account has loaded.
  const intent = loading ? null : params.get("reset") === "pin" ? "reset-pin" : params.get("setup") === "pin" && needsPin ? "set-pin" : null;
  const [handledIntent, setHandledIntent] = useState<string | null>(null);
  if (intent && intent !== handledIntent) {
    setHandledIntent(intent);
    setSheet(intent);
  }

  const done = useMemo(
    () => ({
      "set-pin": async () => {
        await refreshPin();
        setNotice("Your transaction PIN is set. You'll use it to approve payments.");
      },
      "change-pin": async () => setNotice("Your PIN has been changed."),
      "reset-pin": async () => {
        await refreshPin();
        setNotice("Your PIN has been reset.");
      },
      bvn: async () => {
        await refreshKyc();
        setNotice("Your BVN is verified.");
      },
      nin: async () => {
        await refreshKyc();
        setNotice("Your NIN is verified.");
      },
      password: async () => setNotice("Your password has been updated."),
    }),
    [refreshKyc, refreshPin],
  );

  const finish = (s: Exclude<Sheet, null>) => async () => {
    setSheet(null);
    await done[s]();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Security & KYC" subtitle="Protect your money and verify your identity." />
      {notice && (
        <Alert tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center text-3xl text-brand-600">
              <IcKeyRound />
            </span>
            <div>
              <h2 className="font-semibold text-ink">Transaction PIN</h2>
              <p className="text-sm text-ink-soft">Required for every payment and transfer.</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-11 w-full" />
          ) : pinStatus === null ? (
            <Alert tone="warn">We couldn&apos;t check your PIN right now. Refresh the page to try again.</Alert>
          ) : needsPin ? (
            <div className="flex flex-col gap-3">
              <Alert tone="warn" title="No PIN yet">
                You can&apos;t make payments until you create one.
              </Alert>
              <Button block onClick={() => setSheet("set-pin")}>
                <IcLock /> Create PIN
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-ok">
                <IcBadgeCheck /> PIN is active
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => setSheet("change-pin")}>
                  Change PIN
                </Button>
                <Button variant="ghost" onClick={() => setSheet("reset-pin")}>
                  Forgot PIN?
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center text-3xl text-brand-600">
              <IcLock />
            </span>
            <div>
              <h2 className="font-semibold text-ink">Password</h2>
              <p className="text-sm text-ink-soft">Used to sign in to Wymlink.</p>
            </div>
          </div>
          <Button variant="secondary" block onClick={() => setSheet("password")}>
            Change password
          </Button>
        </Card>
      </div>

      <Card className="scroll-mt-24">
        <div id="kyc" className="mb-5">
          <h2 className="font-semibold text-ink">Identity verification (KYC)</h2>
          <p className="text-sm text-ink-soft">Nigerian law requires us to verify who you are. Verified accounts get higher daily limits.</p>
        </div>
        {loading || !verification ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col divide-y divide-line">
            <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <KycStatusRow label="Bank Verification Number (BVN)" status={verification.bvn.status} masked={verification.bvn.masked} icon={<IcFingerprint />} />
              </div>
              {verification.bvn.status !== "VERIFIED" && (
                <Button className="sm:w-40" onClick={() => setSheet("bvn")}>
                  Verify BVN
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <KycStatusRow label="National Identification Number (NIN)" status={verification.nin.status} masked={verification.nin.masked} icon={<IcIdCard />} />
              </div>
              {verification.nin.status !== "VERIFIED" && (
                <Button variant="secondary" className="sm:w-40" onClick={() => setSheet("nin")}>
                  Verify NIN
                </Button>
              )}
            </div>
          </div>
        )}
        <dl className="mt-6 grid gap-3 rounded-2xl bg-canvas p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-soft">Without verification</dt>
            <dd className="font-medium text-ink">Up to ₦10,000 / day</dd>
          </div>
          <div>
            <dt className="text-ink-soft">BVN verified</dt>
            <dd className="font-medium text-ink">Up to ₦500,000 / day</dd>
          </div>
          <div>
            <dt className="text-ink-soft">BVN + NIN verified</dt>
            <dd className="font-medium text-ink">Higher limits</dd>
          </div>
        </dl>
      </Card>

      <Modal open={sheet !== null} onClose={() => setSheet(null)} title={sheet ? SHEET_TITLES[sheet] : ""}>
        {sheet === "set-pin" && <SetPinFlow onDone={finish("set-pin")} />}
        {sheet === "change-pin" && <ChangePinFlow onDone={finish("change-pin")} />}
        {sheet === "reset-pin" && <ResetPinFlow onDone={finish("reset-pin")} />}
        {sheet === "bvn" && <BvnForm onDone={finish("bvn")} />}
        {sheet === "nin" && <NinForm onDone={finish("nin")} />}
        {sheet === "password" && <PasswordResetFlow onDone={finish("password")} />}
      </Modal>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SecurityPage />
    </Suspense>
  );
}
