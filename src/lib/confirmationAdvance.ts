import { BOOKING_ADVANCE_AMOUNT, formatINR } from "./money";

export type SellerConfirmationAdvanceType =
  | "paypertap_only"
  | "fixed"
  | "percentage";

export type ConfirmationAdvanceInput = {
  productPrice: number;
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
  type,
  fixedAmount,
  percent,
  bookingPaid = BOOKING_ADVANCE_AMOUNT,
}: ConfirmationAdvanceInput): ConfirmationAdvanceBreakdown {
  const safeProductPrice = safeRupeeAmount(productPrice);
  const paypertapBookingPaid = safeRupeeAmount(bookingPaid) || BOOKING_ADVANCE_AMOUNT;
  const normalizedType = normalizeType(type);

  let requestedAdvance = paypertapBookingPaid;

  if (normalizedType === "fixed") {
    requestedAdvance = safeRupeeAmount(fixedAmount);
  }

  if (normalizedType === "percentage") {
    const safePercent = Math.max(0, Number(percent) || 0);
    requestedAdvance = Math.round((safeProductPrice * safePercent) / 100);
  }

  const minimumAdvance = Math.min(paypertapBookingPaid, safeProductPrice || paypertapBookingPaid);
  const totalConfirmationAdvance = Math.min(
    safeProductPrice || paypertapBookingPaid,
    Math.max(minimumAdvance, requestedAdvance)
  );
  const sellerConfirmationAmountPending = Math.max(
    totalConfirmationAdvance - paypertapBookingPaid,
    0
  );
  const finalBalanceAfterConfirmation = Math.max(
    safeProductPrice - totalConfirmationAdvance,
    0
  );

  const displayText =
    sellerConfirmationAmountPending > 0
      ? [
          `This seller confirms orders after collecting ${formatINR(totalConfirmationAdvance)} total advance.`,
          `Pay ${formatINR(paypertapBookingPaid)} now to reserve this item.`,
          `After booking, pay ${formatINR(sellerConfirmationAmountPending)} directly to the seller on WhatsApp to confirm the order.`,
          `Remaining on COD : ${formatINR(finalBalanceAfterConfirmation)}.`,
        ].join("\n")
      : [
          `Pay ${formatINR(paypertapBookingPaid)} now to reserve this item.`,
          `The seller will collect the remaining ${formatINR(
            Math.max(safeProductPrice - paypertapBookingPaid, 0)
          )} directly on WhatsApp.`,
        ].join("\n");

  return {
    totalConfirmationAdvance,
    paypertapBookingPaid,
    sellerConfirmationAmountPending,
    finalBalanceAfterConfirmation,
    type: normalizedType,
    displayText,
  };
}
