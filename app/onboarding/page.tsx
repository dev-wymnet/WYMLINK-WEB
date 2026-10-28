"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IcCircleCheck, IcFingerprint, IcIdCard, IcKeyRound, IcShieldCheck } from "@/components/app/icons";
import { Brand } from "@/components/app/brand";
import { Button, Card, cx } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { AccountProvider, useAccount } from "@/features/app/account_context";
import { BvnForm, NinForm, SetPinFlow } from "@/features/app/security_flows";

type Step = "welcome" | "pin" | "kyc" | "done";

function Steps({ step }: { step: Step }) {
  const items: Array<{ id: Step; label: string }> = [
    { id: "pin", label: "PIN" },
    { id: "kyc", label: "Identity" },
    { id: "done", label: "Ready" },
  ];
  const order: Step[] = ["welcome", "pin", "kyc", "done"];
  const at = order.indexOf(step);
  return (
    <ol className="flex items-center gap-2" aria-label="Setup progress">
      {items.map((it, i) => {
        const idx = order.indexOf(it.id);
        const state = at > idx ? "done" : at === idx ? "now" : "next";
        return (
          <li key={it.id} className="flex flex-1 items-center gap-2">
            <span
              className={cx(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                state === "done" ? "bg-ok text-white" : state === "now" ? "bg-brand-600 text-white" : "bg-line text-ink-soft",
              )}
              aria-current={state === "now" ? "step" : undefined}
            >
              {state === "done" ? <IcCircleCheck /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <span className={cx("text-sm", state === "next" ? "text-ink-faint" : "font-medium text-ink")}>{it.label}</span>
            {i < items.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function Flow() {
  const router = useRouter();
  const { user } = Use_Auth_Context();
  const { loading, needsPin, pinStatus, bvnVerified, ninVerified, refreshPin, refreshKyc } = useAccount();
  const [step, setStep] = useState<Step>("welcome");
  const [idMethod, setIdMethod] = useState<"bvn" | "nin">("bvn");

  // Resume where the user left off.
  useEffect(() => {
    if (loading) return;
    if (pinStatus && !needsPin && (bvnVerified || ninVerified)) setStep("done");
    else if (pinStatus && !needsPin) setStep((s) => (s === "welcome" ? "kyc" : s));
  }, [loading, pinStatus, needsPin, bvnVerified, ninVerified]);

  return (
    <div className="flex flex-col gap-6">
      <Steps step={step} />
      <Card className="p-6 sm:p-8">
        {step === "welcome" && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome to Wymlink, {user?.firstName}!</h1>
              <p className="mt-2 text-ink-soft">Two quick steps keep your money safe and unlock your account number.</p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { icon: IcKeyRound, t: "Create a transaction PIN", b: "4 digits that approve every payment." },
                { icon: IcShieldCheck, t: "Verify your identity", b: "Your BVN or NIN, as Nigerian rules require." },
              ].map(({ icon: Icon, t, b }) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl bg-canvas p-4">
                  <span className="grid size-10 place-items-center text-2xl text-brand-600">
                    <Icon aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{t}</span>
                    <span className="block text-sm text-ink-soft">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button block size="lg" onClick={() => setStep(needsPin || !pinStatus ? "pin" : "kyc")} disabled={loading}>
              Let&apos;s go
            </Button>
          </div>
        )}

        {step === "pin" && (
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl font-semibold tracking-tight">Create your transaction PIN</h1>
            <SetPinFlow
              onDone={async () => {
                await refreshPin();
                setStep("kyc");
              }}
            />
          </div>
        )}

        {step === "kyc" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Verify your identity</h1>
              <p className="mt-1 text-ink-soft">Choose one. You can add the other later from Security &amp; KYC.</p>
            </div>
            <div role="tablist" className="grid grid-cols-2 gap-2">
              {[
                { id: "bvn" as const, label: "BVN", icon: IcFingerprint },
                { id: "nin" as const, label: "NIN", icon: IcIdCard },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={idMethod === id}
                  onClick={() => setIdMethod(id)}
                  className={cx("flex items-center justify-center gap-2 rounded-xl border-2 py-3 font-medium", idMethod === id ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line text-ink-soft")}
                >
                  <Icon /> {label}
                </button>
              ))}
            </div>
            {idMethod === "bvn" ? (
              <BvnForm
                onDone={async () => {
                  await refreshKyc();
                  setStep("done");
                }}
              />
            ) : (
              <NinForm
                onDone={async () => {
                  await refreshKyc();
                  setStep("done");
                }}
              />
            )}
            <button onClick={() => router.replace("/dashboard")} className="text-sm font-medium text-ink-soft hover:text-ink">
              I&apos;ll do this later
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="grid size-16 place-items-center text-5xl text-ok">
              <IcCircleCheck />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">You&apos;re all set</h1>
            <p className="max-w-sm text-ink-soft">Add money to your Wymlink account number and start paying bills.</p>
            <Button block size="lg" onClick={() => router.replace("/dashboard")}>
              Go to my dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = Use_Auth_Context();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/auth/login?next=/onboarding");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-xl items-center px-5">
          <Brand href="/dashboard" />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-5 py-10">
        <AccountProvider>
          <Flow />
        </AccountProvider>
      </main>
    </div>
  );
}
