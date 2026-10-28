"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { LogoMark } from "@/components/app/brand";
import { Alert, Button, CodeInput, CopyButton, Field } from "@/components/app/ui";
import { ApiError, errorMessage } from "@/lib/api/client";
import { adminApi, type AdminLoginStep } from "@/lib/api/admin";
import { safeRedirect } from "@/lib/safe_redirect";

const safeAdminNext = (raw: string | null) => safeRedirect(raw, "/admin", "/admin");

// Groups of four, easier to type into an authenticator by hand.
const spaced = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim();

function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<AdminLoginStep | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restart = (message: string | null) => {
    setStep(null);
    setCode("");
    setPassword("");
    setError(message);
  };

  const submitPassword = async () => {
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError(null);
    try {
      const next = await adminApi.login(email.trim().toLowerCase(), password);
      // Two-step sign-in switched off on the backend: already signed in.
      if (next.step === "done") return router.replace(safeAdminNext(params.get("next")));
      setStep(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPassword("");
      setBusy(false);
    }
  };

  const submitCode = async (value = code) => {
    if (!/^\d{6}$/.test(value)) return setError("Enter the 6-digit code from your authenticator app.");
    setBusy(true);
    setError(null);
    try {
      await adminApi.verifyCode(value);
      router.replace(safeAdminNext(params.get("next")));
    } catch (err) {
      // An expired or locked sign-in starts again from the password.
      if (err instanceof ApiError && (err.status === 401 || err.status === 429)) restart(err.message);
      else {
        setError(errorMessage(err));
        setCode("");
      }
    } finally {
      setBusy(false);
    }
  };

  const enrollment = step?.step === "mfa" ? step.enrollment : null;

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center text-white">
          <LogoMark size={80} tone="light" />
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Wymlink admin</h1>
          <p className="text-sm text-white/60">Authorised staff only. Every action is logged.</p>
        </div>

        {!step ? (
          <form
            className="flex flex-col gap-4 rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-pop)]"
            onSubmit={(e) => {
              e.preventDefault();
              void submitPassword();
            }}
          >
            {reason === "idle" && <Alert tone="warn">You were signed out after 15 minutes of inactivity.</Alert>}
            {reason === "expired" && <Alert tone="warn">Your session ended. Please sign in again.</Alert>}
            <Field label="Work email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <Alert tone="bad">{error}</Alert>}
            <Button type="submit" block size="lg" loading={busy}>
              Continue
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-pop)]"
            onSubmit={(e) => {
              e.preventDefault();
              void submitCode();
            }}
          >
            {enrollment ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-ink">Set up two-step sign-in</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Scan this with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy or 1Password), then enter the 6-digit code it shows.
                  </p>
                </div>
                <div className="mx-auto rounded-2xl border border-line bg-white p-3">
                  <QRCode value={enrollment.otpauthUrl} size={184} level="M" />
                </div>
                <div className="rounded-2xl bg-canvas px-4 py-3">
                  <p className="text-xs text-ink-soft">Can&apos;t scan? Enter this key instead:</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <code className="break-words font-mono text-sm text-ink">{spaced(enrollment.secret)}</code>
                    <CopyButton value={enrollment.secret} label="Copy" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-ink">Enter your code</h2>
                <p className="mt-1 text-sm text-ink-soft">Open your authenticator app and enter the 6-digit code for Wymlink.</p>
              </div>
            )}
            <CodeInput
              label="Authenticator code"
              value={code}
              autoFocus
              onChange={(v) => {
                setCode(v);
                if (v.length === 6 && !busy) void submitCode(v);
              }}
            />
            {error && <Alert tone="bad">{error}</Alert>}
            <Button type="submit" block size="lg" loading={busy}>
              {enrollment ? "Turn on and sign in" : "Sign in"}
            </Button>
            <button type="button" onClick={() => restart(null)} className="text-sm font-medium text-ink-soft hover:text-ink">
              Use a different account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
