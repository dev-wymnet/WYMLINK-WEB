import { AuthUser } from "@/types/auth_types";
import { ContactMethod } from "@/types/component_types/ui_types";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  countryCode: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginFormValues {
  contactMethod: ContactMethod;
  identifier: string;
  password: string;
}

export interface SignupFormValues extends LoginFormValues {
  firstName: string;
  lastName: string;
  confirmPassword: string;
  countryCode: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthActionResult>;
  signup: (payload: SignupPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  authenticatedRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}
