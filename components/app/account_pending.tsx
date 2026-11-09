"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "@/features/app/account_context";
import { wallet } from "@/lib/api/wymlink";

// Shown while a customer has no account number yet. Asking the backend for it also opens it
// (or retries a failed opening), so this checks every few seconds and refreshes the account
// once it lands. Gives up quietly after two minutes; the next visit asks again.
export function AccountNumberPending({ className }: { className?: string }) {
  const { refresh } = useAccount();
  const tries = useRef(0);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      tries.current += 1;
      try {
        const r = await wallet.account();
        if (!alive) return;
        if (r.account) {
          await refresh();
          return;
        }
      } catch {
        // Network blip: try again on the next tick.
      }
      if (alive && tries.current < 15) timer = setTimeout(check, 8000);
    };
    void check();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [refresh]);

  return <p className={className}>Your account number is being set up. It appears here in a few seconds.</p>;
}
