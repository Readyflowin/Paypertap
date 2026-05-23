import clsx from "clsx";

import { Card } from "@/components/ui";
import { formatINR } from "@/lib/money";

type PriceBreakdownMode = "buyer" | "seller" | "compact";

export type PriceBreakdownProps = {
  price: number;
  advanceAmount?: number;
  mode?: PriceBreakdownMode;
  showTitle?: boolean;
  title?: string;
  className?: string;
};

function getHelperText(mode: PriceBreakdownMode) {
  if (mode === "seller") {
    return "PayPerTap keeps ₹20 as the verified booking fee. You collect the remaining amount directly.";
  }

  return "The ₹20 booking advance is adjusted against the product price.";
}

export function PriceBreakdown({
  price,
  advanceAmount = 20,
  mode = "buyer",
  showTitle = true,
  title,
  className,
}: PriceBreakdownProps) {
  const safePrice = Math.max(Number(price) || 0, 0);
  const safeAdvanceAmount = Math.max(Number(advanceAmount) || 0, 0);
  const remainingAmount = Math.max(safePrice - safeAdvanceAmount, 0);

  if (mode === "compact") {
    return (
      <div
        className={clsx(
          "flex flex-wrap items-center gap-2 rounded-[var(--ppt-radius-lg)] border border-[var(--ppt-border)] bg-[var(--ppt-surface-soft)] px-3 py-2 text-sm",
          className
        )}
      >
        <span className="font-bold text-[var(--ppt-primary-dark)]">
          {formatINR(safeAdvanceAmount)} booking
        </span>
        <span className="text-[var(--ppt-text-muted)]">+</span>
        <span className="font-semibold text-[var(--ppt-text)]">
          {formatINR(remainingAmount)} later
        </span>
      </div>
    );
  }

  const rows =
    mode === "seller"
      ? [
          ["Product price", safePrice],
          ["PayPerTap booking fee", safeAdvanceAmount],
          ["You collect from buyer", remainingAmount],
        ]
      : [
          ["Product price", safePrice],
          ["Booking advance today", safeAdvanceAmount],
          ["Pay seller later", remainingAmount],
        ];

  return (
    <Card variant="soft" padding="md" className={className}>
      {showTitle ? (
        <h3 className="mb-4 text-base font-bold text-[var(--ppt-text)]">
          {title || "Price breakdown"}
        </h3>
      ) : null}

      <div className="space-y-3">
        {rows.map(([label, amount], index) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--ppt-text-muted)]">{label}</span>
            <span
              className={clsx(
                "text-right font-bold text-[var(--ppt-text)]",
                index === rows.length - 1 && "text-[var(--ppt-primary-dark)]"
              )}
            >
              {formatINR(Number(amount))}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-[var(--ppt-border)] pt-3 text-sm leading-6 text-[var(--ppt-text-muted)]">
        {getHelperText(mode)}
      </p>
    </Card>
  );
}
