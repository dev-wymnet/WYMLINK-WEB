"use client";

import { useCallback, useEffect, useState } from "react";
import { IcUserPlus } from "@/components/app/icons";
import { Alert, Badge, Button, Card, CopyButton, Field, Modal, PageHeader, SelectField, Skeleton } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { adminApi, type StaffMember, type StaffRole } from "@/lib/api/admin";
import { ROLE_LABEL, useAdmin } from "@/features/admin/admin_context";
import { dateTime } from "@/lib/format";

const ROLES: { id: StaffRole; label: string; what: string }[] = [
  { id: "business_admin", label: "Business admin", what: "Reviews KYC (approves BVN and NIN), manages customers and support." },
  { id: "finance_admin", label: "Finance admin", what: "Payments, payouts and transfers." },
  { id: "super_admin", label: "Super admin", what: "Everything, including adding and removing staff." },
];

// 16 characters from an alphabet without look-alikes (no 0/O, 1/l/I).
function temporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export default function StaffPage() {
  const { can, admin } = useAdmin();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(() => {
    adminApi
      .staff()
      .then((r) => setStaff(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  if (!can("ADMIN_MANAGE_ADMINS")) {
    return <Alert tone="bad" title="Super admins only">Only a super admin can add or remove staff.</Alert>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        subtitle="Everyone who can sign in to this console. Every action they take is logged under their name."
        action={
          <Button onClick={() => setAdding(true)}>
            <IcUserPlus aria-hidden /> Add staff
          </Button>
        }
      />

      {created && (
        <Alert tone="ok" title="Staff member added" onClose={() => setCreated(null)}>
          <p>
            Send these to {created.email} privately. They sign in at /admin/login, set up an authenticator app, and choose their own password. This password is shown only once.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm">{created.password}</code>
            <CopyButton value={created.password} label="Copy password" />
          </div>
        </Alert>
      )}
      {error && <Alert tone="bad">{error}</Alert>}

      {!staff ? (
        <Skeleton className="h-64" />
      ) : (
        <Card flush>
          <ul className="divide-y divide-line">
            {staff.map((s) => (
              <StaffRow key={s.id} member={s} self={s.id === admin?.id} onChanged={load} />
            ))}
          </ul>
        </Card>
      )}

      <AddStaff
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(email, password) => {
          setAdding(false);
          setCreated({ email, password });
          load();
        }}
      />
    </div>
  );
}

function StaffRow({ member: s, self, onChanged }: { member: StaffMember; self: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = s.status === "active";
  return (
    <li className="flex flex-wrap items-center gap-4 px-6 py-4">
      <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
        {`${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">
          {s.firstName} {s.lastName} {self && <span className="text-sm font-normal text-ink-soft">(you)</span>}
        </p>
        <p className="truncate text-sm text-ink-soft">
          {s.email} · {s.lastLoginAt ? `last signed in ${dateTime(s.lastLoginAt)}` : "hasn't signed in yet"}
        </p>
        {error && <p className="text-sm text-bad">{error}</p>}
      </div>
      <Badge tone="neutral">{ROLE_LABEL[s.role] ?? s.role}</Badge>
      <Badge tone={s.mfaEnrolled ? "ok" : "warn"}>{s.mfaEnrolled ? "Two-step on" : "Two-step not set up"}</Badge>
      <Badge tone={active ? "ok" : "bad"}>{active ? "Active" : "Disabled"}</Badge>
      {!self && s.mfaEnrolled && (
        <Button
          size="sm"
          variant="secondary"
          loading={busy}
          onClick={async () => {
            if (!window.confirm(`Reset two-step sign-in for ${s.firstName}? They're signed out and set up their authenticator again at their next sign-in. Only do this once you've confirmed it's really them asking.`)) return;
            setBusy(true);
            setError(null);
            try {
              await adminApi.resetStaffMfa(s.id);
              onChanged();
            } catch (e) {
              setError(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          Reset two-step
        </Button>
      )}
      {!self && (
        <Button
          size="sm"
          variant={active ? "secondary" : "primary"}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await adminApi.setStaffStatus(s.id, active ? "disabled" : "active");
              onChanged();
            } catch (e) {
              setError(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {active ? "Disable" : "Enable"}
        </Button>
      )}
    </li>
  );
}

function AddStaff({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (email: string, password: string) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("business_admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim()) return setError("Enter their first and last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    setError(null);
    const password = temporaryPassword();
    try {
      await adminApi.addStaff({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), role, temporaryPassword: password });
      onAdded(email.trim().toLowerCase(), password);
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("business_admin");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title="Add staff" dismissible={!busy}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="staff-first" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
          <Field id="staff-last" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Field id="staff-email" label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </SelectField>
        <p className="-mt-2 text-sm text-ink-soft">{ROLES.find((r) => r.id === role)?.what}</p>
        <p className="text-sm text-ink-soft">We create a strong temporary password and show it to you once, to send to them privately.</p>
        {error && <Alert tone="bad">{error}</Alert>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" block onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" block loading={busy}>
            Add staff
          </Button>
        </div>
      </form>
    </Modal>
  );
}
