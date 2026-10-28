"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IcMail, IcPhone } from "@/components/app/icons";
import { Alert, Button, Field, cx } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { normalizeNgPhone } from "@/lib/format";
import { safeRedirect } from "@/lib/safe_redirect";

// Only same-site paths are allowed as a post-login destination (no open redirect).
export const safeNext = (raw: string | null) => safeRedirect(raw, "/dashboard");

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, isLoading } = Use_Auth_Context();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const phone = method === "phone" ? normalizeNgPhone(id) : null;
        if (method === "email" && !/^\S+@\S+\.\S+$/.test(id.trim())) return setError("Enter a valid email address.");
        if (method === "phone" && !phone) return setError("Enter a valid Nigerian phone number.");
        if (!password) return setError("Enter your password.");
        const res = await login(method === "email" ? { email: id.trim().toLowerCase(), password } : { phone: phone!, password });
        if (!res.success) return setError(res.error === "Invalid credentials" ? "That email/phone and password don't match." : (res.error ?? "Couldn't sign in."));
        router.replace(safeNext(params.get("next")));
      }}
    >
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={method === m}
            onClick={() => {
              setMethod(m);
              setId("");
            }}
            className={cx("flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors", method === m ? "bg-white text-ink shadow-[var(--shadow-card)]" : "text-ink-soft hover:text-ink")}
          >
            {m === "email" ? <IcMail /> : <IcPhone />} {m === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>
      {method === "email" ? (
        <Field label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={id} onChange={(e) => setId(e.target.value)} autoFocus />
      ) : (
        <Field label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" value={id} onChange={(e) => setId(e.target.value)} autoFocus />
      )}
      <div className="flex flex-col gap-2">
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Link href="/auth/forgot" className="self-end text-sm font-medium text-brand-600 hover:underline">
          Forgot password?
        </Link>
      </div>
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block size="lg" loading={isLoading}>
        Sign in
      </Button>
    </form>
  );
}
