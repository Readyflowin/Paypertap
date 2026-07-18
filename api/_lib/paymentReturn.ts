import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import { getAdminDbIfConfigured, getFirebaseAdminEnvDebugState } from "./firebaseAdmin.js";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type PaymentReturnBody = {
  orderToken?: unknown;
  token?: unknown;
};

type PaymentReturnStoreResult = {
  storeId: string;
  storeSlug: string;
  storeName: string;
};

class PaymentReturnError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, statusCode = 400, code = "payment_return_error") {
    super(message);
    this.name = "PaymentReturnError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function paymentReturnLog(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown> = {}
) {
  const payload = {
    event,
    component: "payment-return",
    ...details,
  };

  if (level === "error") console.error(event, payload);
  else if (level === "warn") console.warn(event, payload);
  else console.info(event, payload);
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

export async function resolvePaymentReturnStore({
  token,
}: {
  token: string;
}): Promise<PaymentReturnStoreResult> {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new PaymentReturnError(
      "Payment return is temporarily unavailable.",
      500,
      "firebase_admin_unavailable"
    );
  }

  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 32) {
    throw new PaymentReturnError("Invalid payment return link.", 400, "invalid_seller_return_token");
  }

  paymentReturnLog("info", "Payment return store lookup starting.", {
    sellerReturnTokenLength: cleanToken.length,
  });

  const storesSnap = await db
    .collection("stores")
    .where("paymentReturnToken", "==", cleanToken)
    .limit(2)
    .get();

  if (storesSnap.empty || storesSnap.size !== 1) {
    paymentReturnLog("warn", "Payment return store lookup failed.", {
      matchCount: storesSnap.size,
    });
    throw new PaymentReturnError("Store not found.", 404, "seller_return_token_not_found");
  }

  const storeDoc = storesSnap.docs[0];
  const store = storeDoc.data() || {};
  const storeSlug = String(store.storeSlug || storeDoc.id).trim() || storeDoc.id;
  const storeName = String(store.storeName || store.name || "").trim();

  paymentReturnLog("info", "Payment return store lookup completed.", {
    storeId: storeDoc.id,
    storeSlug,
  });

  return {
    storeId: storeDoc.id,
    storeSlug,
    storeName,
  };
}

export async function handlePaymentReturn({
  orderToken,
  token,
}: {
  orderToken: string;
  token: string;
}) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new PaymentReturnError(
      "Payment return is temporarily unavailable.",
      500,
      "firebase_admin_unavailable"
    );
  }

  const cleanToken = token.trim();
  const cleanOrderToken = orderToken.trim();

  if (
    !cleanToken ||
    cleanToken.length < 32 ||
    !cleanOrderToken ||
    cleanOrderToken.length < 32
  ) {
    throw new PaymentReturnError("Invalid payment return link.", 400, "invalid_return_tokens");
  }

  paymentReturnLog("info", "Payment return lookup starting.", {
    sellerReturnTokenLength: cleanToken.length,
    orderTokenLength: cleanOrderToken.length,
  });

  const ordersSnap = await db
    .collection("orders")
    .where("paymentTrackingToken", "==", cleanOrderToken)
    .limit(2)
    .get();

  if (ordersSnap.empty || ordersSnap.size !== 1) {
    paymentReturnLog("warn", "Payment return lookup failed: order token did not match exactly one order.", {
      matchCount: ordersSnap.size,
    });
    throw new PaymentReturnError("Order not found.", 404, "order_token_not_found");
  }

  const orderDoc = ordersSnap.docs[0];
  const orderRef = orderDoc.ref;
  const orderBeforeTransaction = orderDoc.data() || {};
  const orderStoreId = String(orderBeforeTransaction.storeId || "").trim();

  if (!orderStoreId) {
    throw new PaymentReturnError("Order not found.", 404, "order_store_missing");
  }

  const storeRef = db.collection("stores").doc(orderStoreId);
  let responseOrder: Record<string, unknown> | null = null;
  let responseStoreId = "";
  let responseStoreSlug = "";

  await db.runTransaction(async (transaction) => {
    const [orderSnap, storeSnap] = await Promise.all([
      transaction.get(orderRef),
      transaction.get(storeRef),
    ]);

    if (!orderSnap.exists) {
      throw new PaymentReturnError("Order not found.", 404, "order_not_found");
    }

    if (!storeSnap.exists) {
      throw new PaymentReturnError("Invalid payment return link.", 404, "store_not_found");
    }

    const order = orderSnap.data() || {};
    const store = storeSnap.data() || {};

    if (
      order.storeId !== storeSnap.id ||
      order.sellerId !== store.sellerId ||
      order.paymentMode !== "partial_advance" ||
      order.paymentTrackingToken !== cleanOrderToken ||
      store.paymentReturnToken !== cleanToken
    ) {
      paymentReturnLog("warn", "Payment return validation failed.", {
        orderId: orderSnap.id,
        storeId: storeSnap.id,
        orderPaymentMode: order.paymentMode,
      });
      throw new PaymentReturnError("Order not found.", 404, "payment_return_validation_failed");
    }

    responseStoreId = storeSnap.id;
    responseStoreSlug = String(store.storeSlug || storeSnap.id);

    if (order.status === "awaiting_payment") {
      paymentReturnLog("info", "Payment return marking order as returned.", {
        orderId: orderSnap.id,
        storeId: storeSnap.id,
      });
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

    paymentReturnLog("info", "Payment return already processed or order moved forward.", {
      orderId: orderSnap.id,
      status: order.status,
    });
    responseOrder = getSafeOrder(order, orderSnap.id);
  });

  if (!responseOrder) {
    throw new PaymentReturnError("Order not found.", 404, "payment_return_no_response_order");
  }

  return {
    order: responseOrder,
    orderId: orderDoc.id,
    storeId: responseStoreId,
    storeSlug: responseStoreSlug,
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
    const orderToken = toText(body?.orderToken);
    paymentReturnLog("info", "Payment return request received.", {
      hasSellerToken: Boolean(token),
      hasOrderToken: Boolean(orderToken),
    });

    if (!orderToken) {
      const result = await resolvePaymentReturnStore({ token });

      sendJson(res, 200, {
        success: true,
        fallback: true,
        reason: "missing_order_token",
        ...result,
      });
      return;
    }

    const result = await handlePaymentReturn({ orderToken, token });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const paymentReturnError =
      error instanceof PaymentReturnError
        ? error
        : new PaymentReturnError(
            "Payment return could not be processed.",
            500,
            "unhandled_payment_return_exception"
          );

    paymentReturnLog("warn", "Payment return failed.", {
      error: error instanceof Error ? error.message : "Unknown payment return error",
      code: paymentReturnError.code,
    });
    sendJson(res, paymentReturnError.statusCode, {
      success: false,
      error: paymentReturnError.message,
      code: paymentReturnError.code,
    });
  }
}
