import { createHmac, timingSafeEqual } from "node:crypto";

import { loadLocalEnv } from "./_env.js";

function sendJson(res: any, statusCode: number, body: unknown) {
  res.status(statusCode).json(body);
}

function getRequestBody(req: any) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body && typeof req.body === "object" ? req.body : null;
}

function getString(payload: Record<string, unknown>, field: string) {
  const value = payload[field];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keySecret) {
    sendJson(res, 500, { success: false, error: "Razorpay is not configured." });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;

  if (!body) {
    sendJson(res, 400, { success: false, error: "Payment verification payload is required." });
    return;
  }

  const razorpayOrderId = getString(body, "razorpay_order_id");
  const razorpayPaymentId = getString(body, "razorpay_payment_id");
  const razorpaySignature = getString(body, "razorpay_signature");

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    sendJson(res, 400, { success: false, error: "Payment verification fields are required." });
    return;
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, razorpaySignature)) {
    sendJson(res, 400, { success: false, error: "Payment verification failed." });
    return;
  }

  sendJson(res, 200, {
    success: true,
    razorpayOrderId,
    razorpayPaymentId,
  });
}
