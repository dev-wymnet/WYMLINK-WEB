import { IcArrowDownLeft, IcArrowUpRight } from "@/components/app/icons";
import { Badge, cx, statusTone } from "@/components/app/ui";
import type { LedgerRow } from "@/lib/api/wymlink";
import { naira, titleCase } from "@/lib/format";

// One wallet ledger line: icon, description, signed amount and status.
export function LedgerItem({ row, meta }: { row: LedgerRow; meta: string }) {
  const credit = row.direction === "credit";
  return (
    <>
      <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl", credit ? "bg-ok-soft text-ok" : "bg-canvas text-ink-soft")}>
        {credit ? <IcArrowDownLeft aria-hidden /> : <IcArrowUpRight aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{row.description || titleCase(row.transactionType)}</p>
        <p className="text-xs text-ink-soft">{meta}</p>
      </div>
      <div className="text-right">
        <p className={cx("font-semibold tabular-nums", credit ? "text-ok" : "text-ink")}>
          <span className="sr-only">{credit ? "Received " : "Spent "}</span>
          {credit ? "+" : "−"}
          {naira(row.amount)}
        </p>
        <Badge tone={statusTone(row.status)}>{titleCase(row.status)}</Badge>
      </div>
    </>
  );
}
