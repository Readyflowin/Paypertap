import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminDbIfConfigured,
  getFirebaseAdminEnvDebugState,
} from "./firebaseAdmin.js";

const BOOKING_AMOUNT_RUPEES = 20;
const BOOKING_AMOUNT_PAISE = 2000;
const CURRENCY = "INR";

type JsonResponse = {
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type BookingInput = {
  sellerId: string;
  storeId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  buyerEmail?: string;
};

type ProductData = {
  sellerId?: string;
  storeId?: string;
  title?: string;
  price?: number;
  bookingAdvanceAmount?: number;
  sellerCollectAmount?: number;
  status?: string;
  inventoryQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
};

type StoreData = {
  sellerId?: string;
  isPublished?: boolean;
};

function sendJson(res: JsonResponse, statusCode: number, body: unknown) {
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

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function getPublicKeyId() {
  return getRequiredEnv("VITE_RAZORPAY_KEY_ID") || getRequiredEnv("RAZORPAY_KEY_ID");
}

function getRazorpayClient() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    return { client: null, keyId, keySecret };
  }

  return {
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
    keyId,
    keySecret,
  };
}

function logSafeServerEnvDebug(route: "create-order" | "verify-payment") {
  console.info(`PayPerTap payment env debug: ${route}`, {
    ...getFirebaseAdminEnvDebugState(),
    hasRazorpayKeyId: Boolean(getRequiredEnv("RAZORPAY_KEY_ID")),
    hasRazorpayKeySecret: Boolean(getRequiredEnv("RAZORPAY_KEY_SECRET")),
    paymentMode: process.env.VITE_PAYMENT_MODE === "razorpay" ? "razorpay" : "mock",
  });
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value: unknown) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : NaN;
}

function normalizeBuyerPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function getSellerCollectAmount(productPrice: number) {
  return Math.max(productPrice - BOOKING_AMOUNT_RUPEES, 0);
}

function getAvailableQuantity(product: ProductData) {
  return Math.max(
    0,
    Number(product.inventoryQuantity || 0) -
      Number(product.reservedQuantity || 0) -
      Number(product.soldQuantity || 0)
  );
}

function getNextProductStatus(product: ProductData) {
  const inventoryQuantity = Number(product.inventoryQuantity || 0);
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);
  const availableQuantity = getAvailableQuantity(product);

  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

function getBookingInput(payload: Record<string, unknown>): BookingInput {
  const productPrice = toInt(payload.productPrice);
  const bookingAdvanceAmount = toInt(payload.bookingAdvanceAmount);
  const sellerCollectAmount = toInt(payload.sellerCollectAmount);

  return {
    sellerId: toText(payload.sellerId),
    storeId: toText(payload.storeId),
    productId: toText(payload.productId),
    productTitle: toText(payload.productTitle),
    productPrice,
    bookingAdvanceAmount,
    sellerCollectAmount,
    buyerName: toText(payload.buyerName),
    buyerPhone: normalizeBuyerPhone(toText(payload.buyerPhone)),
    buyerAddress: toText(payload.buyerAddress),
    buyerCity: toText(payload.buyerCity),
    buyerPincode: toText(payload.buyerPincode),
    buyerEmail: toText(payload.buyerEmail),
  };
}

function validateBuyerInput(input: BookingInput) {
  if (
    !input.sellerId ||
    !input.storeId ||
    !input.productId ||
    !input.productTitle ||
    !input.buyerName ||
    !input.buyerPhone ||
    !input.buyerAddress ||
    !input.buyerCity ||
    !input.buyerPincode
  ) {
    throw new Error("Buyer and product details are required.");
  }

  if (!/^[6-9]\d{9}$/.test(input.buyerPhone)) {
    throw new Error("A valid WhatsApp mobile number is required.");
  }

  if (!/^\d{6}$/.test(input.buyerPincode)) {
    throw new Error("A valid pincode is required.");
  }

  if (input.buyerAddress.length < 12 || input.buyerAddress.length > 160) {
    throw new Error("A valid delivery address is required.");
  }

  if (
    input.bookingAdvanceAmount !== BOOKING_AMOUNT_RUPEES ||
    input.sellerCollectAmount !== getSellerCollectAmount(input.productPrice)
  ) {
    throw new Error("Booking amount mismatch.");
  }
}

