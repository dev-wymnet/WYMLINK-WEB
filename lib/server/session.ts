import "server-only";
import { cookies } from "next/headers";

// Tokens never reach browser JavaScript: they live in httpOnly cookies set here,
// and every API call goes through /api/bff, which attaches them server-side.

export const ACCESS_COOKIE = "wl_at";
export const REFRESH_COOKIE = "wl_rt";
// Readable by proxy.ts (and harmless to expose): only says a session may exist.
export const SESSION_HINT_COOKIE = "wl_s";

const isProd = process.env.NODE_ENV === "production";

export const backendBaseUrl = () => {
  const url = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error("API_BASE_URL is not configured");
  return url.replace(/\/+$/, "");
};

export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresInSeconds?: number;
  refreshTokenExpiresInSeconds?: number;
};

export async function saveSession(tokens: TokenSet) {
  const jar = await cookies();
  const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" };
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: tokens.accessTokenExpiresInSeconds ?? 3600,
  });
  if (tokens.refreshToken) {
    const maxAge = tokens.refreshTokenExpiresInSeconds ?? 86400;
    jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge });
    // Not httpOnly on purpose: the browser reads it to know a session may exist. No secret in it.
    jar.set(SESSION_HINT_COOKIE, "1", { ...base, httpOnly: false, maxAge });
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(SESSION_HINT_COOKIE);
}

export async function readTokens() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
  };
}

// One refresh per server instance at a time for the same refresh token, so a
// burst of parallel 401s doesn't spend the refresh token several times.
const inflight = new Map<string, Promise<TokenSet | null>>();

export async function refreshSession(refreshToken: string, extraHeaders: Record<string, string> = {}): Promise<TokenSet | null> {
  const pending = inflight.get(refreshToken);
  if (pending) return pending;
  const run = (async () => {
    try {
      const res = await fetch(`${backendBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...extraHeaders },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = (await res.json()) as TokenSet;
      if (!json?.accessToken) return null;
      return { ...json, refreshToken: json.refreshToken ?? refreshToken };
    } catch {
      return null;
    }
  })();
  inflight.set(refreshToken, run);
  try {
    return await run;
  } finally {
    setTimeout(() => inflight.delete(refreshToken), 2000);
  }
}

// Headers for every call to the backend: the customer's real IP plus the shared
// secret that lets the backend trust it. Never pass the browser's own headers on.
// The IP is the LAST x-forwarded-for entry: the one our hosting edge appended (Vercel
// replaces the header with just the client). Earlier entries are whatever the browser
// sent, so taking the first would let anyone pick the IP our rate limits count against.
export function upstreamHeaders(request: Request): Record<string, string> {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "";
  const secret = process.env.BFF_SHARED_SECRET;
  return {
    "user-agent": request.headers.get("user-agent") ?? "",
    ...(forwarded && secret ? { "x-wl-client-ip": forwarded, "x-wl-bff-secret": secret } : {}),
  };
}

// Same-origin check for state-changing requests (CSRF defence alongside SameSite=Lax
// and the custom header the client always sends).
export function isSameOrigin(request: Request) {
  if (request.headers.get("x-wl-request") !== "1") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers omit Origin on GET/HEAD only
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
