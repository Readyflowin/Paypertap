import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminDbIfConfigured,
  getFirebaseAdminEnvDebugState,
} from "./firebaseAdmin.js";
import { sendSellerBookingEmailSafely } from "./emailNotifications.js";
import { normalizeIndianMobileInput } from "../../src/lib/phone.js";
import { calculateConfirmationAdvance } from "../../src/lib/confirmationAdvance.js";

const BOOKING_AMOUNT_RUPEES = 20;
const BOOKING_AMOUNT_PAISE = 2000;
const CURRENCY = "INR";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
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
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
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
  hasVariants?: boolean;
  variantOptions?: Array<{ name?: string; values?: string[] }>;
  variants?: Array<{
    variantId?: string;
    label?: string;
    options?: Record<string, string>;
    inventoryQuantity?: number;
    isAvailable?: boolean;
  }>;
};

type CanonicalVariant = {
  variantId: string;
  label: string;
  options: Record<string, string>;
  inventoryQuantity?: number;
  isAvailable?: boolean;
};

type ValidatedBooking = BookingInput & {
  confirmationAdvanceType?: "paypertap_only" | "fixed" | "percentage";
  totalConfirmationAdvance?: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  sellerPhone?: string;
  sellerWhatsAppPhone?: string;
  sellerWhatsAppE164?: string;
};

type StoreData = {
  sellerId?: string;
  isPublished?: boolean;
  phone?: string;
  whatsappPhone?: string;
  sellerConfirmationAdvanceType?: "paypertap_only" | "fixed" | "percentage";
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
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
  const normalizedPhone = normalizeIndianMobileInput(phone);

  return normalizedPhone.localNumber || phone.replace(/[^\d]/g, "");
}

function normalizeVariantOptions(input: unknown): Array<{ name: string; values: string[] }> {
  if (!Array.isArray(input)) return [];

  return input
    .slice(0, 2)
    .map((option, index) => {
      const rawOption =
        option && typeof option === "object" ? (option as Record<string, unknown>) : {};
      const name =
        typeof rawOption.name === "string" && rawOption.name.trim()
          ? rawOption.name.trim()
          : index === 0
            ? "Size"
            : "Color";
      const values = Array.isArray(rawOption.values)
        ? rawOption.values
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 20)
        : [];

      return { name, values };
    })
    .filter((option) => option.values.length > 0);
}

function productHasVariants(product: ProductData) {
  return product.hasVariants === true;
}

function variantLabel(options: Record<string, string>) {
  return Object.values(options).filter(Boolean).join(" / ");
}

function variantSignature(options: Record<string, string>) {
  return Object.entries(options)
    .map(([name, value]) => `${name.toLocaleLowerCase()}:${String(value).toLocaleLowerCase()}`)
    .sort()
    .join("|");
}

function getStoredProductVariants(product: ProductData): CanonicalVariant[] {
  if (!productHasVariants(product)) return [];

  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.slice(0, 100).map((variant, index) => ({
      variantId: toText(variant.variantId) || `variant-${index + 1}`,
      label: toText(variant.label) || variantLabel(variant.options || {}),
      options: variant.options || {},
      inventoryQuantity: variant.inventoryQuantity,
      isAvailable: variant.isAvailable !== false,
    }));
  }

  return [];
}

function isVariantAvailable(variant: {
  inventoryQuantity?: number;
  isAvailable?: boolean;
}) {
  if (variant.isAvailable === false) return false;
  if (typeof variant.inventoryQuantity === "number") return variant.inventoryQuantity > 0;
  return true;
}

function normalizeSelectedVariantOptions(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>)
      .map(([name, value]) => [toText(name), toText(value)])
      .filter(([name, value]) => Boolean(name && value))
  );
}

function getValidatedSelectedVariant(
  input: BookingInput,
  product: ProductData
): CanonicalVariant | null {
  if (!productHasVariants(product)) return null;

  const selectedOptions = input.selectedVariantOptions || {};
  const selectedSignature = variantSignature(selectedOptions);
  const selectedVariant = getStoredProductVariants(product).find(
    (variant) => variant.variantId === input.selectedVariantId
  );

  if (
    !input.selectedVariantId ||
    !selectedVariant ||
    variantSignature(selectedVariant.options) !== selectedSignature ||
    !isVariantAvailable(selectedVariant)
  ) {
    throw new Error("Please select an available size/color option.");
  }

  return selectedVariant;
}

