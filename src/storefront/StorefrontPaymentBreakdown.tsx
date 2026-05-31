import { ShieldCheck } from "lucide-react";

import {
  calculateConfirmationAdvance,
  type ConfirmationAdvanceBreakdown,
} from "@/lib/confirmationAdvance";
import { BOOKING_ADVANCE_AMOUNT, formatINR } from "@/lib/money";
import type { Store } from "@/types/firestore";

type StorefrontPaymentBreakdownClasses = {
  shell: string;
  icon: string;
  title: string;
  text: string;
  panel: string;
  eyebrow: string;
  rowLabel: string;
  rowValue: string;
  featuredValue: string;
  note: string;
};

type StorefrontPaymentBreakdownProps = {
  classes: StorefrontPaymentBreakdownClasses;
  productPrice: number;
  store?: Pick<
    Store,
    | "sellerConfirmationAdvanceType"
    | "sellerConfirmationAdvanceFixedAmount"
    | "sellerConfirmationAdvancePercent"
  > | null;
};

export function getStoreConfirmationAdvanceBreakdown({
  productPrice,
  store,
}: Pick<StorefrontPaymentBreakdownProps, "productPrice" | "store">): ConfirmationAdvanceBreakdown {
  return calculateConfirmationAdvance({
    productPrice,
    sellerConfirmationAdvanceType: store?.sellerConfirmationAdvanceType,
    sellerConfirmationAdvanceFixedAmount: store?.sellerConfirmationAdvanceFixedAmount,
    sellerConfirmationAdvancePercent: store?.sellerConfirmationAdvancePercent,
  });
}

export function getStorefrontPaymentSubtext(
  breakdown: Pick<
    ConfirmationAdvanceBreakdown,
    "paypertapBookingPaid" | "sellerConfirmationAmountPending"
  >
): string {
  return breakdown.sellerConfirmationAmountPending > 0
    ? `${formatINR(breakdown.paypertapBookingPaid)} now / ${formatINR(
        breakdown.sellerConfirmationAmountPending
      )} on WhatsApp`
    : `${formatINR(breakdown.paypertapBookingPaid)} now / balance on WhatsApp`;
}

export function getStorefrontConfirmationPolicyText(
  store?: StorefrontPaymentBreakdownProps["store"]
): string {
  const type = store?.sellerConfirmationAdvanceType || "paypertap_only";

  if (type === "fixed") {
    const totalAdvance = Math.max(
      BOOKING_ADVANCE_AMOUNT,
      Math.round(Number(store?.sellerConfirmationAdvanceFixedAmount) || BOOKING_ADVANCE_AMOUNT)
    );
    const sellerPending = Math.max(totalAdvance - BOOKING_ADVANCE_AMOUNT, 0);

    return sellerPending > 0
      ? `Pay ${formatINR(BOOKING_ADVANCE_AMOUNT)} to reserve an item, then pay ${formatINR(
          sellerPending
        )} on WhatsApp to confirm with the seller.`
      : `Pay ${formatINR(BOOKING_ADVANCE_AMOUNT)} to reserve an item. The seller collects the final balance directly.`;
  }

  if (type === "percentage") {
    const percent = Math.max(
      1,
      Math.round(Number(store?.sellerConfirmationAdvancePercent) || 0)
    );

    return `Pay ${formatINR(BOOKING_ADVANCE_AMOUNT)} to reserve an item. Product pages show the exact ${percent}% confirmation amount before booking.`;
  }

  return `Pay ${formatINR(BOOKING_ADVANCE_AMOUNT)} to reserve an item. The seller collects the final balance directly.`;
}

export function StorefrontPaymentBreakdown({
  classes,
  productPrice,
  store,
}: StorefrontPaymentBreakdownProps) {
  const breakdown = getStoreConfirmationAdvanceBreakdown({ productPrice, store });
  const hasSellerConfirmation = breakdown.sellerConfirmationAmountPending > 0;
  const rows = hasSellerConfirmation
    ? [
        { label: "Pay now", value: formatINR(breakdown.paypertapBookingPaid), featured: true },
        {
          label: "Confirm on WhatsApp",
          value: formatINR(breakdown.sellerConfirmationAmountPending),
        },
        { label: "Final balance", value: formatINR(breakdown.finalBalanceAfterConfirmation) },
      ]
    : [
        { label: "Pay now", value: formatINR(breakdown.paypertapBookingPaid), featured: true },
        { label: "Final balance", value: formatINR(breakdown.finalBalanceAfterConfirmation) },
      ];

  return (
    <section className={classes.shell}>
      <div className="flex items-start gap-3">
        <div className={classes.icon}>
          <ShieldCheck size={17} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className={classes.title}>Reserve this item</h2>
          <p className={classes.text}>
            {hasSellerConfirmation
              ? `Pay ${formatINR(
                  breakdown.paypertapBookingPaid
                )} now to hold it. Then pay ${formatINR(
                  breakdown.sellerConfirmationAmountPending
                )} on WhatsApp to confirm with the seller.`
              : `Pay ${formatINR(
                  breakdown.paypertapBookingPaid
                )} now to hold it. The seller will collect the remaining ${formatINR(
                  breakdown.finalBalanceAfterConfirmation
                )} directly.`}
          </p>
        </div>
      </div>

      <div className={classes.panel}>
        <p className={classes.eyebrow}>Payment breakdown</p>
        <div className="grid gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex min-w-0 items-center justify-between gap-3">
              <span className={classes.rowLabel}>{row.label}</span>
              <strong className={row.featured ? classes.featuredValue : classes.rowValue}>
                {row.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <p className={classes.note}>Details are sent to the seller after booking.</p>
    </section>
  );
}
