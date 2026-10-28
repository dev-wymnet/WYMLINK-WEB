import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendBaseUrl, isSameOrigin, upstreamHeaders } from "@/lib/server/session";
import { clearAdminSession, readAdminTokens, saveAdminSession } from "@/lib/server/admin_session";

// POST /api/admin/session/login | mfa | logout — admin console sign-in, in two steps:
// the password, then a code from the staff member's authenticator app. Between the two
// the backend's single-use challenge token waits in an httpOnly cookie, out of reach of
// browser JavaScript.

const MFA_COOKIE = "wl_adm_mfa";
const MFA_PATH = "/api/admin/session";
const isProd = process.env.NODE_ENV === "production";

const errorJson = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message } }, { status });

type Upstream = { error?: { code?: string; message?: string } } & Record<string, unknown>;

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "login" && action !== "mfa" && action !== "logout") return errorJson(404, "NOT_FOUND", "Not found");
  if (!isSameOrigin(request)) return errorJson(403, "FORBIDDEN", "Request blocked");

  const fwd = {
    "Content-Type": "application/json",
    ...upstreamHeaders(request),
  };
  const jar = await cookies();

  if (action === "logout") {
    const { refreshToken } = await readAdminTokens();
    if (refreshToken) {
      await fetch(`${backendBaseUrl()}/admin/auth/logout`, { method: "POST", headers: fwd, body: JSON.stringify({ refreshToken }), cache: "no-store" }).catch(() => undefined);
    }
    await clearAdminSession();
    jar.delete({ name: MFA_COOKIE, path: MFA_PATH });
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorJson(400, "VALIDATION_ERROR", "Invalid request body");
  }

  const send = async (path: string, payload: unknown) => {
    const res = await fetch(`${backendBaseUrl()}${path}`, { method: "POST", headers: fwd, body: JSON.stringify(payload), cache: "no-store" });
    return { res, json: (await res.json().catch(() => null)) as Upstream | null };
  };

  if (action === "login") {
    let r: Awaited<ReturnType<typeof send>>;
    try {
      r = await send("/admin/auth/login", { email: body.email, password: body.password });
    } catch {
      return errorJson(503, "UPSTREAM_UNAVAILABLE", "We couldn't reach Wymlink. Please try again.");
    }
    const json = r.json as ({ mfaToken?: string; mfaExpiresInSeconds?: number; enrollment?: unknown; accessToken?: string; admin?: unknown } & Upstream) | null;
    // Two-step sign-in switched off on the backend (ADMIN_MFA_REQUIRED=false): signed in already.
    if (r.res.ok && json?.accessToken) {
      await saveAdminSession(json as unknown as Parameters<typeof saveAdminSession>[0]);
      return NextResponse.json({ step: "done", admin: json.admin ?? null });
    }
    if (!r.res.ok || !json?.mfaToken) {
      // One generic message: never reveal whether the email is an admin account.
      if (r.res.status === 429) return errorJson(429, "RATE_LIMITED", json?.error?.code === "LOGIN_LOCKED" && json.error.message ? json.error.message : "Too many attempts. Wait a few minutes.");
      return errorJson(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    jar.set(MFA_COOKIE, json.mfaToken, { httpOnly: true, secure: isProd, sameSite: "strict", path: MFA_PATH, maxAge: Math.min(json.mfaExpiresInSeconds ?? 300, 300) });
    return NextResponse.json({ step: "mfa", enrollment: json.enrollment ?? null });
  }

  // action === "mfa"
  const expired = () => {
    jar.delete({ name: MFA_COOKIE, path: MFA_PATH });
    return errorJson(401, "MFA_EXPIRED", "This sign-in has expired. Enter your password again.");
  };
  const mfaToken = jar.get(MFA_COOKIE)?.value;
  if (!mfaToken) return expired();
  let r: Awaited<ReturnType<typeof send>>;
  try {
    r = await send("/admin/auth/mfa", { mfaToken, code: String(body.code ?? "").replace(/\s+/g, "") });
  } catch {
    return errorJson(503, "UPSTREAM_UNAVAILABLE", "We couldn't reach Wymlink. Please try again.");
  }
  const json = r.json as ({ accessToken?: string; admin?: unknown } & Upstream) | null;
  if (r.res.ok && json?.accessToken) {
    await saveAdminSession(json as unknown as Parameters<typeof saveAdminSession>[0]);
    jar.delete({ name: MFA_COOKIE, path: MFA_PATH });
    return NextResponse.json({ admin: json.admin ?? null });
  }
  if (r.res.status === 401) return expired();
  if (r.res.status === 429) {
    jar.delete({ name: MFA_COOKIE, path: MFA_PATH });
    return errorJson(429, "RATE_LIMITED", json?.error?.message ?? "Too many attempts. Wait a few minutes.");
  }
  return errorJson(400, "INVALID_CODE", json?.error?.message ?? "That code isn't right. Try again.");
}
