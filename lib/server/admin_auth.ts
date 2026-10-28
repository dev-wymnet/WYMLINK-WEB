import "server-only";
import { backendBaseUrl, upstreamHeaders } from "@/lib/server/session";
import { readAdminTokens, refreshAdminSession, saveAdminSession } from "@/lib/server/admin_session";

// The signed-in staff member for a website API route, checked with the backend (session,
// role, two-step sign-in all apply there). Null when not signed in.

export type CurrentAdmin = { id: string; firstName: string; lastName: string; role: string; permissions: string[]; mustChangePassword: boolean };

async function me(token: string, request: Request) {
  const res = await fetch(`${backendBaseUrl()}/admin/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, ...upstreamHeaders(request) },
    cache: "no-store",
  });
  return res;
}

export async function currentAdmin(request: Request): Promise<CurrentAdmin | null> {
  const tokens = await readAdminTokens();
  let token = tokens.accessToken;
  let res = token ? await me(token, request) : null;
  if ((!res || res.status === 401) && tokens.refreshToken) {
    const fresh = await refreshAdminSession(tokens.refreshToken, upstreamHeaders(request));
    if (!fresh) return null;
    await saveAdminSession(fresh);
    token = fresh.accessToken;
    res = await me(token, request);
  }
  if (!res?.ok) return null;
  const j = (await res.json()) as { admin: Omit<CurrentAdmin, "permissions" | "mustChangePassword">; permissions?: string[]; mustChangePassword?: boolean };
  return { ...j.admin, permissions: j.permissions ?? [], mustChangePassword: Boolean(j.mustChangePassword) };
}

// Who may write the blog: super admins and business admins.
export const canWriteBlog = (a: CurrentAdmin) => !a.mustChangePassword && (a.role === "super_admin" || a.role === "business_admin");