async function validateStoreAndProduct(input: BookingInput) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new Error("Secure Firestore finalization requires Firebase Admin credentials.");
  }

  const [storeSnap, productSnap] = await Promise.all([
    db.collection("stores").doc(input.storeId).get(),
    db.collection("products").doc(input.productId).get(),
  ]);

  if (!storeSnap.exists || !productSnap.exists) {
    throw new Error("This item is no longer available.");
  }

  const store = storeSnap.data() as StoreData;
  const product = productSnap.data() as ProductData;

  if (!store.isPublished) {
    throw new Error("This store is not accepting bookings right now.");
  }

  if (
    store.sellerId !== input.sellerId ||
    product.sellerId !== input.sellerId ||
    product.storeId !== input.storeId ||
    product.title !== input.productTitle ||
    Number(product.price) !== input.productPrice ||
    Number(product.bookingAdvanceAmount || BOOKING_AMOUNT_RUPEES) !== BOOKING_AMOUNT_RUPEES ||
    Number(product.sellerCollectAmount || getSellerCollectAmount(input.productPrice)) !==
      input.sellerCollectAmount
  ) {
    throw new Error("Product details changed. Please refresh and try again.");
  }

  if (product.status !== "open" || getAvailableQuantity(product) <= 0) {
    throw new Error("This item was just reserved. Please choose another product.");
  }

  return { db, product };
}

function buildReceipt() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `ppt_${time}_${random}`.slice(0, 40);
}

