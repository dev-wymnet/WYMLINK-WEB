"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { normalizeNgPhone } from "@/lib/format";

const strength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
};
const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];
const BAR = ["bg-bad", "bg-bad", "bg-warn", "bg-brand-500", "bg-ok"];

export function SignUpForm() {
  const router = useRouter();
  const { signup, isLoading } = Use_Auth_Context();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const s = strength(f.password);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        const nameOk = (n: string) => /^[A-Za-z][A-Za-z' -]{1,49}$/.test(n.trim());
        if (!nameOk(f.firstName)) errs.firstName = "Enter your first name.";
        if (!nameOk(f.lastName)) errs.lastName = "Enter your last name.";
        if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errs.email = "Enter a valid email address.";
        if (!normalizeNgPhone(f.phone)) errs.phone = "Enter a valid Nigerian phone number.";
        if (f.password.length < 8 || !/\d/.test(f.password) || !/[A-Za-z]/.test(f.password)) errs.password = "Use at least 8 characters with letters and numbers.";
        if (!agree) errs.agree = "Please accept the terms to continue.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setError(null);
        const res = await signup({
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          email: f.email.trim().toLowerCase(),
          phone: normalizeNgPhone(f.phone)!,
          password: f.password,
          countryCode: "NG",
        });
        if (!res.success) return setError(res.error === "User already exists" ? "An account with this email or phone already exists. Sign in instead." : (res.error ?? "Couldn't create your account."));
        router.replace("/onboarding");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" autoComplete="given-name" value={f.firstName} onChange={set("firstName")} error={errors.firstName} />
        <Field label="Last name" autoComplete="family-name" value={f.lastName} onChange={set("lastName")} error={errors.lastName} />
      </div>
      <p className="-mt-2 text-xs text-ink-soft">Use your name exactly as it appears on your BVN or NIN.</p>
      <Field label="Email address" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
      <Field label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" value={f.phone} onChange={set("phone")} error={errors.phone} />
      <div className="flex flex-col gap-2">
        <Field label="Password" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} />
        {f.password && (
          <div className="flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? BAR[s] : "bg-line"}`} />
              ))}
            </div>
            <span className="text-xs text-ink-soft">{STRENGTH[s]}</span>
          </div>
        )}
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
        <span>
          I agree to Wymlink&apos;s{" "}
          <Link href="/privacy-policy" className="font-medium text-brand-600 hover:underline">
            privacy policy
          </Link>{" "}
          and terms of use.
        </span>
      </label>
      {errors.agree && <p className="-mt-3 text-sm text-bad">{errors.agree}</p>}
      {error && <Alert tone="bad">{error}</Alert>}
      <Button type="submit" block size="lg" loading={isLoading}>
        Create account
      </Button>
    </form>
  );
}
