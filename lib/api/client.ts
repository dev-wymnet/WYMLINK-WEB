// Browser-side API client. Every call goes to our own Next.js server (/api/bff/*),
// which attaches the httpOnly session cookie. No token is ever visible here.

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Json = Record<string, unknown> | unknown[];

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: Json;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
};

// Friendlier wording for the backend's error codes.
const FRIENDLY: Record<string, string> = {
  UPSTREAM_UNAVAILABLE: "We couldn't reach Wymlink. Check your connection and try again.",
  INVALID_TRANSACTION_PIN: "That PIN is incorrect.",
  TRANSACTION_PIN_LOCKED: "Too many wrong PIN attempts. Try again later or reset your PIN.",
  TRANSACTION_PIN_NOT_SET: "Set your transaction PIN to continue.",
  BVN_VERIFICATION_REQUIRED: "Verify your BVN to continue with this amount.",
  NIN_VERIFICATION_REQUIRED: "Verify your NIN to continue with this amount.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
};

async function call<T>(base: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`, window.location.origin);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        "x-wl-request": "1",
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", FRIENDLY.UPSTREAM_UNAVAILABLE);
  }

  if (res.status === 204) return undefined as T;
  const payload = (await res.json().catch(() => null)) as
    | { error?: { code?: string; message?: string; details?: unknown } }
    | null;

  if (!res.ok) {
    const code = payload?.error?.code ?? (res.status === 401 ? "UNAUTHORIZED" : "REQUEST_FAILED");
    const message =
      FRIENDLY[code] ?? payload?.error?.message ?? (res.status === 401 ? "Please sign in again." : "Something went wrong.");
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("wl:unauthorized"));
    }
    throw new ApiError(res.status, code, message, payload?.error?.details);
  }
  return payload as T;
}

export const api = <T>(path: string, opts?: RequestOptions) => call<T>("/api/bff", path, opts);
export const sessionApi = <T>(action: "login" | "signup" | "logout", body?: Json) =>
  call<T>("/api/session", `/${action}`, { method: "POST", body: body ?? {} });

export const errorMessage = (err: unknown) => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
};

// Validation errors from the backend (zod) come back as details.fieldErrors or an issues list.
export const fieldErrors = (err: unknown): Record<string, string> => {
  if (!(err instanceof ApiError) || !err.details || typeof err.details !== "object") return {};
  const d = err.details as { fieldErrors?: Record<string, string[]>; issues?: Array<{ path?: unknown[]; message?: string }> };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(d.fieldErrors ?? {})) if (v?.[0]) out[k] = v[0];
  for (const i of d.issues ?? []) {
    const key = String(i.path?.[0] ?? "");
    if (key && i.message && !out[key]) out[key] = i.message;
  }
  return out;
};

// Unique, collision-safe reference for purchases (idempotency key on the backend).
export const newReference = (prefix: string) => {
  const rand = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}-${Date.now().toString(36)}-${rand[0].toString(36)}${rand[1].toString(36)}`;
};