function safeNoteValue(value: string) {
  return value.slice(0, 120);
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function finalizeVerifiedBooking(input: BookingInput, payment: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { db } = await validateStoreAndProduct(input);
  const checkoutRef = db.collection("checkoutSessions").doc();
  const productRef = db.collection("products").doc(input.productId);
  const paymentRef = db.collection("payments").doc(payment.razorpayPaymentId);
  const checkoutId = checkoutRef.id;

  await db.runTransaction(async (transaction) => {
    const [productSnap, paymentSnap] = await Promise.all([
      transaction.get(productRef),
      transaction.get(paymentRef),
    ]);

    if (paymentSnap.exists) {
      throw new Error("This payment has already been used for a booking.");
    }

    if (!productSnap.exists) {
      throw new Error("This item is no longer available.");
    }

    const product = productSnap.data() as ProductData;

    if (
      product.sellerId !== input.sellerId ||
      product.storeId !== input.storeId ||
      product.title !== input.productTitle ||
      Number(product.price) !== input.productPrice
    ) {
      throw new Error("Product details changed. Please refresh and try again.");
    }

    if (product.status !== "open" || getAvailableQuantity(product) <= 0) {
      throw new Error("This item was just reserved. Please choose another product.");
    }

    const nextReservedQuantity = Number(product.reservedQuantity || 0) + 1;
    const nextProduct = {
      ...product,
      reservedQuantity: nextReservedQuantity,
    };
    const now = FieldValue.serverTimestamp();

    transaction.set(checkoutRef, {
      checkoutId,
      sellerId: input.sellerId,
      storeId: input.storeId,
      productId: input.productId,
      productTitle: input.productTitle,
      productPrice: input.productPrice,
      bookingAdvanceAmount: BOOKING_AMOUNT_RUPEES,
      sellerCollectAmount: input.sellerCollectAmount,
      buyerName: input.buyerName,
      ...(input.buyerEmail ? { buyerEmail: input.buyerEmail } : {}),
      buyerPhone: input.buyerPhone,
      buyerAddress: input.buyerAddress,
      buyerCity: input.buyerCity,
      buyerPincode: input.buyerPincode,
      status: "booking_paid",
      whatsappOpened: false,
      reservationApplied: true,
      reservedProductId: input.productId,
      reservedQuantity: 1,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(paymentRef, {
      paymentId: payment.razorpayPaymentId,
      provider: "razorpay",
      sellerId: input.sellerId,
      storeId: input.storeId,
      productId: input.productId,
      checkoutId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: BOOKING_AMOUNT_RUPEES,
      amountPaise: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
      status: "verified",
      createdAt: now,
      updatedAt: now,
    });

    transaction.update(productRef, {
      reservedQuantity: nextReservedQuantity,
      status: getNextProductStatus(nextProduct),
      updatedAt: now,
    });
  });

  const responseSession = {
    checkoutId,
    sellerId: input.sellerId,
    storeId: input.storeId,
    productId: input.productId,
    productTitle: input.productTitle,
    productPrice: input.productPrice,
    bookingAdvanceAmount: BOOKING_AMOUNT_RUPEES,
    sellerCollectAmount: input.sellerCollectAmount,
    buyerName: input.buyerName,
    ...(input.buyerEmail ? { buyerEmail: input.buyerEmail } : {}),
    buyerPhone: input.buyerPhone,
    buyerAddress: input.buyerAddress,
    buyerCity: input.buyerCity,
    buyerPincode: input.buyerPincode,
    status: "booking_paid",
    whatsappOpened: false,
    reservationApplied: true,
    reservedProductId: input.productId,
    reservedQuantity: 1,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { checkoutId, checkoutSession: responseSession };
}

export async function createRazorpayOrderHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();
  logSafeServerEnvDebug("create-order");

  const { client } = getRazorpayClient();
  const publicKeyId = getPublicKeyId();

  if (!client || !publicKeyId) {
    sendJson(res, 500, { success: false, error: "Razorpay is not configured." });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;

  if (!body) {
    sendJson(res, 400, { success: false, error: "Booking details are required." });
    return;
  }

  try {
    const input = getBookingInput(body);
    validateBuyerInput(input);
    await validateStoreAndProduct(input);

    const order = await client.orders.create({
      amount: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: buildReceipt(),
      notes: {
        sellerId: safeNoteValue(input.sellerId),
        storeId: safeNoteValue(input.storeId),
        productId: safeNoteValue(input.productId),
        bookingAmount: String(BOOKING_AMOUNT_RUPEES),
      },
    });

    sendJson(res, 200, {
      success: true,
      keyId: publicKeyId,
      orderId: order.id,
      amount: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create payment order.";
    sendJson(res, 400, { success: false, error: message });
  }
}

export async function verifyRazorpayPaymentHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();
  logSafeServerEnvDebug("verify-payment");

  const { client, keySecret } = getRazorpayClient();

  if (!client || !keySecret) {
    sendJson(res, 500, { success: false, error: "Razorpay is not configured." });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;

  if (!body) {
    sendJson(res, 400, { success: false, error: "Payment verification payload is required." });
    return;
  }

  const razorpayOrderId = toText(body.razorpay_order_id);
  const razorpayPaymentId = toText(body.razorpay_payment_id);
  const razorpaySignature = toText(body.razorpay_signature);

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    sendJson(res, 400, { success: false, error: "Payment verification fields are required." });
    return;
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, razorpaySignature)) {
    sendJson(res, 400, {
      success: false,
      error: "Payment could not be verified. No booking was created.",
    });
    return;
  }

  try {
    const input = getBookingInput((body.booking || {}) as Record<string, unknown>);
    validateBuyerInput(input);

    const order = await client.orders.fetch(razorpayOrderId);
    const notes = (order.notes || {}) as Record<string, unknown>;

    if (
      Number(order.amount) !== BOOKING_AMOUNT_PAISE ||
      order.currency !== CURRENCY ||
      toText(notes.sellerId) !== input.sellerId ||
      toText(notes.storeId) !== input.storeId ||
      toText(notes.productId) !== input.productId
    ) {
      sendJson(res, 400, {
        success: false,
        error: "Payment could not be verified. No booking was created.",
      });
      return;
    }

    const finalized = await finalizeVerifiedBooking(input, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    sendJson(res, 200, {
      success: true,
      razorpayOrderId,
      razorpayPaymentId,
      reservationApplied: true,
      ...finalized,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Payment could not be verified. No booking was created.";
    sendJson(res, 400, { success: false, error: message });
  }
}
