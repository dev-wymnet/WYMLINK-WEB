"use client";

import { useEffect, useState } from "react";
import { IcMail } from "@/components/app/icons";
import { Alert, Badge, Button, CodeInput, Field, PinInput, SelectField, cx } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { errorMessage, fieldErrors } from "@/lib/api/client";
import { auth, kyc, pin, type Bank } from "@/lib/api/wymlink";

// PIN, KYC and password flows shared by onboarding and Security & KYC.

// Weak PINs a stranger would try first.
const WEAK = new Set(["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321", "1212", "0123", "2580", "1122", "1004", "2000"]);
const pinProblem = (p: string) => (p.length !== 4 ? "Enter 4 digits." : WEAK.has(p) ? "That PIN is too easy to guess. Choose another." : null);

// ---------------- PIN: set ----------------
export function SetPinFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = (v = first) => {
    const p = pinProblem(v);
    if (p) return setError(p);
    setError(null);
    setStep("confirm");
  };

  const save = async (v = second) => {
    if (v !== first) {
      setError("The PINs don't match. Start again.");
      setFirst("");
      setSecond("");
      setStep("enter");
      return;
    }
    setBusy(true);
    try {
      await pin.set(v);
      onDone();
    } catch (e) {
      setError(errorMessage(e));
      setSecond("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-ink-soft">{step === "enter" ? "Choose a 4-digit PIN you haven't used for your bank card." : "Enter the same PIN again to confirm."}</p>
      {step === "enter" ? (
        <PinInput key="a" value={first} onChange={setFirst} autoFocus label="New PIN" onComplete={(v) => next(v)} />
      ) : (
        <PinInput key="b" value={second} onChange={setSecond} autoFocus label="Confirm PIN" disabled={busy} onComplete={(v) => void save(v)} />
      )}
      {error && <Alert tone="bad">{error}</Alert>}
      <Button block loading={busy} onClick={() => (step === "enter" ? next() : void save())} disabled={(step === "enter" ? first : second).length !== 4}>
        {step === "enter" ? "Continue" : "Save PIN"}
      </Button>
    </div>
  );
}

// ---------------- PIN: change ----------------
export function ChangePinFlow({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (confirmValue = again) => {
    if (confirmValue !== next) {
      setError("The new PINs don't match.");
      setNext("");
      setAgain("");
      setStep(1);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await pin.change(current, next);
      onDone();
    } catch (e) {
      setError(errorMessage(e));
      setCurrent("");
      setNext("");
      setAgain("");
      setStep(0);
    } finally {
      setBusy(false);
    }
  };

  const labels = ["Enter your current PIN", "Choose a new PIN", "Confirm your new PIN"];
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-ink-soft">{labels[step]}</p>
      {step === 0 && <PinInput key="c" value={current} onChange={setCurrent} autoFocus label="Current PIN" onComplete={() => setStep(1)} />}
      {step === 1 && (
        <PinInput
          key="n"
          value={next}
          onChange={setNext}
          autoFocus
          label="New PIN"
          onComplete={(v) => {
            const p = pinProblem(v) ?? (v === current ? "Your new PIN must be different." : null);
            if (p) {
              setError(p);
              setNext("");
            } else {
              setError(null);
              setStep(2);
            }
          }}
        />
      )}
      {step === 2 && <PinInput key="a" value={again} onChange={setAgain} autoFocus disabled={busy} label="Confirm new PIN" onComplete={(v) => void save(v)} />}
      {error && <Alert tone="bad">{error}</Alert>}
      {step === 2 && (
        <Button block loading={busy} disabled={again.length !== 4} onClick={() => void save()}>
          Update PIN
        </Button>
      )}
    </div>
  );
}

// ---------------- PIN: reset by email code ----------------
export function ResetPinFlow({ onDone }: { onDone: () => void }) {
  const { user } = Use_Auth_Context();
  const email = user?.email ?? "";
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email) return <Alert tone="warn">Add an email address to your profile to reset your PIN, or contact support.</Alert>;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await pin.requestReset(email);
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const p = pinProblem(first);
    if (p) return setError(p);
    if (first !== second) return setError("The PINs don't match.");
    setBusy(true);
    setError(null);
    try {
      await pin.confirmReset(email, code, first);
      onDone();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!sent) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <p className="text-ink-soft">
          We&apos;ll email a 6-digit code to <span className="font-medium text-ink">{email}</span>.
        </p>
        {error && <Alert tone="bad">{error}</Alert>}
        <Button block loading={busy} onClick={() => void send()}>
          <IcMail /> Email me a code
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <CodeInput value={code} onChange={setCode} autoFocus label="Code from your email" />
      <div>
        <p className="mb-2 text-sm font-medium text-ink">New PIN</p>
        <PinInput value={first} onChange={setFirst} label="New PIN" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Confirm new PIN</p>
        <PinInput value={second} onChange={setSecond} label="Confirm new PIN" />
      </div>
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block loading={busy} disabled={code.length < 6 || first.length !== 4 || second.length !== 4}>
        Reset PIN
      </Button>
      <button type="button" onClick={() => void send()} className="text-sm font-medium text-brand-600 hover:underline">
        Resend code
      </button>
    </form>
  );
}

