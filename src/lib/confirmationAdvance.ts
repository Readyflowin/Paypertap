import { BOOKING_ADVANCE_AMOUNT, formatINR } from "./money";

export type SellerConfirmationAdvanceType =
  | "paypertap_only"
  | "fixed"
  | "percentage";

export type ConfirmationAdvanceInput = {
  productPrice: number;
  sellerConfirmationAdvanceType?: SellerConfirmationAdvanceType | string;
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
  type?: SellerConfirmationAdvanceType | string;
  fixedAmount?: number | null;
  percent?: number | null;
  bookingPaid?: number;
};

export type ConfirmationAdvanceBreakdown = {
  totalConfirmationAdvance: number;
  paypertapBookingPaid: number;
  sellerConfirmationAmountPending: number;
  finalBalanceAfterConfirmation: number;
  sellerConfirmationAdvanceType: SellerConfirmationAdvanceType;
  type: SellerConfirmationAdvanceType;
  displayText: string;
};

export const DEFAULT_SELLER_CONFIRMATION_ADVANCE_TYPE: SellerConfirmationAdvanceType =
  "paypertap_only";

export function isSellerConfirmationAdvanceType(
  value: unknown
): value is SellerConfirmationAdvanceType {
  return value === "paypertap_only" || value === "fixed" || value === "percentage";
}

function safeRupeeAmount(value: unknown): number {
  return Math.max(0, Math.round(Number(value) || 0));
}

function normalizeType(value: unknown): SellerConfirmationAdvanceType {
  return isSellerConfirmationAdvanceType(value)
    ? value
    : DEFAULT_SELLER_CONFIRMATION_ADVANCE_TYPE;
}

export function calculateConfirmationAdvance({
  productPrice,
  sellerConfirmationAdvanceType,
  sellerConfirmationAdvanceFixedAmount,
  sellerConfirmationAdvancePercent,
  type,
  fixedAmount,
  percent,
}: ConfirmationAdvanceInput): ConfirmationAdvanceBreakdown {
  const safeProductPrice = safeRupeeAmount(productPrice);
  const paypertapBookingPaid = BOOKING_ADVANCE_AMOUNT;
  const normalizedType = normalizeType(sellerConfirmationAdvanceType ?? type);
  const configuredFixedAmount = sellerConfirmationAdvanceFixedAmount ?? fixedAmount;
  const configuredPercent = sellerConfirmationAdvancePercent ?? percent;

  let requestedAdvance = paypertapBookingPaid;

  if (normalizedType === "fixed") {
    requestedAdvance = safeRupeeAmount(configuredFixedAmount);
  }

  if (normalizedType === "percentage") {
    const safePercent = Math.max(0, Number(configuredPercent) || 0);
    requestedAdvance = Math.round((safeProductPrice * safePercent) / 100);
  }

  const totalConfirmationAdvance = Math.min(
    safeProductPrice,
    Math.max(paypertapBookingPaid, requestedAdvance)
  );
  const sellerConfirmationAmountPending =
    totalConfirmationAdvance - paypertapBookingPaid;
  const finalBalanceAfterConfirmation =
    safeProductPrice - totalConfirmationAdvance;

  const displayText =
    sellerConfirmationAmountPending > 0
      ? [
          `This seller confirms orders after collecting ${formatINR(totalConfirmationAdvance)} total advance.`,
          `Pay ${formatINR(paypertapBookingPaid)} now to reserve this item.`,
          `After booking, pay ${formatINR(sellerConfirmationAmountPending)} directly to the seller on WhatsApp to confirm the order.`,
          `Remaining at COD: ${formatINR(finalBalanceAfterConfirmation)}.`,
        ].join("\n")
      : [
          `Pay ${formatINR(paypertapBookingPaid)} now to reserve this item.`,
          `The seller will collect the remaining ${formatINR(
            finalBalanceAfterConfirmation
          )} directly.`,
        ].join("\n");

  return {
    totalConfirmationAdvance,
    paypertapBookingPaid,
    sellerConfirmationAmountPending,
    finalBalanceAfterConfirmation,
    sellerConfirmationAdvanceType: normalizedType,
    type: normalizedType,
    displayText,
  };
}
