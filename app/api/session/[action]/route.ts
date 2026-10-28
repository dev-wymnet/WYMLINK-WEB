import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  clearSession,
  isSameOrigin,
  upstreamHeaders,
  readTokens,
  saveSession,
  type TokenSet,
} from "@/lib/server/session";

// POST /api/session/login | signup | logout
// Talks to the backend auth endpoints and keeps the tokens in httpOnly cookies.
// The browser only ever receives { user }.

const ALLOWED = new Set(["login", "signup", "logout"]);

const errorJson = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!ALLOWED.has(action)) return errorJson(404, "NOT_FOUND", "Not found");
  if (!isSameOrigin(request)) return errorJson(403, "FORBIDDEN", "Request blocked");

  if (action === "logout") {
    const { refreshToken } = await readTokens();
    if (refreshToken) {
      await fetch(`${backendBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      }).catch(() => undefined);
    }
    await clearSession();
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson(400, "VALIDATION_ERROR", "Invalid request body");
  }

  let res: Response;
  try {
    res = await fetch(`${backendBaseUrl()}/auth/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...upstreamHeaders(request),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return errorJson(503, "UPSTREAM_UNAVAILABLE", "We couldn't reach Wymlink. Please try again.");
  }

  const json = (await res.json().catch(() => null)) as
    | (TokenSet & { user?: unknown; error?: unknown })
    | null;
  if (!res.ok || !json?.accessToken) {
    return NextResponse.json(json ?? { error: { code: "REQUEST_FAILED", message: "Something went wrong." } }, {
      status: res.ok ? 502 : res.status,
    });
  }

  await saveSession(json);
  return NextResponse.json({ user: json.user ?? null }, { status: res.status });
}
