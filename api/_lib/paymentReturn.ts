import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import { getAdminDbIfConfigured, getFirebaseAdminEnvDebugState } from "./firebaseAdmin.js";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type PaymentReturnBody = {
  pendingOrderId?: unknown;
  token?: unknown;
};

class PaymentReturnError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "PaymentReturnError";
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

function getSafeOrder(orderData: Record<string, unknown>, orderId: string) {
  return {
    ...orderData,
    checkoutId: String(orderData.checkoutId || orderId),
    orderId: String(orderData.orderId || orderId),
    paymentReturnDetected: orderData.paymentReturnDetected === true,
  };
}

export async function handlePaymentReturn({
  pendingOrderId,
  token,
}: {
  pendingOrderId: string;
  token: string;
}) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new PaymentReturnError("Payment return is temporarily unavailable.", 500);
  }

  const cleanToken = token.trim();
  const cleanOrderId = pendingOrderId.trim();

  if (!cleanToken || cleanToken.length < 32 || !cleanOrderId) {
    throw new PaymentReturnError("Invalid payment return link.");
  }

  const storesSnap = await db
    .collection("stores")
    .where("paymentReturnToken", "==", cleanToken)
    .limit(1)
    .get();

  if (storesSnap.empty) {
    throw new PaymentReturnError("Invalid payment return link.");
  }

  const storeDoc = storesSnap.docs[0];
  const store = storeDoc.data();
  const orderRef = db.collection("orders").doc(cleanOrderId);
  let responseOrder: Record<string, unknown> | null = null;

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) {
      throw new PaymentReturnError("Order not found.");
    }

    const order = orderSnap.data() || {};

    if (
      order.storeId !== storeDoc.id ||
      order.sellerId !== store.sellerId ||
      order.paymentMode !== "partial_advance"
    ) {
      throw new PaymentReturnError("Order not found.");
    }

    if (order.status === "awaiting_payment") {
      transaction.update(orderRef, {
        status: "payment_returned",
        paymentReturnedAt: FieldValue.serverTimestamp(),
        paymentReturnDetected: true,
        paymentReturnMethod: "razorpay_redirect",
        updatedAt: FieldValue.serverTimestamp(),
      });
      responseOrder = getSafeOrder(
        {
          ...order,
          status: "payment_returned",
          paymentReturnDetected: true,
          paymentReturnMethod: "razorpay_redirect",
          paymentReturnedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        orderSnap.id
      );
      return;
    }

    responseOrder = getSafeOrder(order, orderSnap.id);
  });

  if (!responseOrder) {
    throw new PaymentReturnError("Order not found.");
  }

  return {
    order: responseOrder,
    orderId: cleanOrderId,
    storeId: storeDoc.id,
    storeSlug: String(store.storeSlug || storeDoc.id),
  };
}

export async function paymentReturnHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as PaymentReturnBody | null;

  try {
    const token = toText(body?.token);
    const pendingOrderId = toText(body?.pendingOrderId);
    const result = await handlePaymentReturn({ pendingOrderId, token });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const paymentReturnError =
      error instanceof PaymentReturnError
        ? error
        : new PaymentReturnError("Payment return could not be processed.");

    console.warn("Payment return failed.", {
      error: error instanceof Error ? error.message : "Unknown payment return error",
    });
    sendJson(res, paymentReturnError.statusCode, {
      success: false,
      error: paymentReturnError.message,
    });
  }
}
