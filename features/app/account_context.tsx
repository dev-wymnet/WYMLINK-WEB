"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { kyc, pin, wallet, type DashboardHome, type LedgerRow, type PinStatus, type Verification } from "@/lib/api/wymlink";

// Everything the signed-in app needs to decide what to show: wallet + recent
// activity, whether a transaction PIN exists, and KYC status.

type AccountState = {
  home: DashboardHome | null;
  // Latest wallet ledger lines. /dashboard/home's recentTransactions lists each
  // airtime/data purchase twice (ledger debit + telecom row), so the UI uses this.
  recent: LedgerRow[] | null;
  pinStatus: PinStatus | null;
  verification: Verification | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshPin: () => Promise<void>;
  refreshKyc: () => Promise<void>;
  // Derived
  needsPin: boolean;
  bvnVerified: boolean;
  ninVerified: boolean;
  setupComplete: boolean;
};

const Ctx = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [home, setHome] = useState<DashboardHome | null>(null);
  const [recent, setRecent] = useState<LedgerRow[] | null>(null);
  const [pinStatus, setPinStatus] = useState<PinStatus | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPin = useCallback(async () => {
    try {
      setPinStatus(await pin.status());
    } catch (e) {
      // Older backend without /auth/pin/status: treat as unknown (null), never as "set".
      if (!(e instanceof ApiError && e.status === 404)) throw e;
      setPinStatus(null);
    }
  }, []);

  const refreshKyc = useCallback(async () => {
    setVerification(await kyc.status());
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [h, r] = await Promise.all([
        wallet.home(),
        wallet.transactions(6).catch(() => null),
        refreshPin().catch(() => undefined),
        refreshKyc().catch(() => undefined),
      ]);
      setHome(h);
      setRecent(r?.transactions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your account.");
    } finally {
      setLoading(false);
    }
  }, [refreshKyc, refreshPin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AccountState>(() => {
    const bvnVerified = verification?.bvn.status === "VERIFIED";
    const ninVerified = verification?.nin.status === "VERIFIED";
    const needsPin = pinStatus ? !pinStatus.transactionPinSet : false;
    return {
      home,
      recent,
      pinStatus,
      verification,
      loading,
      error,
      refresh,
      refreshPin,
      refreshKyc,
      needsPin,
      bvnVerified,
      ninVerified,
      setupComplete: !needsPin && (bvnVerified || ninVerified),
    };
  }, [home, recent, pinStatus, verification, loading, error, refresh, refreshPin, refreshKyc]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAccount must be used inside AccountProvider");
  return c;
};
