import { api, sessionApi } from "@/lib/api/client";

// Typed wrappers for every backend endpoint the web app uses.
// Paths match wymnet_be routes exactly (src/modules/*/routes).

// ---------- Types ----------
export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  currencyCode?: string;
  role: string;
  status?: string;
  createdAt?: string;
};

export type RecentTransaction = {
  id: string;
  source: "wallet" | "telecom";
  transactionType: string;
  amount: number;
  status: string;
  timestamp: string;
};

export type DashboardHome = {
  user: { id: string; fullName: string; email: string | null; phone: string | null };
  wallet: { balance: number; currency: string; accountNumber: string; bankName: string };
  analytics: { totalFunded: number; totalSpent: number; airtimePurchases: number; dataPurchases: number };
  recentTransactions: RecentTransaction[];
};

export type LedgerRow = {
  id: string;
  transactionType: string;
  direction: "credit" | "debit" | string;
  amount: string | number;
  balanceBefore?: string;
  balanceAfter?: string;
  referenceCode?: string;
  description?: string | null;
  status: string;
  createdAt: string;
};

export type Wallet = {
  balance: string | number;
  accountNumber: string | null;
  bankName: string | null;
  reservedAccount?: { accountName?: string | null } | null;
};

export type VerificationItem = { status: "NONE" | "PENDING" | "VERIFIED" | "FAILED" | string; verifiedAt: string | null; masked: string | null; reason?: string | null };
export type Verification = { bvn: VerificationItem; nin: VerificationItem };

export type PinStatus = { transactionPinSet: boolean; lockedUntil: string | null };

export type AirtimeNetwork = { id: string; name: string };
export type DataNetwork = { name: string; identifier: string };
export type DataPlan = { plan_code: string; amount: string | number; label?: string; display?: string; name?: string };
export type CablePlan = { plan_code: string; amount: string | number; display?: string; description?: string };
export type ElectricityPlan = { plan_id?: string; plan_code: string; plan_name: string; min_amount?: number; max_amount?: number };
export type Bank = { name: string; code: string };

// Purchases answer 200 even when the provider fails (the wallet is refunded), so
// the outcome is in `status`: telecom rows use success|failed|pending, bills success|failed.
export type PurchaseResult = { status?: string; lastError?: string | null; providerResponse?: unknown };
export type PurchaseOutcome = "success" | "pending" | "failed";

export const purchaseOutcome = (t: PurchaseResult | undefined): PurchaseOutcome => {
  const s = String(t?.status ?? "").toLowerCase();
  if (s === "success" || s === "successful") return "success";
  if (s === "failed") return "failed";
  return "pending";
};

// Prepaid electricity token from the provider's raw response (field name varies by DisCo).
export const findToken = (raw: unknown, depth = 0): string | null => {
  if (!raw || typeof raw !== "object" || depth > 4) return null;
  for (const [k, v] of Object.entries(raw)) {
    if (/^(token|purchased_code|meter_token|main_token|tokens?_code)$/i.test(k) && (typeof v === "string" || typeof v === "number") && String(v).trim()) {
      return String(v).replace(/^token\s*:\s*/i, "").trim();
    }
  }
  for (const v of Object.values(raw)) {
    const hit = findToken(v, depth + 1);
    if (hit) return hit;
  }
  return null;
};

// ---------- Session ----------
export const auth = {
  login: (body: { email?: string; phone?: string; password: string }) =>
    sessionApi<{ user: { id: string } | null }>("login", body),
  signup: (body: { firstName: string; lastName: string; countryCode: string; email?: string; phone?: string; password: string }) =>
    sessionApi<{ user: { id: string } | null }>("signup", body),
  logout: () => sessionApi<void>("logout"),
  forgotPassword: (email: string) => api<{ ok?: boolean }>("/auth/password/forgot", { method: "POST", body: { email } }),
  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    api<{ ok?: boolean }>("/auth/password/reset", { method: "POST", body }),
};

// ---------- Profile ----------
export const profile = {
  me: () => api<{ user: User }>("/user/me").then((r) => r.user),
  update: (body: Partial<Pick<User, "firstName" | "lastName" | "phone">>) =>
    api<{ user: User }>("/user/me", { method: "PATCH", body }).then((r) => r.user),
  supportTickets: () => api<{ tickets: Array<{ id: string; subject: string; status: string; createdAt: string }> }>("/user/support-tickets"),
  createTicket: (subject: string, message: string) =>
    api<{ ticket: unknown }>("/user/support-tickets", { method: "POST", body: { subject, message } }),
};

