import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminAuthIfConfigured,
  getAdminDbIfConfigured,
} from "./firebaseAdmin.js";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type OrderAction =
  | "verify-payment"
  | "confirm-payment"
  | "accept"
  | "complete"
  | "cancel"
  | "update-notes";

type OrderData = {
  sellerId?: string;
  storeId?: string;
  productId?: string;
  reservedProductId?: string;
  productPrice?: number;
  walletCharge?: number;
  walletTransactionId?: string;
  walletType?: string;
  walletBalanceAfter?: number;
  freeOrdersRemainingAfter?: number;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPincode?: string;
  paymentMode?: string;
  status?: string;
  reservationApplied?: boolean;
  reservedQuantity?: number;
};

type ProductData = {
  sellerId?: string;
  storeId?: string;
  productId?: string;
  inventoryQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  status?: string;
};

class OrderActionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OrderActionError";
    this.statusCode = statusCode;
  }
}

function sendJson(res: JsonResponse, statusCode: number, body: unknown) {
  res.setHeader?.("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getRequestBody(req: { body?: unknown }) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body && typeof req.body === "object" ? req.body : null;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toCount(value: unknown) {
  const count = Number(value || 0);
  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
}

function getBearerToken(req: { headers?: Record<string, unknown> }) {
  const header = toText(req.headers?.authorization || req.headers?.Authorization);
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || "";
}

async function getAuthenticatedSellerId(req: { headers?: Record<string, unknown> }) {
  const auth = getAdminAuthIfConfigured();

  if (!auth) {
    throw new OrderActionError("Order updates are temporarily unavailable.", 500);
  }

  const token = getBearerToken(req);

  if (!token) {
    throw new OrderActionError("Please sign in before updating orders.", 401);
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new OrderActionError("Please sign in before updating orders.", 401);
  }
}

function deriveProductStatus(product: ProductData) {
  const inventoryQuantity = toCount(product.inventoryQuantity);
  const reservedQuantity = toCount(product.reservedQuantity);
  const soldQuantity = toCount(product.soldQuantity);
  const availableQuantity = Math.max(
    0,
    inventoryQuantity - reservedQuantity - soldQuantity
  );

  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

function canReleaseReservation(order: OrderData) {
  return (
    order.reservationApplied === true &&
    !["cancelled", "released", "completed"].includes(String(order.status || ""))
  );
}

function assertOrderOwner(order: OrderData, sellerId: string) {
  if (order.sellerId !== sellerId) {
    throw new OrderActionError("Order not found.", 404);
  }
}

function assertOrderProductMatch(order: OrderData, product: ProductData, productId: string) {
  if (
    product.sellerId !== order.sellerId ||
    product.storeId !== order.storeId ||
    (product.productId || productId) !== order.productId
  ) {
    throw new OrderActionError("Order and product no longer match.");
  }
}

function assertImmutableOrderFields(order: OrderData) {
  const requiredFields = [
    order.sellerId,
    order.storeId,
    order.productId,
    order.buyerName,
    order.buyerPhone,
    order.buyerAddress,
    order.buyerCity,
    order.buyerPincode,
  ];

  if (requiredFields.some((field) => !field)) {
    throw new OrderActionError("Order is missing required data.");
  }
}

async function updatePaymentVerified(db: Firestore, orderId: string, sellerId: string) {
  const orderRef = db.collection("orders").doc(orderId);
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);
    assertImmutableOrderFields(order);

    const orderStatus = String(order.status || "");
    const isManualPartialAdvanceVerification =
      ["awaiting_payment", "pending_payment"].includes(orderStatus) &&
      order.paymentMode === "partial_advance";

    if (orderStatus !== "payment_returned" && !isManualPartialAdvanceVerification) {
      throw new OrderActionError("Payment cannot be verified for this order state.");
    }

    transaction.update(orderRef, {
      status: "pending_confirmation",
      sellerPaymentConfirmedAt: now,
      sellerConfirmationAt: now,
      updatedAt: now,
    });
  });
}

async function confirmPayment(db: Firestore, orderId: string, sellerId: string) {
  const orderRef = db.collection("orders").doc(orderId);
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);
    assertImmutableOrderFields(order);

    transaction.update(orderRef, {
      status: "confirmed",
      sellerPaymentConfirmedAt: now,
      sellerConfirmationAt: now,
      updatedAt: now,
    });
  });
}

async function acceptOrder(db: Firestore, orderId: string, sellerId: string) {
  const orderRef = db.collection("orders").doc(orderId);
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);
    assertImmutableOrderFields(order);

    if (!["pending_confirmation", "confirmed"].includes(String(order.status || ""))) {
      throw new OrderActionError("Order cannot be accepted from this state.");
    }

    transaction.update(orderRef, {
      status: "processing",
      sellerAcceptedAt: now,
      processingAt: now,
      updatedAt: now,
    });
  });
}

