import {
  createCheckoutSessionWithReservation,
  type CreateCheckoutSessionInput,
} from "./checkoutService";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import type { CheckoutSession } from "../types/firestore";

function normalizeBuyerPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
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
  const checkoutId = await createCheckoutSessionWithReservation(input);
  const reservationApplied = true;

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
    reservationApplied,
    reservedProductId: input.productId,
    reservedQuantity: 1,
  };

  return {
    success: true,
    checkoutId,
    checkoutSession,
    reservationApplied,
  };
}
