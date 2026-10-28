"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/app/auth_layout";
import { Alert, Button, CodeInput, Field } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { auth } from "@/lib/api/wymlink";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    setError(null);
    try {
      await auth.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      photo={{ src: "/assets/people/young-man.webp", alt: "A young man looking at his phone" }}
      title={done ? "Password updated" : sent ? "Check your email" : "Reset your password"}
      subtitle={
        done
          ? "You can now sign in with your new password. Other devices have been signed out."
          : sent
            ? `If ${email} has a Wymlink account, we've sent it a 6-digit code.`
            : "Enter the email on your account and we'll send you a code."
      }
      footer={
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <Button block size="lg" onClick={() => router.replace("/auth/login")}>
          Sign in
        </Button>
      ) : !sent ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Field label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          {error && <Alert tone="bad">{error}</Alert>}
          <Button type="submit" block size="lg" loading={busy}>
            Send code
          </Button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 8 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) return setError("Use at least 8 characters with letters and numbers.");
            setBusy(true);
            setError(null);
            try {
              await auth.resetPassword({ email: email.trim().toLowerCase(), code, newPassword: password });
              setDone(true);
            } catch (err) {
              setError(errorMessage(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <CodeInput value={code} onChange={setCode} autoFocus />
          <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert tone="bad">{error}</Alert>}
          <Button type="submit" block size="lg" loading={busy} disabled={code.length < 6}>
            Update password
          </Button>
          <button type="button" onClick={() => void send()} className="text-sm font-medium text-brand-600 hover:underline">
            Didn&apos;t get it? Resend code
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
