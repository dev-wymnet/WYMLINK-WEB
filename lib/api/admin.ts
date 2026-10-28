import { ApiError } from "@/lib/api/client";
import type { BodyBlock } from "@/lib/blog/portable";

// Browser client for the admin console. Calls /api/admin/bff/* (admin session
// cookie attached server-side) and /api/admin/session/*.

async function call<T>(url: string, opts: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> } = {}): Promise<T> {
  const u = new URL(url, window.location.origin);
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined && v !== "") u.searchParams.set(k, String(v));
  let res: Response;
  try {
    res = await fetch(u, {
      method: opts.method ?? "GET",
      headers: { "x-wl-request": "1", ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK", "We couldn't reach Wymlink. Check your connection.");
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string; details?: unknown } } | null;
  if (!res.ok) {
    if (res.status === 401 && !url.includes("/session/")) window.dispatchEvent(new CustomEvent("wl:admin-unauthorized"));
    const code = json?.error?.code ?? "REQUEST_FAILED";
    const message = res.status === 403 && code === "FORBIDDEN" ? "Your admin role doesn't allow this action." : (json?.error?.message ?? "Something went wrong.");
    throw new ApiError(res.status, code, message, json?.error?.details);
  }
  return json as T;
}

const bff = <T,>(path: string, opts?: Parameters<typeof call>[1]) => call<T>(`/api/admin/bff${path}`, opts);

// ---------- Blog (written to Sanity by the website's server, /api/admin/blog) ----------

export type BlogStatus = "published" | "draft" | "changed";
export type BlogRow = { id: string; title: string; slug: string | null; status: BlogStatus; publishedAt: string | null; updatedAt: string; author: string | null; category: string | null; featured: boolean };
export type BlogPost = {
  id: string;
  status: BlogStatus;
  title: string;
  slug: string;
  excerpt: string;
  mainImageRef: string | null;
  imageAlt: string;
  authorId: string | null;
  categoryId: string | null;
  featured: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  body: BodyBlock[];
  publishedAt: string | null;
};
export type BlogSave = Omit<BlogPost, "id" | "status" | "publishedAt" | "authorId" | "categoryId"> & { id?: string; authorId: string; categoryId: string; publish: boolean };

export const blogApi = {
  list: () => call<{ posts: BlogRow[]; authors: Array<{ _id: string; name: string }>; categories: Array<{ _id: string; title: string }> }>("/api/admin/blog"),
  get: (id: string) => call<{ post: BlogPost }>(`/api/admin/blog/${encodeURIComponent(id)}`),
  save: (post: BlogSave) => call<{ id: string; slug: string; status: BlogStatus }>("/api/admin/blog", { method: "POST", body: post }),
  action: (id: string, action: "unpublish" | "discard") => call<{ status: BlogStatus }>(`/api/admin/blog/${encodeURIComponent(id)}`, { method: "POST", body: { action } }),
  remove: (id: string) => call<void>(`/api/admin/blog/${encodeURIComponent(id)}`, { method: "DELETE" }),
  addMeta: (kind: "author" | "category", name: string) => call<{ id: string; name: string }>("/api/admin/blog/meta", { method: "POST", body: { kind, name } }),
  async upload(file: File): Promise<{ ref: string; url: string }> {
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/blog/image", { method: "POST", body: form, headers: { "x-wl-request": "1" }, credentials: "same-origin" }).catch(() => null);
    if (!res) throw new ApiError(0, "NETWORK", "We couldn't reach Wymlink. Check your connection.");
    const json = (await res.json().catch(() => null)) as { ref?: string; url?: string; error?: { code?: string; message?: string } } | null;
    if (!res.ok || !json?.ref) throw new ApiError(res.status, json?.error?.code ?? "REQUEST_FAILED", json?.error?.message ?? "Upload failed.");
    return { ref: json.ref, url: json.url ?? "" };
  },
};

export type KycState = "PENDING" | "VERIFIED" | "FAILED" | "REVOKED" | string;

export type Admin = { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; role: string; status: string };

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  kycStatus: "verified" | "failed" | "pending";
  bvnStatus?: KycState;
  ninStatus?: KycState;
  joinedAt: string;
};

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type KycCheck = { number?: string | null; last4?: string | null; status: KycState; verifiedAt: string | null; providerReference: string | null; failureReason: string | null };

export type CustomerDetail = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  role: string;
  kyc: { status: "verified" | "failed" | "pending"; bvn: KycCheck; nin: KycCheck };
  wallets: Array<{ id: string; currencyCode: string; availableBalance: string; status: string }>;
  // Moneta account number: opened automatically once BVN and NIN are both approved.
  virtualAccount: { accountNumber: string; accountName: string; bankName: string; openedAt: string } | null;
  accountSetup: "verify" | "opening" | "needs_details" | null;
  joinedAt: string;
};

