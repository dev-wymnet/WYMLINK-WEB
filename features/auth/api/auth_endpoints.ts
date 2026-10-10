import { ApiErrorResponse, RequestJsonOptions } from "@/types/api_types";
import {
  AuthResponse,
  AuthSessionController,
  AuthUser,
  RefreshResponse,
} from "@/types/auth_types";
import { LoginPayload, SignupPayload } from "@/features/auth/api/auth_model";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const defaultHeaders = { "Content-Type": "application/json" };

export const AUTH_STORAGE_KEYS = {
  accessToken: "wymlink.accessToken",
  refreshToken: "wymlink.refreshToken",
} as const;

let sessionController: AuthSessionController | null = null;
let refreshRequest: Promise<string | null> | null = null;

class ApiClientError extends Error {
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

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const parseErrorResponse = async (response: Response) => {
  let payload: ApiErrorResponse | null = null;
  try {
    payload = (await response.json()) as ApiErrorResponse;
  } catch {
    payload = null;
  }
  throw new ApiClientError(
    response.status,
    payload?.error.code ?? "REQUEST_FAILED",
    payload?.error.message ?? "Something went wrong.",
    payload?.error.details,
  );
};

const executeRefresh = async () => {
  if (!sessionController) return null;
  const refreshToken = sessionController.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const result = await refreshAccessTokenRequest({ refreshToken });
    sessionController.onAccessTokenRefresh(result.accessToken);
    return result.accessToken;
  } catch {
    sessionController.onSessionInvalid();
    return null;
  }
};

const ensureAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = executeRefresh().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

export const configureAuthSession = (controller: AuthSessionController | null) => {
  sessionController = controller;
};

export const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
  options: RequestJsonOptions = {},
): Promise<T> => {
  const headers = new Headers(init.headers ?? defaultHeaders);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.requiresAuth) {
    const token = sessionController?.getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  let response = await fetch(buildUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (response.status === 401 && options.requiresAuth && options.retryOnUnauthorized !== false) {
    const freshToken = await ensureAccessToken();
    if (freshToken) {
      headers.set("Authorization", `Bearer ${freshToken}`);
      response = await fetch(buildUrl(path), {
        ...init,
        headers,
        cache: "no-store",
      });
    }
  }
  if (!response.ok) await parseErrorResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

export const loginUser = (payload: LoginPayload) =>
  requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const signupUser = (payload: SignupPayload) =>
  requestJson<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const refreshAccessTokenRequest = (payload: { refreshToken: string }) =>
  requestJson<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const logoutUser = (payload: { refreshToken: string }) =>
  requestJson<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCurrentUser = async () => {
  const response = await requestJson<{ user: AuthUser }>("/user/me", {}, { requiresAuth: true });
  return response.user;
};

export const authenticatedRequest = <T>(path: string, init?: RequestInit) =>
  requestJson<T>(path, init, { requiresAuth: true });

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};
