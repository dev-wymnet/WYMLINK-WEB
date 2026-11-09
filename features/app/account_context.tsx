"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { freeOrderRows, kyc, orders, pin, promo as promoApi, wallet, type DashboardHome, type LedgerRow, type PinStatus, type PromoState, type Verification } from "@/lib/api/wymlink";

// Everything the signed-in app needs to decide what to show: wallet + recent
// activity, whether a transaction PIN exists, KYC status, and the free event (if one runs).

type AccountState = {
  home: DashboardHome | null;
  // Latest wallet ledger lines. /dashboard/home's recentTransactions lists each
  // airtime/data purchase twice (ledger debit + telecom row), so the UI uses this.
  recent: LedgerRow[] | null;
  pinStatus: PinStatus | null;
  verification: Verification | null;
  // The running free event and this customer's allowance left (event: null when none).
  promo: PromoState | null;
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
  const [promo, setPromo] = useState<PromoState | null>(null);
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
      const [h, r, p, o] = await Promise.all([
        wallet.home(),
        wallet.transactions(6).catch(() => null),
        promoApi.current().catch(() => null),
        orders.list(10).catch(() => []),
        refreshPin().catch(() => undefined),
        refreshKyc().catch(() => undefined),
      ]);
      setHome(h);
      // Free event purchases have no ledger line: merge them in by time.
      setRecent([...(r?.transactions ?? []), ...freeOrderRows(o)].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 6));
      setPromo(p);
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
      promo,
      loading,
      error,
      refresh,
      refreshPin,
      refreshKyc,
      needsPin,
      bvnVerified,
      ninVerified,
      // Identity checks only raise limits now: an account number comes with sign-up.
      setupComplete: !needsPin,
    };
  }, [home, recent, pinStatus, verification, promo, loading, error, refresh, refreshPin, refreshKyc]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAccount must be used inside AccountProvider");
  return c;
};
