import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  applyReservationRelease,
  applySoldTransition,
  canMarkBookingSold,
  canReleaseReservation,
} from "../lib/inventory";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { SellerConfirmationAdvanceType } from "../lib/confirmationAdvance";
import { getAvailableQuantity, getNextProductStatus } from "../lib/productAvailability";
import {
  getProductVariants,
  getSelectedVariant,
  getVariantLabel,
  isVariantAvailable,
  productHasVariants,
  type ProductVariant,
} from "../lib/productVariants";
import type { CheckoutSession, CheckoutSessionStatus, Product } from "../types/firestore";

export type CreateCheckoutSessionInput = {
  sellerId: string;
  storeId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  buyerEmail?: string;
  confirmationAdvanceType?: SellerConfirmationAdvanceType;
  totalConfirmationAdvance?: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  status?: CheckoutSessionStatus;
};

function normalizeBuyerPhone(phone: string): string {
  const normalizedPhone = normalizeIndianMobileInput(phone);

  return normalizedPhone.localNumber || phone.replace(/[^\d]/g, "");
}

function getCanonicalVariantPayload(variant?: ProductVariant | null) {
  if (!variant) return {};

  return {
    selectedVariantId: variant.variantId,
    selectedVariantLabel: getVariantLabel(variant),
    selectedVariantOptions: variant.options,
  };
}

export async function createCheckoutSessionWithReservation(
  input: CreateCheckoutSessionInput
): Promise<string> {
  // TODO: Call this after real payment verification when Razorpay replaces the mock flow.
  const checkoutRef = doc(collection(db, "checkoutSessions"));
  const productRef = doc(db, "products", input.productId);
  const checkoutId = checkoutRef.id;
  const productPrice = Math.trunc(Number(input.productPrice));
  const buyerPhone = normalizeBuyerPhone(input.buyerPhone);

  await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists()) {
      throw new Error("This item is no longer available.");
    }

    const product = productSnap.data() as {
      sellerId?: string;
      storeId?: string;
      status?: string;
      inventoryQuantity?: number;
      reservedQuantity?: number;
      soldQuantity?: number;
      hasVariants?: boolean;
      variantOptions?: unknown;
      variants?: unknown;
    };

    if (product.sellerId !== input.sellerId || product.storeId !== input.storeId) {
      throw new Error("This item is no longer available.");
    }

    const inventoryQuantity = Number(product.inventoryQuantity || 0);
    const reservedQuantity = Number(product.reservedQuantity || 0);
    const soldQuantity = Number(product.soldQuantity || 0);
    const availableQuantity = getAvailableQuantity({
      inventoryQuantity,
      reservedQuantity,
      soldQuantity,
    });

    if (product.status !== "open" || availableQuantity <= 0) {
      throw new Error("This item was just reserved. Please choose another product.");
    }

    const productWithVariants = product as Partial<Product>;
    let canonicalVariant: ProductVariant | null = null;

    if (productHasVariants(productWithVariants)) {
      const selectedVariantByOptions = getSelectedVariant(
        productWithVariants,
        input.selectedVariantOptions || {}
      );
      const selectedVariantById = getProductVariants(productWithVariants).find(
        (variant) => variant.variantId === input.selectedVariantId
      );

      if (
        !input.selectedVariantId ||
        !selectedVariantByOptions ||
        !selectedVariantById ||
        selectedVariantByOptions.variantId !== selectedVariantById.variantId ||
        !isVariantAvailable(selectedVariantById)
      ) {
        throw new Error("Please select an available size/color option.");
      }

      canonicalVariant = selectedVariantById;
    }

    const nextReservedQuantity = reservedQuantity + 1;
    const nextStatus = getNextProductStatus({
      inventoryQuantity,
      reservedQuantity: nextReservedQuantity,
      soldQuantity
    });

    transaction.set(checkoutRef, {
      checkoutId,
      sellerId: input.sellerId,
      storeId: input.storeId,
      productId: input.productId,
      productTitle: input.productTitle,
      productPrice,
      bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
      sellerCollectAmount: getSellerCollectAmount(productPrice),
      ...(input.confirmationAdvanceType
        ? {
            confirmationAdvanceType: input.confirmationAdvanceType,
            totalConfirmationAdvance: Math.round(
              Number(input.totalConfirmationAdvance) || BOOKING_ADVANCE_AMOUNT
            ),
            sellerConfirmationAmountPending: Math.round(
              Number(input.sellerConfirmationAmountPending) || 0
            ),
            finalBalanceAfterConfirmation: Math.round(
              Number(input.finalBalanceAfterConfirmation) || getSellerCollectAmount(productPrice)
            ),
          }
        : {}),
      buyerName: input.buyerName.trim(),
      ...(input.buyerEmail?.trim() ? { buyerEmail: input.buyerEmail.trim() } : {}),
      buyerPhone,
      buyerAddress: input.buyerAddress.trim(),
      buyerCity: input.buyerCity.trim(),
      buyerPincode: input.buyerPincode.trim(),
      ...getCanonicalVariantPayload(canonicalVariant),
      status: "booking_paid",
      whatsappOpened: false,
      reservationApplied: true,
      reservedProductId: input.productId,
      reservedQuantity: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(productRef, {
      reservedQuantity: nextReservedQuantity,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  });

  return checkoutId;
}

export async function repairMissingCheckoutReservation(
  checkoutSession: CheckoutSession
): Promise<boolean> {
  void checkoutSession;
  return false;
}

export async function getCheckoutSessionById(
  checkoutId: string
): Promise<CheckoutSession | null> {
  const checkoutSnap = await getDoc(doc(db, "checkoutSessions", checkoutId));

  if (!checkoutSnap.exists()) {
    return null;
  }

  return checkoutSnap.data() as CheckoutSession;
}

export async function markCheckoutEmailEventSent(
  checkoutId: string,
  field: "sellerBookingSentAt" | "buyerBookingSentAt"
): Promise<void> {
  void checkoutId;
  void field;
}

function getTimeValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return 0;
}