// ---------- Security: transaction PIN ----------
export const pin = {
  status: () => api<PinStatus>("/auth/pin/status"),
  set: (newPin: string) => api<{ ok: boolean }>("/auth/pin/transaction/set", { method: "POST", body: { pin: newPin } }),
  change: (currentPin: string, newPin: string) =>
    api<{ ok: boolean }>("/auth/pin/transaction/change", { method: "POST", body: { currentPin, newPin } }),
  requestReset: (email: string) =>
    api<{ ok: boolean }>("/auth/pin/transaction/reset/request", { method: "POST", body: { email } }),
  confirmReset: (email: string, code: string, newPin: string) =>
    api<{ ok: boolean }>("/auth/pin/transaction/reset/confirm", { method: "POST", body: { email, code, newPin } }),
};

// ---------- KYC ----------
export const kyc = {
  status: () => api<Verification>("/user/me/verification"),
  // NIBSS 6-digit bank codes for the BVN account check (not the payout bank list).
  banks: () => api<{ banks: Bank[] }>("/user/banks"),
  submitBvn: (body: { bvn: string; bankCode: string; accountNumber: string }) =>
    api<unknown>("/user/me/verification/bvn", { method: "POST", body }),
  submitNin: (nin: string) => api<unknown>("/user/me/verification/nin", { method: "POST", body: { nin } }),
};

// ---------- Wallet ----------
export const wallet = {
  home: () => api<DashboardHome>("/dashboard/home"),
  me: () => api<Wallet>("/wallets/me"),
  transactions: (limit = 50) => api<{ transactions: LedgerRow[] }>("/wallets/transactions", { query: { limit } }),
  transaction: (id: string) => api<{ transaction: LedgerRow }>(`/wallets/transactions/${encodeURIComponent(id)}`),
};

// ---------- Airtime & data ----------
// Purchases take an `internalReference` made once per checkout (see newReference),
// so retrying after a timeout can never buy twice: the backend dedupes on it.
export const telecom = {
  networks: () => api<{ airtimeNetworks: AirtimeNetwork[]; dataNetworks: DataNetwork[] }>("/telecom/networks"),
  dataPlans: (network: string) => api<{ network: string; plans: DataPlan[] }>("/telecom/data/plans", { query: { network } }),
  buyAirtime: (body: { internalReference: string; network: string; amount: number; mobileNumber: string; transactionPin: string }) =>
    api<{ transaction: PurchaseResult }>("/telecom/airtime/purchase", { method: "POST", body }).then((r) => r.transaction),
  buyData: (body: { internalReference: string; network: string; planCode: string; mobileNumber: string; transactionPin: string }) =>
    api<{ transaction: PurchaseResult }>("/telecom/data/purchase", { method: "POST", body }).then((r) => r.transaction),
};

// ---------- Bills ----------
export const bills = {
  cableProviders: () => api<{ providers: Array<{ identifier: string; name: string }> }>("/bills/cable/providers"),
  cablePlans: (identifier: string) => api<{ plans: CablePlan[] }>("/bills/cable/plans", { query: { identifier } }),
  verifyCable: (identifier: string, iuc: string) =>
    api<{ customer_name?: string; status?: string; message?: string }>("/bills/cable/verify", { method: "POST", body: { identifier, iuc } }),
  buyCable: (body: { internalReference: string; identifier: string; plan: string; iuc: string; phone: string; amount?: number; transactionPin: string }) =>
    api<{ transaction: PurchaseResult }>("/bills/cable/subscribe", { method: "POST", body }).then((r) => r.transaction),
  electricityPlans: () => api<{ plans: ElectricityPlan[] }>("/bills/electricity/plans"),
  verifyMeter: (meter: string, plan: string, type: "prepaid" | "postpaid") =>
    api<{ customer_name?: string; status?: string; message?: string }>("/bills/electricity/verify", { query: { meter, plan, type } }),
  buyElectricity: (body: {
    internalReference: string;
    meter: string;
    plan: string;
    amount: number;
    type: "prepaid" | "postpaid";
    phone: string;
    providerName?: string;
    transactionPin: string;
  }) => api<{ transaction: PurchaseResult }>("/bills/electricity/subscribe", { method: "POST", body }).then((r) => r.transaction),
};

// ---------- Bank payouts ----------
export const payouts = {
  banks: () => api<{ banks: Bank[] }>("/payouts/banks"),
  resolve: (bankCode: string, accountNumber: string) =>
    api<{ accountNumber: string; accountName: string; bankCode: string; bankName: string | null }>("/payouts/validate-account", {
      query: { bankCode, accountNumber },
    }),
  create: (body: { amount: string; bankCode: string; accountNumber: string; narration: string; transactionPin: string }) =>
    api<{ reference: string; status: string }>("/payouts", { method: "POST", body }),
  status: (reference: string) =>
    api<{ reference: string; status: string; providerReference: string | null }>("/payouts/status/by-reference", { query: { reference } }),
};
