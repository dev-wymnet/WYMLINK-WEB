import { NextResponse } from "next/server";
import { backendBaseUrl, isSameOrigin, upstreamHeaders } from "@/lib/server/session";
import { clearAdminSession, readAdminTokens, refreshAdminSession, saveAdminSession } from "@/lib/server/admin_session";

// /api/admin/bff/<path> → <API>/admin/<path>, with the admin session cookie.
// Only the admin API is reachable through here.

const errorJson = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message } }, { status });

async function handle(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  // Each segment must be a plain name: no traversal, no smuggled separators.
  if (!path.length || path.some((p) => p === "" || p === "." || p.includes("..") || p.includes("/") || p.includes("\\"))) return errorJson(404, "NOT_FOUND", "Not found");
  const joined = path.map(encodeURIComponent).join("/");
  // Sign-in, refresh and sign-out go through /api/admin/session; only "who am I" and the
  // signed-in admin's password change are allowed here.
  if (joined.startsWith("auth/") && joined !== "auth/me" && joined !== "auth/password") return errorJson(404, "NOT_FOUND", "Not found");

  const method = request.method.toUpperCase();
  if (method !== "GET" && !isSameOrigin(request)) return errorJson(403, "FORBIDDEN", "Request blocked");
  const body = method === "GET" ? undefined : await request.text();
  if (body && body.length > 32 * 1024) return errorJson(413, "PAYLOAD_TOO_LARGE", "Request too large");

  const target = `${backendBaseUrl()}/admin/${joined}${new URL(request.url).search}`;
  const send = (token: string | null) =>
    fetch(target, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...upstreamHeaders(request),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

  const tokens = await readAdminTokens();
  let accessToken = tokens.accessToken;
  if (!accessToken && tokens.refreshToken) {
    const fresh = await refreshAdminSession(tokens.refreshToken, upstreamHeaders(request));
    if (fresh) {
      await saveAdminSession(fresh);
      accessToken = fresh.accessToken;
    }
  }
  if (!accessToken) return errorJson(401, "UNAUTHORIZED", "Please sign in again.");

  let res: Response;
  try {
    res = await send(accessToken);
    if (res.status === 401 && tokens.refreshToken) {
      const fresh = await refreshAdminSession(tokens.refreshToken, upstreamHeaders(request));
      if (fresh) {
        await saveAdminSession(fresh);
        res = await send(fresh.accessToken);
      } else {
        await clearAdminSession();
      }
    }
  } catch {
    return errorJson(503, "UPSTREAM_UNAVAILABLE", "We couldn't reach Wymlink. Please try again.");
  }

  return new NextResponse(res.status === 204 ? null : await res.text(), {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
