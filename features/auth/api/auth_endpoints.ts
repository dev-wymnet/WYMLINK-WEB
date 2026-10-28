// Compatibility layer for older feature modules. New code should import from
// "@/lib/api/wymlink" and "@/lib/api/client" directly.
import { api, ApiError, errorMessage } from "@/lib/api/client";
import { auth, profile } from "@/lib/api/wymlink";
import type { LoginPayload, SignupPayload } from "@/features/auth/api/auth_model";

type LegacyInit = Omit<RequestInit, "body"> & { body?: BodyInit | null };

const toOptions = (init: LegacyInit = {}) => {
  const method = (init.method ?? "GET").toUpperCase() as "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : undefined;
  return { method, body };
};

const splitQuery = (path: string) => {
  const [p, qs] = path.split("?");
  return { path: p, query: qs ? Object.fromEntries(new URLSearchParams(qs)) : undefined };
};

export const authenticatedRequest = <T,>(path: string, init?: LegacyInit) => {
  const { path: p, query } = splitQuery(path);
  return api<T>(p, { ...toOptions(init), query });
};

export const requestJson = <T,>(path: string, init?: LegacyInit) => authenticatedRequest<T>(path, init);

export const loginUser = (payload: LoginPayload) => auth.login(payload);
export const signupUser = (payload: SignupPayload) => auth.signup(payload);
export const logoutUser = () => auth.logout();
export const getCurrentUser = () => profile.me();

export const getApiErrorMessage = (error: unknown) => errorMessage(error);
export { ApiError };