function withCanonicalVariant(
  input: BookingInput,
  variant: CanonicalVariant | null,
  sellerPhonePayload: Pick<
    ValidatedBooking,
    "sellerPhone" | "sellerWhatsAppPhone" | "sellerWhatsAppE164"
  > = {},
  confirmationPayload: Pick<
    ValidatedBooking,
    | "confirmationAdvanceType"
    | "totalConfirmationAdvance"
    | "sellerConfirmationAmountPending"
    | "finalBalanceAfterConfirmation"
  > = {}
): ValidatedBooking {
  if (!variant) {
    return {
      sellerId: input.sellerId,
      storeId: input.storeId,
      productId: input.productId,
      productTitle: input.productTitle,
      productPrice: input.productPrice,
      bookingAdvanceAmount: input.bookingAdvanceAmount,
      sellerCollectAmount: input.sellerCollectAmount,
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      buyerAddress: input.buyerAddress,
      buyerCity: input.buyerCity,
      buyerPincode: input.buyerPincode,
      buyerEmail: input.buyerEmail,
      ...sellerPhonePayload,
      ...confirmationPayload,
    };
  }

  return {
    ...input,
    ...sellerPhonePayload,
    ...confirmationPayload,
    selectedVariantId: variant.variantId,
    selectedVariantLabel: variant.label || variantLabel(variant.options),
    selectedVariantOptions: variant.options,
  };
}

