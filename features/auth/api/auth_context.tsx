"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ChildrenProps } from "@/types/general_types/general_types";
import { AuthContextValue, LoginPayload, SignupPayload } from "@/features/auth/api/auth_model";
import { authenticatedRequest } from "@/features/auth/api/auth_endpoints";
import { errorMessage } from "@/lib/api/client";
import { auth, profile, type User } from "@/lib/api/wymlink";

// Session state for the browser. The session itself is a pair of httpOnly
// cookies managed by /api/session/*; here we only know who the user is.

const Auth_Context = createContext<AuthContextValue | null>(null);

const hasSessionHint = () =>
  typeof document !== "undefined" && document.cookie.split("; ").some((c) => c.startsWith("wl_s="));

export const Auth_Context_Provider = ({ children }: ChildrenProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const me = await profile.me();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        await auth.login(payload);
        await refreshUser();
        return { success: true };
      } catch (error) {
        return { success: false, error: errorMessage(error) };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setIsLoading(true);
      try {
        await auth.signup(payload);
        await refreshUser();
        return { success: true };
      } catch (error) {
        return { success: false, error: errorMessage(error) };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // Restore the session on load (only asks the server when a session may exist).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (hasSessionHint()) await refreshUser();
      if (alive) setIsHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, [refreshUser]);

  // A 401 from any call means the session is gone (expired or revoked elsewhere).
  useEffect(() => {
    const onUnauthorized = () => {
      if (!hasSessionHint()) setUser(null);
      else void refreshUser();
    };
    window.addEventListener("wl:unauthorized", onUnauthorized);
    return () => window.removeEventListener("wl:unauthorized", onUnauthorized);
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      authenticatedRequest,
    }),
    [user, isHydrated, isLoading, login, signup, logout, refreshUser],
  );

  return <Auth_Context.Provider value={value}>{children}</Auth_Context.Provider>;
};

export const Use_Auth_Context = () => {
  const context = useContext(Auth_Context);
  if (!context) throw new Error("Use_Auth_Context must be used within Auth_Context_Provider");
  return context;
};
