import {
  createCheckoutSession,
  createCheckoutSessionWithReservation,
  type CreateCheckoutSessionInput,
} from "./checkoutService";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import type { CheckoutSession } from "../types/firestore";

function normalizeBuyerPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String((error as { code?: unknown }).code) === "permission-denied"
  );
}

export async function startMockBookingPayment(
  input: CreateCheckoutSessionInput
): Promise<{
  success: true;
  checkoutId: string;
  checkoutSession: CheckoutSession;
  reservationApplied: boolean;
}> {
  // TODO: Replace this with backend Razorpay order + payment verification later.
  let checkoutId = "";
  let reservationApplied = true;

  try {
    checkoutId = await createCheckoutSessionWithReservation(input);
  } catch (error) {
    if (!isPermissionDenied(error)) {
      throw error;
    }

    console.warn(
      "Public mock checkout cannot update product inventory under current production rules. Falling back to checkoutSession-only create.",
      error
    );
    // TODO: Move reservation to backend after real Razorpay verification.
    checkoutId = await createCheckoutSession({
      ...input,
      status: "booking_paid",
    });
    reservationApplied = false;
  }

  const productPrice = Math.trunc(Number(input.productPrice));
  const checkoutSession: CheckoutSession = {
    checkoutId,
    sellerId: input.sellerId,
    storeId: input.storeId,
    productId: input.productId,
    productTitle: input.productTitle,
    productPrice,
    bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
    sellerCollectAmount: getSellerCollectAmount(productPrice),
    buyerName: input.buyerName.trim(),
    ...(input.buyerEmail?.trim() ? { buyerEmail: input.buyerEmail.trim() } : {}),
    buyerPhone: normalizeBuyerPhone(input.buyerPhone),
    buyerAddress: input.buyerAddress.trim(),
    buyerCity: input.buyerCity.trim(),
    buyerPincode: input.buyerPincode.trim(),
    status: "booking_paid",
    whatsappOpened: false,
  };

  return {
    success: true,
    checkoutId,
    checkoutSession,
    reservationApplied,
  };
}
