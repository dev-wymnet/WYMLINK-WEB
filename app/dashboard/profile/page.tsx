"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IcChevronRight, IcLifeBuoy, IcLogOut, IcShieldCheck } from "@/components/app/icons";
import { Alert, Badge, Button, Card, Field, PageHeader } from "@/components/app/ui";
import { Use_Auth_Context } from "@/features/auth/api/auth_context";
import { useAccount } from "@/features/app/account_context";
import { errorMessage } from "@/lib/api/client";
import { profile } from "@/lib/api/wymlink";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = Use_Auth_Context();
  const { bvnVerified, ninVerified } = useAccount();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const verified = bvnVerified || ninVerified;
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "W";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Profile" />

      <Card>
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-600 text-xl font-semibold text-white">{initials}</span>
          <div className="flex-1">
            <p className="text-lg font-semibold text-ink">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-ink-soft">{user?.email ?? user?.phone}</p>
          </div>
          <Badge tone={verified ? "ok" : "warn"}>{verified ? "Verified" : "Not verified"}</Badge>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold text-ink">Personal details</h2>
        <p className="mb-5 text-sm text-ink-soft">
          {verified ? "Your name is locked to your verified identity. Contact support to change it." : "Use your name exactly as it appears on your BVN / NIN."}
        </p>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setMsg(null);
            try {
              await profile.update({ firstName: firstName.trim(), lastName: lastName.trim() });
              await refreshUser();
              setMsg({ tone: "ok", text: "Saved." });
            } catch (err) {
              setMsg({ tone: "bad", text: errorMessage(err) });
            } finally {
              setSaving(false);
            }
          }}
        >
          <Field label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={verified} autoComplete="given-name" />
          <Field label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={verified} autoComplete="family-name" />
          <Field label="Email" value={user?.email ?? ""} disabled />
          <Field label="Phone" value={user?.phone ?? ""} disabled />
          {msg && (
            <div className="sm:col-span-2">
              <Alert tone={msg.tone}>{msg.text}</Alert>
            </div>
          )}
          {!verified && (
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card flush>
        <button onClick={() => router.push("/dashboard/security")} className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-canvas">
          <IcShieldCheck className="text-xl text-brand-600" />
          <span className="flex-1">
            <span className="block font-medium text-ink">Security & KYC</span>
            <span className="block text-sm text-ink-soft">PIN, password and identity verification</span>
          </span>
          <IcChevronRight className="text-ink-faint" />
        </button>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <IcLifeBuoy className="text-xl text-brand-600" />
          <h2 className="font-semibold text-ink">Contact support</h2>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (subject.trim().length < 3 || message.trim().length < 10) return setMsg({ tone: "bad", text: "Add a subject and a short description." });
            setSending(true);
            try {
              await profile.createTicket(subject.trim(), message.trim());
              setSubject("");
              setMessage("");
              setMsg({ tone: "ok", text: "Thanks — our team will reply by email." });
            } catch (err) {
              setMsg({ tone: "bad", text: errorMessage(err) });
            } finally {
              setSending(false);
            }
          }}
        >
          <Field label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="msg" className="text-sm font-medium text-ink">
              Message
            </label>
            <textarea
              id="msg"
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl border border-line p-3.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <Button type="submit" variant="secondary" loading={sending} className="self-start">
            Send message
          </Button>
        </form>
      </Card>

      <Button
        variant="danger"
        onClick={async () => {
          await logout();
          router.replace("/auth/login");
        }}
        className="self-start"
      >
        <IcLogOut /> Sign out
      </Button>
    </div>
  );
}