async function updateNotes(
  db: Firestore,
  orderId: string,
  sellerId: string,
  sellerNotes: string
) {
  const orderRef = db.collection("orders").doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);

    transaction.update(orderRef, {
      sellerNotes: sellerNotes.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

async function completeOrder(db: Firestore, orderId: string, sellerId: string) {
  const orderRef = db.collection("orders").doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);
    assertImmutableOrderFields(order);

    if (order.status === "completed") return;
    if (order.status !== "processing") {
      throw new OrderActionError("Order cannot be completed from this state.");
    }

    const now = FieldValue.serverTimestamp();

    if (!canReleaseReservation(order)) {
      transaction.update(orderRef, {
        status: "completed",
        completedAt: now,
        updatedAt: now,
      });
      return;
    }

    const productId = toText(order.reservedProductId) || toText(order.productId);
    const productRef = db.collection("products").doc(productId);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists) {
      throw new OrderActionError("Reserved product not found.");
    }

    const product = productSnap.data() as ProductData;
    assertOrderProductMatch(order, product, productSnap.id);

    const reservedQuantity = toCount(product.reservedQuantity);
    const soldQuantity = toCount(product.soldQuantity);
    const transitionQuantity = Math.min(reservedQuantity, Math.max(1, toCount(order.reservedQuantity || 1)));

    if (transitionQuantity <= 0) {
      throw new OrderActionError("This order has no reserved stock to complete.");
    }

    const nextProduct = {
      ...product,
      reservedQuantity: Math.max(0, reservedQuantity - transitionQuantity),
      soldQuantity: soldQuantity + transitionQuantity,
    };

    transaction.update(productRef, {
      reservedQuantity: nextProduct.reservedQuantity,
      soldQuantity: nextProduct.soldQuantity,
      status: deriveProductStatus(nextProduct),
      updatedAt: now,
    });
    transaction.update(orderRef, {
      status: "completed",
      reservationApplied: false,
      reservationSold: true,
      completedAt: now,
      updatedAt: now,
    });
  });
}

async function cancelOrder(db: Firestore, orderId: string, sellerId: string) {
  const orderRef = db.collection("orders").doc(orderId);

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) throw new OrderActionError("Order not found.", 404);

    const order = orderSnap.data() as OrderData;
    assertOrderOwner(order, sellerId);
    assertImmutableOrderFields(order);

    if (order.status === "cancelled" || order.status === "released") return;

    if (
      ![
        "awaiting_payment",
        "pending_payment",
        "payment_returned",
        "pending_confirmation",
        "confirmed",
        "processing",
      ].includes(String(order.status || ""))
    ) {
      throw new OrderActionError("Order cannot be cancelled from this state.");
    }

    const now = FieldValue.serverTimestamp();

    if (!canReleaseReservation(order)) {
      transaction.update(orderRef, {
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      });
      return;
    }

    const productId = toText(order.reservedProductId) || toText(order.productId);
    const productRef = db.collection("products").doc(productId);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists) {
      throw new OrderActionError("Reserved product not found.");
    }

    const product = productSnap.data() as ProductData;
    assertOrderProductMatch(order, product, productSnap.id);

    const reservedQuantity = toCount(product.reservedQuantity);
    const releaseQuantity = Math.min(reservedQuantity, Math.max(1, toCount(order.reservedQuantity || 1)));
    const nextProduct = {
      ...product,
      reservedQuantity: Math.max(0, reservedQuantity - releaseQuantity),
    };

    if (releaseQuantity > 0) {
      transaction.update(productRef, {
        reservedQuantity: nextProduct.reservedQuantity,
        status: deriveProductStatus(nextProduct),
        updatedAt: now,
      });
    }

    transaction.update(orderRef, {
      status: "cancelled",
      reservationApplied: false,
      reservationReleased: true,
      cancelledAt: now,
      releasedAt: now,
      updatedAt: now,
    });
  });
}

export async function orderActionHandler(req: any, res: JsonResponse) {
  loadLocalEnv();

  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  try {
    const sellerId = await getAuthenticatedSellerId(req);
    const db = getAdminDbIfConfigured();

    if (!db) {
      throw new OrderActionError("Order updates are temporarily unavailable.", 500);
    }

    const body = getRequestBody(req) as Record<string, unknown> | null;
    const orderId = toText(body?.orderId);
    const action = toText(body?.action) as OrderAction;

    if (!orderId) {
      throw new OrderActionError("orderId is required.");
    }

    if (action === "verify-payment") {
      await updatePaymentVerified(db, orderId, sellerId);
    } else if (action === "confirm-payment") {
      await confirmPayment(db, orderId, sellerId);
    } else if (action === "accept") {
      await acceptOrder(db, orderId, sellerId);
    } else if (action === "complete") {
      await completeOrder(db, orderId, sellerId);
    } else if (action === "cancel") {
      await cancelOrder(db, orderId, sellerId);
    } else if (action === "update-notes") {
      await updateNotes(db, orderId, sellerId, toText(body?.sellerNotes));
    } else {
      throw new OrderActionError("Unsupported order action.");
    }

    sendJson(res, 200, { success: true });
  } catch (error) {
    const actionError =
      error instanceof OrderActionError
        ? error
        : new OrderActionError("Could not update order.", 500);

    console.warn("Order action failed.", {
      error: error instanceof Error ? error.message : "Unknown order action error",
    });
    sendJson(res, actionError.statusCode, {
      success: false,
      error: actionError.message,
    });
  }
}