export type StaffRole = "super_admin" | "business_admin" | "finance_admin";
export type StaffMember = { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; role: StaffRole | string; status: string; mfaEnrolled?: boolean; lastLoginAt: string | null; createdAt: string };

// Sign-in step 1 (password) answers with the authenticator step; staff without an
// authenticator yet also get the secret to add to one.
export type AdminLoginStep = { step: "mfa"; enrollment: { secret: string; otpauthUrl: string } | null };

export type CustomerTx = { id: string; type?: string; transactionType?: string; direction?: string; amount: string | number; status: string; createdAt: string; description?: string; reference?: string; referenceCode?: string };

export type TicketStatus = "open" | "awaiting_customer" | "resolved" | "closed";
export type TicketRow = {
  id: string;
  subject: string;
  status: TicketStatus;
  relatedType: string | null;
  relatedId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; email: string | null; phone: string | null };
  // The staff member handling it, if anyone has taken it.
  assignee: { id: string; name: string } | null;
};
export type TicketMessage = { id: string; body: string; fromCustomer: boolean; authorName: string | null; createdAt: string };
export type TicketDetail = TicketRow & {
  customer: TicketRow["customer"] & { id: string };
  // Other staff with this ticket open right now.
  otherViewers: Array<{ id: string; name: string }>;
  messages: TicketMessage[];
};

export const adminApi = {
  login: (email: string, password: string) => call<AdminLoginStep>("/api/admin/session/login", { method: "POST", body: { email, password } }),
  verifyCode: (code: string) => call<{ admin: Admin }>("/api/admin/session/mfa", { method: "POST", body: { code } }),
  logout: () => call<void>("/api/admin/session/logout", { method: "POST", body: {} }),
  me: () => bff<{ admin: Admin; permissions: string[]; mustChangePassword: boolean; mfaEnrolled: boolean }>("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    bff<{ success: boolean }>("/auth/password", { method: "POST", body: { currentPassword, newPassword } }),
  customers: (q: { kycStatus?: string; search?: string; status?: string; page?: number; limit?: number }) =>
    bff<{ data: CustomerRow[]; pagination: Pagination }>("/customers", { query: q }),
  customer: (id: string) => bff<{ customer: CustomerDetail }>(`/customers/${encodeURIComponent(id)}`),
  customerTransactions: (id: string, limit = 10) =>
    bff<{ data: CustomerTx[]; pagination: Pagination }>(`/customers/${encodeURIComponent(id)}/transactions`, { query: { limit } }),
  reviewKyc: (id: string, body: { type: "bvn" | "nin"; decision: "approve" | "reject"; reason: string }) =>
    bff<{ customer: CustomerDetail }>(`/customers/${encodeURIComponent(id)}/kyc/review`, { method: "POST", body }),
  setStatus: (id: string, status: "active" | "disabled", reason: string) =>
    bff<{ success: boolean }>(`/customers/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status, reason } }),

  // Support tickets
  tickets: (q: { status?: TicketStatus; assigned?: "me" | "unassigned" }) => bff<{ tickets: TicketRow[] }>("/support/tickets", { query: { ...q, limit: 100 } }),
  ticket: (id: string) => bff<{ ticket: TicketDetail }>(`/support/tickets/${encodeURIComponent(id)}`),
  // afterMessageId: the last message on screen, so a colleague's reply isn't doubled.
  replyTicket: (id: string, body: string, resolve: boolean, afterMessageId?: string) =>
    bff<{ ticket: TicketDetail }>(`/support/tickets/${encodeURIComponent(id)}/messages`, { method: "POST", body: { body, resolve, afterMessageId } }),
  setTicketStatus: (id: string, status: TicketStatus) => bff<{ ticket: TicketDetail }>(`/support/tickets/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
  assignTicket: (id: string, assignee: "me" | "none") =>
    bff<{ ticket: TicketDetail }>(`/support/tickets/${encodeURIComponent(id)}/assign`, { method: "POST", body: { assignee } }),

  // Staff (super admin only)
  staff: () => bff<{ data: StaffMember[]; pagination: Pagination }>("/admins", { query: { limit: 100 } }),
  addStaff: (body: { firstName: string; lastName: string; email: string; role: StaffRole; temporaryPassword: string }) =>
    bff<{ id: string }>("/admins", { method: "POST", body }),
  setStaffStatus: (id: string, status: "active" | "disabled") => bff<unknown>(`/admins/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } }),
  setStaffRole: (id: string, role: StaffRole) => bff<unknown>(`/admins/${encodeURIComponent(id)}/role`, { method: "PATCH", body: { role } }),
  resetStaffMfa: (id: string) => bff<unknown>(`/admins/${encodeURIComponent(id)}/mfa/reset`, { method: "POST", body: {} }),
};
