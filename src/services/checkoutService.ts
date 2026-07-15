import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { CheckoutSession, CheckoutSessionStatus } from "../types/firestore";
import {
  createChargeableOrder,
  type CreateChargeableOrderResult,
} from "./walletService";

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
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  status?: CheckoutSessionStatus;
};

export type CreateOrderResult = {
  orderId: CreateChargeableOrderResult["orderId"];
  order: CreateChargeableOrderResult["order"];
  paymentMode: CreateChargeableOrderResult["paymentMode"];
  paymentLink: CreateChargeableOrderResult["paymentLink"];
  paymentReturnUrl: CreateChargeableOrderResult["paymentReturnUrl"];
};

export async function createCheckoutSessionWithReservation(
  input: CreateCheckoutSessionInput
): Promise<string> {
  const result = await createOrderWithReservation(input);

  return result.orderId;
}

export async function createOrderWithReservation(
  input: CreateCheckoutSessionInput
): Promise<CreateOrderResult> {
  return createChargeableOrder(input);
}

export async function repairMissingOrderReservation(
  order: CheckoutSession
): Promise<boolean> {
  void order;
  return false;
}

export async function getOrderById(
  orderId: string
): Promise<CheckoutSession | null> {
  const orderSnap = await getDoc(doc(db, "orders", orderId));

  if (orderSnap.exists()) {
    return {
      ...(orderSnap.data() as CheckoutSession),
      checkoutId: String(orderSnap.data().checkoutId || orderSnap.id),
      orderId: String(orderSnap.data().orderId || orderSnap.id),
    };
  }

  return null;
}

export async function markOrderEmailEventSent(
  orderId: string,
  field: "sellerOrderSentAt" | "buyerOrderSentAt"
): Promise<void> {
  void orderId;
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

export async function getOrdersBySellerId(
  sellerId: string,
  storeId?: string
): Promise<CheckoutSession[]> {
  const sessionsRef = collection(db, "orders");
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

export async function getOrdersByStoreId(
  storeId: string,
  sellerId?: string
): Promise<CheckoutSession[]> {
  const sessionsRef = collection(db, "orders");
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

type OrderAction =
  | "verify-payment"
  | "confirm-payment"
  | "accept"
  | "complete"
  | "cancel"
  | "update-notes";

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Please sign in before updating orders.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function postOrderAction(
  action: OrderAction,
  orderId: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  const response = await fetch("/api/order-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({
      action,
      orderId,
      ...payload,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
  };

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Could not update order.");
  }
}

export async function markOrderConfirmed(orderId: string): Promise<void> {
  await postOrderAction("confirm-payment", orderId);
}

export async function markOrderPaymentVerified(orderId: string): Promise<void> {
  await postOrderAction("verify-payment", orderId);
}

export async function acceptOrder(orderId: string): Promise<void> {
  await postOrderAction("accept", orderId);
}

export async function updateOrderNotes(
  orderId: string,
  sellerNotes: string
): Promise<void> {
  await postOrderAction("update-notes", orderId, { sellerNotes });
}

export async function cancelOrder(orderId: string): Promise<void> {
  await postOrderAction("cancel", orderId);
}

export async function completeOrder(orderId: string): Promise<void> {
  await postOrderAction("complete", orderId);
}

export async function markOrderCancelled(orderId: string): Promise<void> {
  await postOrderAction("cancel", orderId);
}
