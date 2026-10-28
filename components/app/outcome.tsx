"use client";

import type { ReactNode } from "react";
import { IcCircleCheck, IcCircleX, IcClock } from "@/components/app/icons";
import { Button, cx } from "@/components/app/ui";
import type { PurchaseOutcome } from "@/lib/api/wymlink";

// Result screen for every payment: success, still processing, or failed (refunded).
const LOOK: Record<PurchaseOutcome, { icon: typeof IcClock; tint: string }> = {
  success: { icon: IcCircleCheck, tint: "text-ok" },
  pending: { icon: IcClock, tint: "text-warn" },
  failed: { icon: IcCircleX, tint: "text-bad" },
};

export function Outcome({
  status,
  title,
  body,
  children,
  againLabel = "Buy again",
  onAgain,
}: {
  status: PurchaseOutcome;
  title: string;
  body: ReactNode;
  children?: ReactNode;
  againLabel?: string;
  onAgain: () => void;
}) {
  const { icon: Icon, tint } = LOOK[status];
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
      <span className={cx("grid size-16 place-items-center text-6xl", tint)}>
        <Icon aria-hidden />
      </span>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-ink-soft">{body}</p>
      {children}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" href="/dashboard/transactions">
          View transactions
        </Button>
        <Button onClick={onAgain}>{status === "failed" ? "Try again" : againLabel}</Button>
      </div>
    </div>
  );
}

// Shared copy for the two non-success states.
export const PENDING_BODY = "The provider hasn't confirmed it yet. We'll keep checking — if it fails, the money goes straight back to your wallet.";
export const FAILED_BODY = "The provider couldn't complete this payment. Any money taken has been returned to your wallet.";
