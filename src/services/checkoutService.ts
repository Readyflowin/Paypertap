import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import type { CheckoutSession, CheckoutSessionStatus } from "../types/firestore";

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
  status?: CheckoutSessionStatus;
};

function getNextProductStatus(
  inventoryQuantity: number,
  reservedQuantity: number,
  soldQuantity: number
) {
  const availableQuantity = inventoryQuantity - reservedQuantity - soldQuantity;

  if (soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

function normalizeBuyerPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<string> {
  const checkoutRef = doc(collection(db, "checkoutSessions"));
  const checkoutId = checkoutRef.id;
  const productPrice = Math.trunc(Number(input.productPrice));
  const buyerPhone = normalizeBuyerPhone(input.buyerPhone);

  const checkoutData: CheckoutSession = {
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
    buyerPhone,
    buyerAddress: input.buyerAddress.trim(),
    buyerCity: input.buyerCity.trim(),
    buyerPincode: input.buyerPincode.trim(),
    status: input.status || "booking_paid",
    whatsappOpened: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(checkoutRef, checkoutData);

  return checkoutId;
}

export async function createCheckoutSessionWithReservation(
  input: CreateCheckoutSessionInput
): Promise<string> {
  // TODO: Production reservation must be moved to backend/Admin SDK after Razorpay verification.
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
    };

    if (product.sellerId !== input.sellerId || product.storeId !== input.storeId) {
      throw new Error("This item is no longer available.");
    }

    const inventoryQuantity = Number(product.inventoryQuantity || 0);
    const reservedQuantity = Number(product.reservedQuantity || 0);
    const soldQuantity = Number(product.soldQuantity || 0);
    const availableQuantity = inventoryQuantity - reservedQuantity - soldQuantity;

    if (product.status !== "open" || availableQuantity <= 0) {
      throw new Error("This item is no longer available.");
    }

    const nextReservedQuantity = reservedQuantity + 1;
    const nextStatus = getNextProductStatus(
      inventoryQuantity,
      nextReservedQuantity,
      soldQuantity
    );

    transaction.set(checkoutRef, {
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
      buyerPhone,
      buyerAddress: input.buyerAddress.trim(),
      buyerCity: input.buyerCity.trim(),
      buyerPincode: input.buyerPincode.trim(),
      status: "booking_paid",
      whatsappOpened: false,
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
  await updateDoc(doc(db, "checkoutSessions", checkoutId), {
    [`emailEvents.${field}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

export async function markBookingSold(
  checkoutSession: CheckoutSession
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const checkoutRef = doc(db, "checkoutSessions", checkoutSession.checkoutId);
    const productRef = doc(db, "products", checkoutSession.productId);
    const [checkoutSnap, productSnap] = await Promise.all([
      transaction.get(checkoutRef),
      transaction.get(productRef),
    ]);

    if (!checkoutSnap.exists() || !productSnap.exists()) {
      throw new Error("Booking or product could not be found.");
    }

    const latestSession = checkoutSnap.data() as CheckoutSession;

    if (latestSession.status === "sold") return;

    if (["cancelled", "released"].includes(latestSession.status)) {
      throw new Error("This booking was already released.");
    }

    const product = productSnap.data() as {
      inventoryQuantity?: number;
      reservedQuantity?: number;
      soldQuantity?: number;
    };
    const inventoryQuantity = Number(product.inventoryQuantity || 0);
    const reservedQuantity = Number(product.reservedQuantity || 0);
    const soldQuantity = Number(product.soldQuantity || 0);
    const nextReservedQuantity = Math.max(0, reservedQuantity - 1);
    const nextSoldQuantity = Math.min(inventoryQuantity, soldQuantity + 1);
    const nextStatus = getNextProductStatus(
      inventoryQuantity,
      nextReservedQuantity,
      nextSoldQuantity
    );

    transaction.update(checkoutRef, {
      status: "sold",
      updatedAt: serverTimestamp(),
    });
    transaction.update(productRef, {
      reservedQuantity: nextReservedQuantity,
      soldQuantity: nextSoldQuantity,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function cancelOrReleaseBooking(
  checkoutSession: CheckoutSession
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const checkoutRef = doc(db, "checkoutSessions", checkoutSession.checkoutId);
    const productRef = doc(db, "products", checkoutSession.productId);
    const [checkoutSnap, productSnap] = await Promise.all([
      transaction.get(checkoutRef),
      transaction.get(productRef),
    ]);

    if (!checkoutSnap.exists() || !productSnap.exists()) {
      throw new Error("Booking or product could not be found.");
    }

    const latestSession = checkoutSnap.data() as CheckoutSession;

    if (latestSession.status === "sold") {
      throw new Error("Sold bookings cannot be released.");
    }

    if (["cancelled", "released"].includes(latestSession.status)) return;

    const product = productSnap.data() as {
      inventoryQuantity?: number;
      reservedQuantity?: number;
      soldQuantity?: number;
    };
    const inventoryQuantity = Number(product.inventoryQuantity || 0);
    const reservedQuantity = Number(product.reservedQuantity || 0);
    const soldQuantity = Number(product.soldQuantity || 0);
    const nextReservedQuantity = Math.max(0, reservedQuantity - 1);
    const nextStatus = getNextProductStatus(
      inventoryQuantity,
      nextReservedQuantity,
      soldQuantity
    );

    transaction.update(checkoutRef, {
      status: "released",
      updatedAt: serverTimestamp(),
    });
    transaction.update(productRef, {
      reservedQuantity: nextReservedQuantity,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  });
}