function getProductRefForCheckout(checkoutSession: CheckoutSession) {
  return doc(db, "products", checkoutSession.reservedProductId || checkoutSession.productId);
}

export async function getCheckoutSessionsBySellerId(
  sellerId: string,
  storeId?: string
): Promise<CheckoutSession[]> {
  const sessionsRef = collection(db, "checkoutSessions");
  const sessionsQuery = query(sessionsRef, where("sellerId", "==", sellerId));
  const sessionsSnap = await getDocs(sessionsQuery);

  return sessionsSnap.docs
    .map((sessionDoc) => ({
      ...(sessionDoc.data() as CheckoutSession),
      checkoutId: String(sessionDoc.data().checkoutId || sessionDoc.id),
    }))
    .filter((session) => !storeId || session.storeId === storeId)
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt));
}

export async function getCheckoutSessionsByStoreId(
  storeId: string,
  sellerId?: string
): Promise<CheckoutSession[]> {
  const sessionsRef = collection(db, "checkoutSessions");
  const sessionsQuery = query(sessionsRef, where("storeId", "==", storeId));
  const sessionsSnap = await getDocs(sessionsQuery);

  return sessionsSnap.docs
    .map((sessionDoc) => ({
      ...(sessionDoc.data() as CheckoutSession),
      checkoutId: String(sessionDoc.data().checkoutId || sessionDoc.id),
    }))
    .filter((session) => !sellerId || session.sellerId === sellerId)
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt));
}

