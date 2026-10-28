"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { adminApi, type Admin } from "@/lib/api/admin";

// Signed-in admin, their permissions, and an idle sign-out.

const IDLE_LIMIT_MS = 15 * 60 * 1000;

type AdminState = {
  admin: Admin | null;
  permissions: string[];
  // Staff given a temporary password must replace it before anything else.
  mustChangePassword: boolean;
  mfaEnrolled: boolean;
  can: (permission: string) => boolean;
  signOut: (reason?: "idle" | "manual" | "expired") => Promise<void>;
  reload: () => Promise<void>;
};

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const lastActive = useRef(0); // set when the idle timer starts

  const signOut = useCallback(
    async (reason: "idle" | "manual" | "expired" = "manual") => {
      await adminApi.logout().catch(() => undefined);
      router.replace(reason === "manual" ? "/admin/login" : `/admin/login?reason=${reason}`);
    },
    [router],
  );

  const apply = useCallback((r: Awaited<ReturnType<typeof adminApi.me>>) => {
    setAdmin(r.admin);
    setPermissions(r.permissions ?? []);
    setMustChangePassword(Boolean(r.mustChangePassword));
    setMfaEnrolled(Boolean(r.mfaEnrolled));
  }, []);
  const reload = useCallback(() => adminApi.me().then(apply), [apply]);

  useEffect(() => {
    adminApi
      .me()
      .then(apply)
      .catch(() => void signOut("expired"));
  }, [apply, signOut]);

  // Any 401 from the admin API means the session is gone.
  useEffect(() => {
    const onUnauth = () => void signOut("expired");
    window.addEventListener("wl:admin-unauthorized", onUnauth);
    return () => window.removeEventListener("wl:admin-unauthorized", onUnauth);
  }, [signOut]);

  // Idle timeout: shared screens and unattended laptops are the classic leak.
  useEffect(() => {
    const touch = () => (lastActive.current = Date.now());
    touch();
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const t = setInterval(() => {
      if (Date.now() - lastActive.current > IDLE_LIMIT_MS) void signOut("idle");
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(t);
    };
  }, [signOut]);

  const value = useMemo<AdminState>(
    () => ({
      admin,
      permissions,
      mustChangePassword,
      mfaEnrolled,
      // super_admin passes every check on the backend too.
      can: (p) => admin?.role === "super_admin" || permissions.includes(p),
      signOut,
      reload,
    }),
    [admin, permissions, mustChangePassword, mfaEnrolled, signOut, reload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdmin = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used inside AdminProvider");
  return c;
};

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  business_admin: "Business admin",
  finance_admin: "Finance admin",
};

// Plain-language versions of stored KYC failure codes.
export const describeKycReason = (reason: string | null | undefined) => {
  if (!reason) return null;
  if (reason.startsWith("manual_review:")) return `Manual decision: ${reason.slice("manual_review:".length).trim()}`;
  if (reason === "name_mismatch") return "The name on the BVN didn't match the bank account name.";
  if (reason === "provider_error") return "The verification service failed. The customer can retry, or review manually.";
  const code = reason.match(/^code_(.+)$/)?.[1];
  if (code) return `The provider rejected the check (code ${code}).`;
  return reason;
};