function getConfirmationPayload(store: StoreData, productPrice: number) {
  const confirmation = calculateConfirmationAdvance({
    productPrice,
    sellerConfirmationAdvanceType: store.sellerConfirmationAdvanceType,
    sellerConfirmationAdvanceFixedAmount: store.sellerConfirmationAdvanceFixedAmount,
    sellerConfirmationAdvancePercent: store.sellerConfirmationAdvancePercent,
  });

  return {
    confirmationAdvanceType: confirmation.sellerConfirmationAdvanceType,
    totalConfirmationAdvance: confirmation.totalConfirmationAdvance,
    sellerConfirmationAmountPending: confirmation.sellerConfirmationAmountPending,
    finalBalanceAfterConfirmation: confirmation.finalBalanceAfterConfirmation,
  };
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
    selectedVariantId: toText(payload.selectedVariantId),
    selectedVariantLabel: toText(payload.selectedVariantLabel),
    selectedVariantOptions: normalizeSelectedVariantOptions(payload.selectedVariantOptions),
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

  const selectedVariant = getValidatedSelectedVariant(input, product);
  const sellerPhone = normalizeIndianMobileInput(store.whatsappPhone || store.phone || "");
  const sellerPhonePayload = sellerPhone.ok && sellerPhone.localNumber
    ? {
        sellerPhone: sellerPhone.localNumber,
        sellerWhatsAppPhone: sellerPhone.localNumber,
        sellerWhatsAppE164: sellerPhone.e164,
      }
    : {};
  const confirmationPayload = getConfirmationPayload(store, input.productPrice);

  return {
    db,
    product,
    booking: withCanonicalVariant(
      input,
      selectedVariant,
      sellerPhonePayload,
      confirmationPayload
    ),
  };
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

async function finalizeVerifiedBooking(rawInput: BookingInput, payment: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { db, booking: input } = await validateStoreAndProduct(rawInput);
  const checkoutRef = db.collection("checkoutSessions").doc();
  const productRef = db.collection("products").doc(input.productId);
  const paymentRef = db.collection("payments").doc(payment.razorpayPaymentId);
  const checkoutId = checkoutRef.id;
  let responseInput = input;

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

    const selectedVariant = getValidatedSelectedVariant(input, product);
    const canonicalInput = withCanonicalVariant(input, selectedVariant, {
      ...(input.sellerPhone ? { sellerPhone: input.sellerPhone } : {}),
      ...(input.sellerWhatsAppPhone
        ? { sellerWhatsAppPhone: input.sellerWhatsAppPhone }
        : {}),
      ...(input.sellerWhatsAppE164 ? { sellerWhatsAppE164: input.sellerWhatsAppE164 } : {}),
    }, {
      confirmationAdvanceType: input.confirmationAdvanceType,
      totalConfirmationAdvance: input.totalConfirmationAdvance,
      sellerConfirmationAmountPending: input.sellerConfirmationAmountPending,
      finalBalanceAfterConfirmation: input.finalBalanceAfterConfirmation,
    });
    responseInput = canonicalInput;

    const nextReservedQuantity = Number(product.reservedQuantity || 0) + 1;
    const nextProduct = {
      ...product,
      reservedQuantity: nextReservedQuantity,
    };
    const now = FieldValue.serverTimestamp();

    transaction.set(checkoutRef, {
      checkoutId,
      sellerId: canonicalInput.sellerId,
      storeId: canonicalInput.storeId,
      productId: canonicalInput.productId,
      productTitle: canonicalInput.productTitle,
      productPrice: canonicalInput.productPrice,
      bookingAdvanceAmount: BOOKING_AMOUNT_RUPEES,
      sellerCollectAmount: canonicalInput.sellerCollectAmount,
      confirmationAdvanceType: canonicalInput.confirmationAdvanceType,
      totalConfirmationAdvance: canonicalInput.totalConfirmationAdvance,
      sellerConfirmationAmountPending: canonicalInput.sellerConfirmationAmountPending,
      finalBalanceAfterConfirmation: canonicalInput.finalBalanceAfterConfirmation,
      buyerName: canonicalInput.buyerName,
      ...(canonicalInput.buyerEmail ? { buyerEmail: canonicalInput.buyerEmail } : {}),
      buyerPhone: canonicalInput.buyerPhone,
      ...(canonicalInput.sellerPhone ? { sellerPhone: canonicalInput.sellerPhone } : {}),
      ...(canonicalInput.sellerWhatsAppPhone
        ? { sellerWhatsAppPhone: canonicalInput.sellerWhatsAppPhone }
        : {}),
      ...(canonicalInput.sellerWhatsAppE164
        ? { sellerWhatsAppE164: canonicalInput.sellerWhatsAppE164 }
        : {}),
      buyerAddress: canonicalInput.buyerAddress,
      buyerCity: canonicalInput.buyerCity,
      buyerPincode: canonicalInput.buyerPincode,
      ...(canonicalInput.selectedVariantId
        ? {
            selectedVariantId: canonicalInput.selectedVariantId,
            selectedVariantLabel: canonicalInput.selectedVariantLabel || "",
            selectedVariantOptions: canonicalInput.selectedVariantOptions || {},
          }
        : {}),
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
      sellerId: canonicalInput.sellerId,
      storeId: canonicalInput.storeId,
      productId: canonicalInput.productId,
      checkoutId,
      ...(canonicalInput.selectedVariantId
        ? {
            selectedVariantId: canonicalInput.selectedVariantId,
            selectedVariantLabel: canonicalInput.selectedVariantLabel || "",
            selectedVariantOptions: canonicalInput.selectedVariantOptions || {},
          }
        : {}),
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
    sellerId: responseInput.sellerId,
    storeId: responseInput.storeId,
    productId: responseInput.productId,
    productTitle: responseInput.productTitle,
    productPrice: responseInput.productPrice,
    bookingAdvanceAmount: BOOKING_AMOUNT_RUPEES,
    sellerCollectAmount: responseInput.sellerCollectAmount,
    confirmationAdvanceType: responseInput.confirmationAdvanceType,
    totalConfirmationAdvance: responseInput.totalConfirmationAdvance,
    sellerConfirmationAmountPending: responseInput.sellerConfirmationAmountPending,
    finalBalanceAfterConfirmation: responseInput.finalBalanceAfterConfirmation,
    buyerName: responseInput.buyerName,
    ...(responseInput.buyerEmail ? { buyerEmail: responseInput.buyerEmail } : {}),
    buyerPhone: responseInput.buyerPhone,
    ...(responseInput.sellerPhone ? { sellerPhone: responseInput.sellerPhone } : {}),
    ...(responseInput.sellerWhatsAppPhone
      ? { sellerWhatsAppPhone: responseInput.sellerWhatsAppPhone }
      : {}),
    ...(responseInput.sellerWhatsAppE164
      ? { sellerWhatsAppE164: responseInput.sellerWhatsAppE164 }
      : {}),
    buyerAddress: responseInput.buyerAddress,
    buyerCity: responseInput.buyerCity,
    buyerPincode: responseInput.buyerPincode,
    ...(responseInput.selectedVariantId
      ? {
          selectedVariantId: responseInput.selectedVariantId,
          selectedVariantLabel: responseInput.selectedVariantLabel || "",
          selectedVariantOptions: responseInput.selectedVariantOptions || {},
        }
      : {}),
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
    const { booking } = await validateStoreAndProduct(input);

    const order = await client.orders.create({
      amount: BOOKING_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt: buildReceipt(),
      notes: {
        sellerId: safeNoteValue(booking.sellerId),
        storeId: safeNoteValue(booking.storeId),
        productId: safeNoteValue(booking.productId),
        ...(booking.selectedVariantId
          ? { selectedVariantId: safeNoteValue(booking.selectedVariantId) }
          : {}),
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
      toText(notes.productId) !== input.productId ||
      (input.selectedVariantId
        ? toText(notes.selectedVariantId) !== input.selectedVariantId
        : Boolean(toText(notes.selectedVariantId)))
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
    const emailDb = getAdminDbIfConfigured();

    if (emailDb) {
      await sendSellerBookingEmailSafely({
        checkoutId: finalized.checkoutId,
        db: emailDb,
      });
    }

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