async function updateBookingStatus(
  checkoutId: string,
  status: CheckoutSessionStatus
): Promise<void> {
  await updateDoc(doc(db, "checkoutSessions", checkoutId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function markBookingContacted(checkoutId: string): Promise<void> {
  await updateBookingStatus(checkoutId, "contacted");
}

export async function markBookingRemainingPaid(checkoutId: string): Promise<void> {
  await updateBookingStatus(checkoutId, "remaining_paid");
}

export async function markBookingConfirmed(checkoutId: string): Promise<void> {
  await updateBookingStatus(checkoutId, "confirmed");
}

export async function markBookingSold(checkoutId: string): Promise<void> {
  const checkoutRef = doc(db, "checkoutSessions", checkoutId);

  await runTransaction(db, async (transaction) => {
    const checkoutSnap = await transaction.get(checkoutRef);

    if (!checkoutSnap.exists()) {
      throw new Error("Booking not found.");
    }

    const checkoutSession = {
      ...(checkoutSnap.data() as CheckoutSession),
      checkoutId: String(checkoutSnap.data().checkoutId || checkoutSnap.id),
    };

    if (checkoutSession.status === "sold") {
      return;
    }

    if (!canMarkBookingSold(checkoutSession)) {
      throw new Error("Only active reserved bookings can be marked sold.");
    }

    const productRef = getProductRefForCheckout(checkoutSession);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists()) {
      throw new Error("Reserved product not found.");
    }

    const product = productSnap.data() as Product;

    if (
      product.sellerId !== checkoutSession.sellerId ||
      product.storeId !== checkoutSession.storeId ||
      (product.productId || productSnap.id) !== checkoutSession.productId
    ) {
      throw new Error("Booking and product no longer match.");
    }

    const soldTransition = applySoldTransition(product, checkoutSession.reservedQuantity);

    if (soldTransition.soldTransitionQuantity <= 0) {
      throw new Error("This booking has no reserved stock to mark sold.");
    }
    const now = serverTimestamp();

    transaction.update(productRef, {
      reservedQuantity: soldTransition.reservedQuantity,
      soldQuantity: soldTransition.soldQuantity,
      status: soldTransition.status,
      updatedAt: now,
    });
    transaction.update(checkoutRef, {
      status: "sold",
      reservationApplied: false,
      reservationSold: true,
      soldAt: now,
      updatedAt: now,
    });
  });
}

export async function markBookingCancelled(checkoutId: string): Promise<void> {
  const checkoutRef = doc(db, "checkoutSessions", checkoutId);

  await runTransaction(db, async (transaction) => {
    const checkoutSnap = await transaction.get(checkoutRef);

    if (!checkoutSnap.exists()) {
      throw new Error("Booking not found.");
    }

    const checkoutSession = {
      ...(checkoutSnap.data() as CheckoutSession),
      checkoutId: String(checkoutSnap.data().checkoutId || checkoutSnap.id),
    };

    if (checkoutSession.status === "cancelled" || checkoutSession.status === "released") {
      return;
    }

    if (checkoutSession.status === "sold") {
      throw new Error("Sold bookings cannot be cancelled.");
    }

    const hasActiveReservation = canReleaseReservation(checkoutSession);
    const now = serverTimestamp();

    if (!hasActiveReservation) {
      transaction.update(checkoutRef, {
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      });
      return;
    }

    const productRef = getProductRefForCheckout(checkoutSession);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists()) {
      throw new Error("Reserved product not found.");
    }

    const product = productSnap.data() as Product;

    if (
      product.sellerId !== checkoutSession.sellerId ||
      product.storeId !== checkoutSession.storeId ||
      (product.productId || productSnap.id) !== checkoutSession.productId
    ) {
      throw new Error("Booking and product no longer match.");
    }

    const releaseTransition = applyReservationRelease(product, checkoutSession.reservedQuantity);

    if (releaseTransition.releasedQuantity <= 0) {
      transaction.update(checkoutRef, {
        status: "cancelled",
        reservationApplied: false,
        reservationReleased: true,
        cancelledAt: now,
        updatedAt: now,
      });
      return;
    }

    transaction.update(productRef, {
      reservedQuantity: releaseTransition.reservedQuantity,
      status: releaseTransition.status,
      updatedAt: now,
    });
    transaction.update(checkoutRef, {
      status: "cancelled",
      reservationApplied: false,
      reservationReleased: true,
      cancelledAt: now,
      updatedAt: now,
    });
  });
}
