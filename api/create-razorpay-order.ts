import Razorpay from "razorpay";

import { loadLocalEnv } from "./_env.js";

const BOOKING_AMOUNT_PAISE = 2000;
const CURRENCY = "INR";

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

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function safeNoteValue(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function buildReceipt() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `ppt_${time}_${random}`.slice(0, 40);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    sendJson(res, 500, { success: false, error: "Razorpay is not configured." });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;
  const notes = {
    sellerId: safeNoteValue(body?.sellerId),
    storeId: safeNoteValue(body?.storeId),
    productId: safeNoteValue(body?.productId),
  };

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: buildReceipt(),
      notes,
    });

    sendJson(res, 200, {
      success: true,
      keyId,
      orderId: order.id,
      amount: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    sendJson(res, 500, { success: false, error: "Could not create payment order." });
  }
}