// ---------------- KYC ----------------
export function KycStatusRow({ label, status, masked, icon }: { label: string; status?: string; masked?: string | null; icon: React.ReactNode }) {
  const verified = status === "VERIFIED";
  const pending = status === "PENDING";
  return (
    <div className="flex items-center gap-3">
      <span className={cx("grid size-11 place-items-center rounded-xl text-xl", verified ? "bg-ok-soft text-ok" : "bg-canvas text-ink-soft")}>{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-ink">{label}</p>
        <p className="text-sm text-ink-soft">
          {verified ? `Verified ${masked ?? ""}` : status === "FAILED" ? "Couldn't verify — try again" : pending ? "Our team is reviewing it" : "Not verified yet"}
        </p>
      </div>
      <Badge tone={verified ? "ok" : status === "FAILED" ? "bad" : pending ? "warn" : "neutral"}>
        {verified ? "Verified" : status === "FAILED" ? "Failed" : pending ? "Under review" : "Not verified"}
      </Badge>
    </div>
  );
}

export function BvnForm({ onDone }: { onDone: () => void }) {
  const { user } = Use_Auth_Context();
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [bvn, setBvn] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  useEffect(() => {
    kyc
      .banks()
      .then((r) => setBanks([...r.banks].sort((a, b) => a.name.localeCompare(b.name))))
      .catch((e) => {
        setBanks([]);
        setError(errorMessage(e));
      });
  }, []);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!/^\d{11}$/.test(bvn)) e.bvn = "Your BVN is 11 digits.";
    if (!bankCode) e.bankCode = "Choose your bank.";
    if (!/^\d{10}$/.test(accountNumber)) e.accountNumber = "Account numbers are 10 digits.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setError(null);
    try {
      await kyc.submitBvn({ bvn, bankCode, accountNumber });
      onDone();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-sm text-ink-soft">
        We check your BVN against a bank account in your name (<span className="font-medium text-ink">{name || "your name"}</span>). We never see your bank login or move money.
      </p>
      <Field label="BVN" inputMode="numeric" autoComplete="off" maxLength={11} value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))} error={errors.bvn} hint="Dial *565*0# on your registered line to get it." />
      <SelectField label="Bank" value={bankCode} onChange={(e) => setBankCode(e.target.value)} error={errors.bankCode} disabled={!banks}>
        <option value="">{banks ? "Choose your bank" : "Loading banks…"}</option>
        {banks?.map((b) => (
          <option key={b.code} value={b.code}>
            {b.name}
          </option>
        ))}
      </SelectField>
      <Field label="Account number" inputMode="numeric" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} error={errors.accountNumber} />
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block loading={busy}>
        Verify BVN
      </Button>
    </form>
  );
}

export function NinForm({ onDone }: { onDone: () => void }) {
  const [nin, setNin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!/^\d{11}$/.test(nin)) return setError("Your NIN is 11 digits.");
    setBusy(true);
    setError(null);
    try {
      await kyc.submitNin(nin);
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-sm text-ink-soft">Your National Identification Number is on your NIN slip or ID card, or dial *346# on your registered line.</p>
      <Field label="NIN" inputMode="numeric" autoComplete="off" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))} />
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block loading={busy}>
        Verify NIN
      </Button>
    </form>
  );
}

// ---------------- Password reset ----------------
export function PasswordResetFlow({ onDone }: { onDone: () => void }) {
  const { user } = Use_Auth_Context();
  const email = user?.email ?? "";
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!email) return <Alert tone="warn">Add an email address to your profile first.</Alert>;
  return sent ? (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw.length < 8) return setError("Use at least 8 characters.");
        setBusy(true);
        setError(null);
        try {
          await auth.resetPassword({ email, code, newPassword: pw });
          onDone();
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <CodeInput value={code} onChange={setCode} autoFocus label="Code from your email" />
      <Field label="New password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} hint="At least 8 characters." />
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block loading={busy} disabled={code.length < 6}>
        Update password
      </Button>
    </form>
  ) : (
    <div className="flex flex-col gap-4 text-center">
      <p className="text-ink-soft">
        We&apos;ll email a code to <span className="font-medium text-ink">{email}</span>.
      </p>
      {error && <Alert tone="bad">{error}</Alert>}
      <Button
        block
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await auth.forgotPassword(email);
            setSent(true);
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <IcMail /> Email me a code
      </Button>
    </div>
  );
}
