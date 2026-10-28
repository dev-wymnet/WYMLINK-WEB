import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  clearSession,
  isSameOrigin,
  upstreamHeaders,
  readTokens,
  refreshSession,
  saveSession,
} from "@/lib/server/session";

// Backend-for-frontend: /api/bff/<backend path> → <API_BASE_URL>/<backend path>.
// Adds the access token from the httpOnly cookie, refreshes it once on a 401,
// and never forwards admin or webhook routes from the browser.

const BLOCKED_PREFIXES = ["admin", "webhooks", "system", "auth/login", "auth/signup", "auth/refresh", "auth/logout"];
const MAX_BODY_BYTES = 64 * 1024;

const errorJson = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status });

async function handle(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.map(encodeURIComponent).join("/");
  if (path.some((p) => p === "" || p === "." || p.includes("..") || p.includes("/") || p.includes("\\")) || BLOCKED_PREFIXES.some((b) => joined === b || joined.startsWith(`${b}/`))) {
    return errorJson(404, "NOT_FOUND", "Not found");
  }

  const method = request.method.toUpperCase();
  const mutating = method !== "GET" && method !== "HEAD";
  if (mutating && !isSameOrigin(request)) return errorJson(403, "FORBIDDEN", "Request blocked");

  let body: string | undefined;
  if (mutating) {
    body = await request.text();
    if (body.length > MAX_BODY_BYTES) return errorJson(413, "PAYLOAD_TOO_LARGE", "Request too large");
  }

  const search = new URL(request.url).search;
  const target = `${backendBaseUrl()}/${joined}${search}`;

  const send = (accessToken: string | null) =>
    fetch(target, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...upstreamHeaders(request),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(90_000),
    });

  const tokens = await readTokens();
  const refreshToken = tokens.refreshToken;
  let accessToken = tokens.accessToken;
  if (!accessToken && refreshToken) {
    const fresh = await refreshSession(refreshToken, upstreamHeaders(request));
    if (fresh) {
      await saveSession(fresh);
      accessToken = fresh.accessToken;
    }
  }

  let res: Response;
  try {
    res = await send(accessToken);
    if (res.status === 401 && refreshToken) {
      const fresh = await refreshSession(refreshToken, upstreamHeaders(request));
      if (fresh) {
        await saveSession(fresh);
        res = await send(fresh.accessToken);
      } else {
        await clearSession();
      }
    }
  } catch {
    return errorJson(503, "UPSTREAM_UNAVAILABLE", "We couldn't reach Wymlink. Please try again.");
  }

  const text = await res.text();
  return new NextResponse(res.status === 204 ? null : text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
