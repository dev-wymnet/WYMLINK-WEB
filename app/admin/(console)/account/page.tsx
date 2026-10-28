"use client";

import { useState } from "react";
import { Alert, Badge, Button, Card, Field, PageHeader } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { adminApi } from "@/lib/api/admin";
import { ROLE_LABEL, useAdmin } from "@/features/admin/admin_context";

export default function AccountPage() {
  const { admin, mustChangePassword, mfaEnrolled, mfaRequired, reload } = useAdmin();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!current) return setError("Enter your current password.");
    if (next.length < 12) return setError("Use at least 12 characters for your new password.");
    if (next !== confirm) return setError("The new passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await adminApi.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageHeader title="Your account" subtitle={admin ? `${admin.email ?? ""} · ${ROLE_LABEL[admin.role] ?? admin.role}` : undefined} />

      {mustChangePassword && (
        <Alert tone="warn" title="Choose your own password">
          You signed in with a temporary password someone else set. Replace it to use the console.
        </Alert>
      )}

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Two-step sign-in</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {mfaRequired
                ? "Every sign-in needs your password and a code from your authenticator app. Lost your phone? Ask a super admin to reset it from the Staff page; you set it up again at your next sign-in."
                : "Switched off for everyone on the server (ADMIN_MFA_REQUIRED=false), so staff sign in with a password only. Switch it back on when testing is done."}
            </p>
          </div>
          <Badge tone={!mfaRequired ? "bad" : mfaEnrolled ? "ok" : "warn"}>{!mfaRequired ? "Switched off" : mfaEnrolled ? "On" : "Not set up"}</Badge>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink">Change password</h2>
        <p className="mt-1 text-sm text-ink-soft">At least 12 characters. Changing it signs you out everywhere else.</p>
        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Field label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <Alert tone="bad">{error}</Alert>}
          {done && !error && <Alert tone="ok">Password changed. Your other sessions were signed out.</Alert>}
          <Button type="submit" loading={busy}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
