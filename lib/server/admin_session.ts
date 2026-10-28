import "server-only";
import { cookies } from "next/headers";
import { backendBaseUrl } from "@/lib/server/session";

// Admin console session: separate cookies from customer sessions, SameSite=strict,
// and capped lifetimes. Tokens never reach browser JavaScript.

export const ADMIN_ACCESS_COOKIE = "wl_adm_at";
export const ADMIN_REFRESH_COOKIE = "wl_adm_rt";
const MAX_ADMIN_SESSION_SECONDS = 8 * 60 * 60; // re-login at least every 8 hours
const isProd = process.env.NODE_ENV === "production";

type Tokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresInSeconds?: number;
  refreshTokenExpiresInSeconds?: number;
};

export async function saveAdminSession(t: Tokens) {
  const jar = await cookies();
  const base = { httpOnly: true, secure: isProd, sameSite: "strict" as const, path: "/" };
  jar.set(ADMIN_ACCESS_COOKIE, t.accessToken, { ...base, maxAge: Math.min(t.accessTokenExpiresInSeconds ?? 900, 3600) });
  if (t.refreshToken) {
    jar.set(ADMIN_REFRESH_COOKIE, t.refreshToken, {
      ...base,
      maxAge: Math.min(t.refreshTokenExpiresInSeconds ?? MAX_ADMIN_SESSION_SECONDS, MAX_ADMIN_SESSION_SECONDS),
    });
  }
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_ACCESS_COOKIE);
  jar.delete(ADMIN_REFRESH_COOKIE);
}

export async function readAdminTokens() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ADMIN_ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(ADMIN_REFRESH_COOKIE)?.value ?? null,
  };
}

export async function refreshAdminSession(refreshToken: string, extraHeaders: Record<string, string> = {}): Promise<Tokens | null> {
  try {
    const res = await fetch(`${backendBaseUrl()}/admin/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Tokens;
    return json?.accessToken ? { ...json, refreshToken: json.refreshToken ?? refreshToken } : null;
  } catch {
    return null;
  }
}
