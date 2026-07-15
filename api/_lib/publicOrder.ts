import { loadLocalEnv } from "../_env.js";
import { getAdminDbIfConfigured } from "./firebaseAdmin.js";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

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

function getPublicOrderPayload(order: Record<string, unknown>, orderId: string) {
  return {
    checkoutId: String(order.checkoutId || orderId),
    orderId: String(order.orderId || orderId),
    sellerId: toText(order.sellerId),
    storeId: toText(order.storeId),
    productId: toText(order.productId),
    productTitle: toText(order.productTitle),
    productPrice: Number(order.productPrice || 0),
    advanceAmount: Number(order.advanceAmount || 0),
    paymentAmount: Number(order.paymentAmount || 0),
    sellerAmountDue: Number(order.sellerAmountDue || 0),
    paymentMode: order.paymentMode === "partial_advance" ? "partial_advance" : "cod",
    paymentProvider: order.paymentProvider === "razorpay" ? "razorpay" : undefined,
    paymentReturnedAt: order.paymentReturnedAt,
    paymentReturnDetected: order.paymentReturnDetected === true,
    paymentReturnMethod:
      order.paymentReturnMethod === "razorpay_redirect" ? "razorpay_redirect" : undefined,
    sellerPaymentConfirmedAt: order.sellerPaymentConfirmedAt,
    sellerConfirmationAt: order.sellerConfirmationAt,
    sellerAcceptedAt: order.sellerAcceptedAt,
    processingAt: order.processingAt,
    completedAt: order.completedAt,
    buyerName: toText(order.buyerName),
    buyerEmail: toText(order.buyerEmail) || undefined,
    buyerPhone: toText(order.buyerPhone),
    sellerPhone: toText(order.sellerPhone) || undefined,
    sellerWhatsAppPhone: toText(order.sellerWhatsAppPhone) || undefined,
    sellerWhatsAppE164: toText(order.sellerWhatsAppE164) || undefined,
    buyerAddress: toText(order.buyerAddress),
    buyerCity: toText(order.buyerCity),
    buyerPincode: toText(order.buyerPincode),
    status: toText(order.status),
    whatsappOpened: order.whatsappOpened === true,
    selectedVariantId: toText(order.selectedVariantId) || undefined,
    selectedVariantLabel: toText(order.selectedVariantLabel) || undefined,
    selectedVariantOptions:
      order.selectedVariantOptions &&
      typeof order.selectedVariantOptions === "object" &&
      !Array.isArray(order.selectedVariantOptions)
        ? order.selectedVariantOptions
        : undefined,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export default async function handler(req: any, res: JsonResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader?.("Allow", "GET, POST");
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const db = getAdminDbIfConfigured();

  if (!db) {
    sendJson(res, 500, {
      success: false,
      error: "Order lookup is temporarily unavailable.",
    });
    return;
  }

  const url = new URL(req.url || "/", "https://paypertap.local");
  const body = getRequestBody(req) as Record<string, unknown> | null;
  const orderId = toText(url.searchParams.get("orderId")) || toText(body?.orderId);

  if (!orderId || !/^[A-Za-z0-9_-]{8,160}$/.test(orderId)) {
    sendJson(res, 400, { success: false, error: "Invalid order link." });
    return;
  }

  try {
    const orderSnap = await db.collection("orders").doc(orderId).get();

    if (!orderSnap.exists) {
      sendJson(res, 404, { success: false, error: "Order not found." });
      return;
    }

    sendJson(res, 200, {
      success: true,
      order: getPublicOrderPayload(orderSnap.data() || {}, orderSnap.id),
    });
  } catch (error) {
    console.warn("Public order lookup failed.", {
      orderId,
      error: error instanceof Error ? error.message : "Unknown order lookup error",
    });
    sendJson(res, 500, {
      success: false,
      error: "Order lookup failed.",
    });
  }
}
