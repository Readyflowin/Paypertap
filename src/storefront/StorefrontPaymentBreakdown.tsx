import { ShieldCheck } from "lucide-react";

import { formatINR } from "@/lib/money";
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

type StorePaymentFields = Pick<Store, "paymentMode" | "advanceAmount">;

type StorefrontPaymentBreakdownProps = {
  classes: StorefrontPaymentBreakdownClasses;
  productPrice: number;
  store?: StorePaymentFields | null;
};

export type StorefrontOrderPaymentBreakdown = {
  paymentMode: "cod" | "partial_advance";
  advanceAmount: number;
  sellerAmountDue: number;
};

function getSafeAmount(value: unknown): number {
  const amount = Math.round(Number(value) || 0);

  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function getStoreOrderPaymentBreakdown({
  productPrice,
  store,
}: Pick<
  StorefrontPaymentBreakdownProps,
  "productPrice" | "store"
>): StorefrontOrderPaymentBreakdown {
  const safeProductPrice = getSafeAmount(productPrice);
  const paymentMode = store?.paymentMode === "partial_advance" ? "partial_advance" : "cod";
  const advanceAmount =
    paymentMode === "partial_advance"
      ? Math.min(getSafeAmount(store?.advanceAmount) || 100, safeProductPrice)
      : 0;

  return {
    paymentMode,
    advanceAmount,
    sellerAmountDue: Math.max(safeProductPrice - advanceAmount, 0),
  };
}

export function getStorefrontPaymentSubtext(
  breakdown: StorefrontOrderPaymentBreakdown
): string {
  if (breakdown.paymentMode === "partial_advance") {
    return `${formatINR(breakdown.advanceAmount)} seller advance / ${formatINR(
      breakdown.sellerAmountDue
    )} remaining`;
  }

  return `${formatINR(breakdown.sellerAmountDue)} Cash on Delivery`;
}

export function getStorefrontConfirmationPolicyText(
  store?: StorefrontPaymentBreakdownProps["store"]
): string {
  const paymentMode = store?.paymentMode === "partial_advance" ? "partial_advance" : "cod";
  const advanceAmount = getSafeAmount(store?.advanceAmount) || 100;

  if (paymentMode === "partial_advance") {
    return `Place the order, then pay ${formatINR(
      advanceAmount
    )} through the seller's Razorpay link. The seller confirms payment and delivery details directly.`;
  }

  return "Place the order and pay the seller directly when the item is delivered or handed over.";
}

export function StorefrontPaymentBreakdown({
  classes,
  productPrice,
  store,
}: StorefrontPaymentBreakdownProps) {
  const breakdown = getStoreOrderPaymentBreakdown({ productPrice, store });
  const isPartialAdvance = breakdown.paymentMode === "partial_advance";
  const rows = isPartialAdvance
    ? [
        { label: "Advance to seller", value: formatINR(breakdown.advanceAmount), featured: true },
        { label: "Remaining with seller", value: formatINR(breakdown.sellerAmountDue) },
      ]
    : [
        { label: "Payment mode", value: "Cash on Delivery", featured: true },
        { label: "Amount to collect", value: formatINR(breakdown.sellerAmountDue) },
      ];

  return (
    <section className={classes.shell}>
      <div className="flex items-start gap-3">
        <div className={classes.icon}>
          <ShieldCheck size={17} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className={classes.title}>
            {isPartialAdvance ? "Seller advance order" : "Cash on Delivery order"}
          </h2>
          <p className={classes.text}>
            {isPartialAdvance
              ? `Place the order now, then pay ${formatINR(
                  breakdown.advanceAmount
                )} through the seller's Razorpay link.`
              : "Place the order now. The seller will confirm availability, delivery, and payment details."}
          </p>
        </div>
      </div>

      <div className={classes.panel}>
        <p className={classes.eyebrow}>Order payment</p>
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

      <p className={classes.note}>Your order details are sent to the seller after submission.</p>
    </section>
  );
}
