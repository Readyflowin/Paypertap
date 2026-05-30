import {
  createCheckoutSessionWithReservation,
  getCheckoutSessionById,
  type CreateCheckoutSessionInput,
} from "./checkoutService";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { CheckoutSession } from "../types/firestore";

function normalizeBuyerPhone(phone: string): string {
  const normalizedPhone = normalizeIndianMobileInput(phone);

  return normalizedPhone.localNumber || phone.replace(/[^\d]/g, "");
}

export function buildCheckoutSession(
  input: CreateCheckoutSessionInput,
  checkoutId: string
): CheckoutSession {
  const productPrice = Math.trunc(Number(input.productPrice));

  return {
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
    ...(input.selectedVariantId
      ? {
          selectedVariantId: input.selectedVariantId,
          selectedVariantLabel: input.selectedVariantLabel || "",
          selectedVariantOptions: input.selectedVariantOptions || {},
        }
      : {}),
    status: "booking_paid",
    whatsappOpened: false,
    reservationApplied: true,
    reservedProductId: input.productId,
    reservedQuantity: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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
  const checkoutSession =
    (await getCheckoutSessionById(checkoutId)) || buildCheckoutSession(input, checkoutId);

  return {
    success: true,
    checkoutId,
    checkoutSession,
    reservationApplied: true,
  };
}
