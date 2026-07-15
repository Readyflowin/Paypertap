import { randomBytes } from "node:crypto";
import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import { getAdminDbIfConfigured } from "./firebaseAdmin.js";
import { normalizeIndianMobileInput } from "../../src/lib/phone.js";
import { sendWalletStateEmailSafely } from "./emailNotifications.js";
import {
  FREE_ORDER_COUNT,
  LOW_BALANCE_THRESHOLD,
  ORDER_CHARGE,
} from "../../src/config/wallet.js";
import type { WalletStatus } from "../../src/types/firestore.js";

const DEFAULT_ADVANCE_AMOUNT = 100;
const INITIAL_FREE_ORDERS = FREE_ORDER_COUNT;
const WALLET_ORDER_CHARGE_AMOUNT = ORDER_CHARGE;

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type OrderInput = {
  sellerId: string;
  storeId: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  buyerEmail?: string;
  selectedVariantId?: string;
  selectedVariantOptions?: Record<string, string>;
};

type ProductData = {
  sellerId?: string;
  storeId?: string;
  title?: string;
  price?: number;
  status?: string;
  inventoryQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  hasVariants?: boolean;
  variants?: Array<{
    variantId?: string;
    label?: string;
    options?: Record<string, string>;
    inventoryQuantity?: number;
    isAvailable?: boolean;
  }>;
};

type StoreData = {
  sellerId?: string;
  isPublished?: boolean;
  acceptingOrders?: boolean;
  pauseReason?: string;
  phone?: string;
  whatsappPhone?: string;
  paymentMode?: "cod" | "partial_advance";
  advanceAmount?: number;
  paymentProvider?: "razorpay";
  paymentLink?: string;
  paymentReturnToken?: string;
};

type WalletData = {
  sellerId: string;
  balance: number;
  freeOrdersRemaining: number;
  totalOrdersCharged: number;
  totalWalletSpent: number;
  status: WalletStatus;
};

type SellerData = {
  sellerId?: string;
  storeId?: string;
  email?: string;
};

type WalletChargeResult = {
  balanceAfter: number;
  freeOrdersRemainingAfter: number;
  totalOrdersChargedAfter: number;
  totalWalletSpentAfter: number;
  transactionType: "free_order" | "order_charge";
  walletCharge: number;
  walletStatusAfter: WalletStatus;
};

type CanonicalVariant = {
  variantId: string;
  label: string;
  options: Record<string, string>;
};

type OrderTransactionResult =
  | {
      status: "created";
      order: Record<string, unknown>;
      paymentLink: string;
      paymentMode: "cod" | "partial_advance";
      paymentRedirectUrl: string;
      paymentReturnUrl: string;
      walletStatusAfter: WalletStatus;
    }
  | {
      status: "rejected";
      error: OrderEngineError;
      walletRejectedEmpty: boolean;
    };

class OrderEngineError extends Error {
  code: string;
  debugReason?: string;
  statusCode: number;

  constructor(message: string, statusCode = 400, code = "order_error", debugReason?: string) {
    super(message);
    this.name = "OrderEngineError";
    this.code = code;
    this.debugReason = debugReason || code;
    this.statusCode = statusCode;
  }
}

type OrderSuccessResponse = {
  success: true;
  orderId: string;
  order: Record<string, unknown>;
  paymentMode: "cod" | "partial_advance";
  paymentLink: string;
  paymentRedirectUrl: string;
  paymentReturnUrl: string;
  redirectUrl: string;
  nextAction: "order_success" | "payment_redirect";
};

type OrderFailureResponse = {
  success: false;
  code: string;
  message: string;
  error: string;
  details?: Record<string, unknown>;
  debug?: Record<string, unknown>;
};

function orderLog(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown> = {}
) {
  const payload = {
    event,
    component: "order-engine",
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

function sendOrderJson(
  res: JsonResponse,
  statusCode: number,
  body: OrderSuccessResponse | OrderFailureResponse
) {
  const isSuccessResponse = body.success === true;
  const logDetails = isSuccessResponse
    ? {
        statusCode,
        success: true,
        orderId: body.orderId,
        paymentMode: body.paymentMode,
        nextAction: body.nextAction,
      }
    : {
        statusCode,
        success: false,
        code: body.code,
        message: body.message,
      };

  orderLog(body.success ? "info" : "warn", "Order API final response.", {
    ...logDetails,
  });
  sendJson(res, statusCode, body);
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

function isOrderDebugEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV !== "production" ||
    process.env.PAYPERTAP_DEBUG_ORDER_ERRORS === "true"
  );
}

function getErrorDebugDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      message: "Unknown order error",
      rawType: typeof error,
    };
  }

  return {
    name: error.name,
    message: error.message,
    code:
      "code" in error && typeof (error as { code?: unknown }).code !== "undefined"
        ? String((error as { code?: unknown }).code)
        : "",
    stack: error.stack?.split("\n").slice(0, 8).join("\n") || "",
  };
}

function getSafeOrderDebugInput(input: OrderInput) {
  return {
    sellerId: input.sellerId,
    storeId: input.storeId,
    productId: input.productId,
    hasBuyerName: Boolean(input.buyerName),
    buyerPhoneLength: input.buyerPhone.length,
    buyerAddressLength: input.buyerAddress.length,
    hasBuyerCity: Boolean(input.buyerCity),
    buyerPincodeLength: input.buyerPincode.length,
    hasBuyerEmail: Boolean(input.buyerEmail),
    selectedVariantId: input.selectedVariantId,
    selectedVariantOptionKeys: Object.keys(input.selectedVariantOptions || {}),
  };
}

function toInt(value: unknown, fallback = 0) {
  const valueAsNumber = Number(value);

  return Number.isFinite(valueAsNumber) ? Math.trunc(valueAsNumber) : fallback;
}

function normalizeBuyerPhone(phone: string) {
  const normalizedPhone = normalizeIndianMobileInput(phone);

  return normalizedPhone.localNumber || phone.replace(/[^\d]/g, "");
}

function normalizeSelectedVariantOptions(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>)
      .map(([name, value]) => [toText(name), toText(value)])
      .filter(([name, value]) => Boolean(name && value))
  );
}

function getOrderInput(payload: Record<string, unknown>): OrderInput {
  return {
    sellerId: toText(payload.sellerId),
    storeId: toText(payload.storeId),
    productId: toText(payload.productId),
    buyerName: toText(payload.buyerName),
    buyerPhone: normalizeBuyerPhone(toText(payload.buyerPhone)),
    buyerAddress: toText(payload.buyerAddress),
    buyerCity: toText(payload.buyerCity),
    buyerPincode: toText(payload.buyerPincode),
    buyerEmail: toText(payload.buyerEmail),
    selectedVariantId: toText(payload.selectedVariantId),
    selectedVariantOptions: normalizeSelectedVariantOptions(payload.selectedVariantOptions),
  };
}

function validateBuyerInput(input: OrderInput) {
  if (
    !input.sellerId ||
    !input.storeId ||
    !input.productId ||
    !input.buyerName ||
    !input.buyerPhone ||
    !input.buyerAddress ||
    !input.buyerCity ||
    !input.buyerPincode
  ) {
    throw new OrderEngineError(
      "Please complete all required order details.",
      400,
      "missing_required_order_input"
    );
  }

  if (!/^[6-9]\d{9}$/.test(input.buyerPhone)) {
    throw new OrderEngineError(
      "Please enter a valid 10-digit WhatsApp mobile number.",
      400,
      "invalid_buyer_phone"
    );
  }

  if (!/^\d{6}$/.test(input.buyerPincode)) {
    throw new OrderEngineError("Please enter a valid 6-digit pincode.", 400, "invalid_buyer_pincode");
  }

  if (input.buyerAddress.length < 12 || input.buyerAddress.length > 160) {
    throw new OrderEngineError(
      "Delivery address must be between 12 and 160 characters.",
      400,
      "invalid_buyer_address_length"
    );
  }
}

function getAvailableQuantity(product: ProductData) {
  return Math.max(
    0,
    toInt(product.inventoryQuantity) -
      toInt(product.reservedQuantity) -
      toInt(product.soldQuantity)
  );
}

function getNextProductStatus(product: ProductData) {
  const inventoryQuantity = toInt(product.inventoryQuantity);
  const reservedQuantity = toInt(product.reservedQuantity);
  const soldQuantity = toInt(product.soldQuantity);
  const availableQuantity = Math.max(0, inventoryQuantity - reservedQuantity - soldQuantity);

  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

function variantSignature(options: Record<string, string>) {
  return Object.entries(options)
    .map(([name, value]) => `${name.toLocaleLowerCase()}:${String(value).toLocaleLowerCase()}`)
    .sort()
    .join("|");
}

function variantLabel(options: Record<string, string>) {
  return Object.values(options).filter(Boolean).join(" / ");
}

function getValidatedSelectedVariant(
  input: OrderInput,
  product: ProductData
): CanonicalVariant | null {
  if (product.hasVariants !== true) return null;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants.find(
    (variant) => variant.variantId && variant.variantId === input.selectedVariantId
  );
  const selectedOptions = input.selectedVariantOptions || {};

  if (
    !selectedVariant ||
    variantSignature(selectedVariant.options || {}) !== variantSignature(selectedOptions) ||
    selectedVariant.isAvailable === false ||
    (typeof selectedVariant.inventoryQuantity === "number" &&
      selectedVariant.inventoryQuantity <= 0)
  ) {
    throw new OrderEngineError(
      "Selected variant is no longer available.",
      409,
      "invalid_or_unavailable_variant"
    );
  }

  return {
    variantId: String(selectedVariant.variantId),
    label: toText(selectedVariant.label) || variantLabel(selectedVariant.options || {}),
    options: selectedVariant.options || {},
  };
}

function walletHasFunds(wallet: Pick<WalletData, "balance" | "freeOrdersRemaining">) {
  return wallet.freeOrdersRemaining > 0 || wallet.balance >= WALLET_ORDER_CHARGE_AMOUNT;
}

function deriveWalletStatus(balance: number, freeOrdersRemaining = 0): WalletStatus {
  if (freeOrdersRemaining > 0) return "active";
  if (balance >= LOW_BALANCE_THRESHOLD) return "active";
  if (balance >= WALLET_ORDER_CHARGE_AMOUNT) return "low_balance";
  return "paused";
}

function createInitialWallet(
  sellerId: string
): WalletData & { createdAt: FieldValue; updatedAt: FieldValue } {
  return {
    sellerId,
    balance: 0,
    freeOrdersRemaining: INITIAL_FREE_ORDERS,
    totalOrdersCharged: 0,
    totalWalletSpent: 0,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function calculateWalletCharge(wallet: WalletData): WalletChargeResult {
  const balanceBefore = Math.max(0, toInt(wallet.balance));
  const freeOrdersBefore = Math.max(0, toInt(wallet.freeOrdersRemaining));
  const totalOrdersChargedBefore = Math.max(0, toInt(wallet.totalOrdersCharged));
  const totalWalletSpentBefore = Math.max(0, toInt(wallet.totalWalletSpent));

  if (freeOrdersBefore > 0) {
    const freeOrdersRemainingAfter = freeOrdersBefore - 1;

    return {
      balanceAfter: balanceBefore,
      freeOrdersRemainingAfter,
      totalOrdersChargedAfter: totalOrdersChargedBefore,
      totalWalletSpentAfter: totalWalletSpentBefore,
      transactionType: "free_order",
      walletCharge: 0,
      walletStatusAfter: deriveWalletStatus(balanceBefore, freeOrdersRemainingAfter),
    };
  }

  if (balanceBefore >= WALLET_ORDER_CHARGE_AMOUNT) {
    const balanceAfter = balanceBefore - WALLET_ORDER_CHARGE_AMOUNT;

    return {
      balanceAfter,
      freeOrdersRemainingAfter: 0,
      totalOrdersChargedAfter: totalOrdersChargedBefore + 1,
      totalWalletSpentAfter: totalWalletSpentBefore + WALLET_ORDER_CHARGE_AMOUNT,
      transactionType: "order_charge",
      walletCharge: WALLET_ORDER_CHARGE_AMOUNT,
      walletStatusAfter: deriveWalletStatus(balanceAfter, 0),
    };
  }

  throw new OrderEngineError(
    "Seller wallet exhausted. Please contact the seller.",
    402,
    "seller_wallet_exhausted"
  );
}

function shouldAcceptOrders(walletCharge: WalletChargeResult) {
  return (
    walletCharge.freeOrdersRemainingAfter > 0 ||
    walletCharge.balanceAfter >= WALLET_ORDER_CHARGE_AMOUNT
  );
}

function generatePaymentTrackingToken(): string {
  return randomBytes(32).toString("hex");
}

function buildPaymentReturnUrl(
  req: { headers?: Record<string, string | string[] | undefined> },
  sellerReturnToken?: string,
  paymentTrackingToken?: string
) {
  const trimmedSellerReturnToken = sellerReturnToken?.trim();
  const trimmedPaymentTrackingToken = paymentTrackingToken?.trim();

  if (!trimmedSellerReturnToken || !trimmedPaymentTrackingToken) return "";

  const configuredOrigin = process.env.PAYPERTAP_PUBLIC_ORIGIN || process.env.PUBLIC_SITE_URL || "";
  const originHeader = req.headers?.origin;
  const hostHeader = req.headers?.host;
  const forwardedHostHeader = req.headers?.["x-forwarded-host"];
  const forwardedProtoHeader = req.headers?.["x-forwarded-proto"];
  const forwardedHost = Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : forwardedHostHeader;
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const origin = Array.isArray(originHeader)
    ? originHeader[0]
    : configuredOrigin ||
      originHeader ||
      (forwardedHost
        ? `${forwardedProto || "https"}://${forwardedHost}`
        : "") ||
      (Array.isArray(hostHeader)
        ? `https://${hostHeader[0]}`
        : hostHeader
          ? `https://${hostHeader}`
          : "");

  if (!origin) return "";

  return `${origin}/payment-return/${trimmedSellerReturnToken}?orderToken=${trimmedPaymentTrackingToken}`;
}

function buildPaymentRedirectUrl(paymentLink: string, paymentReturnUrl: string) {
  if (!paymentLink || !paymentReturnUrl) return paymentLink;

  try {
    const redirectUrl = new URL(paymentLink);
    redirectUrl.searchParams.set("paypertap_return_url", paymentReturnUrl);
    redirectUrl.searchParams.set("paypertap_order_token", new URL(paymentReturnUrl).searchParams.get("orderToken") || "");
    return redirectUrl.toString();
  } catch {
    return paymentLink;
  }
}

function normalizePaymentMode(store: StoreData) {
  return store.paymentMode === "partial_advance" ? "partial_advance" : "cod";
}

function getPaymentAmount(store: StoreData, productPrice: number) {
  const configuredAmount = Math.max(
    1,
    toInt(store.advanceAmount, DEFAULT_ADVANCE_AMOUNT)
  );

  return Math.min(configuredAmount, productPrice);
}

function getWalletTransactionNotes(charge: WalletChargeResult, orderId: string) {
  if (charge.transactionType === "free_order") return "Free introductory order";

  return `Wallet charged for Order #${orderId.slice(0, 8).toUpperCase()}`;
}

function assertStoreAcceptingOrders(store: StoreData, wallet: WalletData) {
  const walletUsable = walletHasFunds(wallet);

  if (store.acceptingOrders === false && !(store.pauseReason === "wallet_empty" && walletUsable)) {
    throw new OrderEngineError(
      "Store is currently not accepting orders.",
      409,
      "store_not_accepting_orders"
    );
  }
}

export async function createChargeableOrder({
  db,
  input,
  req,
}: {
  db: Firestore;
  input: OrderInput;
  req: { headers?: Record<string, string | string[] | undefined> };
}) {
  validateBuyerInput(input);

  const storeRef = db.collection("stores").doc(input.storeId);
  const productRef = db.collection("products").doc(input.productId);
  const walletRef = db.collection("wallets").doc(input.sellerId);
  const sellerRef = db.collection("sellers").doc(input.sellerId);
  const orderRef = db.collection("orders").doc();
  const walletTransactionRef = db.collection("walletTransactions").doc();
  const orderId = orderRef.id;
  const walletTransactionId = walletTransactionRef.id;

  orderLog("info", "Order transaction starting.", {
    orderId,
    sellerId: input.sellerId,
    storeId: input.storeId,
    productId: input.productId,
  });

  const transactionResult = await db.runTransaction<OrderTransactionResult>(async (transaction) => {
    const [storeSnap, productSnap, walletSnap, sellerSnap] = await Promise.all([
      transaction.get(storeRef),
      transaction.get(productRef),
      transaction.get(walletRef),
      transaction.get(sellerRef),
    ]);

    if (!storeSnap.exists) {
      orderLog("warn", "Order validation failed: store missing.", { storeId: input.storeId });
      throw new OrderEngineError("Store is currently unavailable.", 404, "store_not_found");
    }

    if (!productSnap.exists) {
      orderLog("warn", "Order validation failed: product missing.", { productId: input.productId });
      throw new OrderEngineError("Product is out of stock.", 404, "product_not_found");
    }

    if (!sellerSnap.exists) {
      orderLog("warn", "Order validation failed: seller missing.", { sellerId: input.sellerId });
      throw new OrderEngineError("Seller account is unavailable.", 404, "seller_not_found");
    }

    const store = storeSnap.data() as StoreData;
    const product = productSnap.data() as ProductData;
    const seller = sellerSnap.data() as SellerData;
    const wallet = walletSnap.exists
      ? (walletSnap.data() as WalletData)
      : createInitialWallet(input.sellerId);

    if (!store.isPublished) {
      orderLog("warn", "Order validation failed: unpublished store.", { storeId: input.storeId });
      throw new OrderEngineError("Store is currently unavailable.", 409, "store_unpublished");
    }

    assertStoreAcceptingOrders(store, wallet);

    if (
      seller.storeId !== input.storeId ||
      store.sellerId !== input.sellerId ||
      product.sellerId !== input.sellerId ||
      product.storeId !== input.storeId
    ) {
      orderLog("warn", "Order validation failed: seller/store/product mismatch.", {
        sellerId: input.sellerId,
        storeId: input.storeId,
        productId: input.productId,
      });
      throw new OrderEngineError("Product is no longer available.", 409, "seller_store_product_mismatch");
    }

    if (product.status !== "open" || getAvailableQuantity(product) <= 0) {
      orderLog("warn", "Order validation failed: product unavailable.", {
        productId: input.productId,
        status: product.status,
        availableQuantity: getAvailableQuantity(product),
      });
      throw new OrderEngineError("Product is out of stock.", 409, "product_out_of_stock");
    }

    const now = FieldValue.serverTimestamp();

    if (!walletHasFunds(wallet)) {
      orderLog("warn", "Order validation failed: wallet exhausted; pausing store.", {
        sellerId: input.sellerId,
        storeId: input.storeId,
      });
      transaction.update(storeRef, {
        acceptingOrders: false,
        pauseReason: "wallet_empty",
        updatedAt: now,
      });

      if (walletSnap.exists) {
        transaction.update(walletRef, {
          status: "paused",
          updatedAt: now,
        });
      }

      return {
        status: "rejected",
        error: new OrderEngineError(
          "Seller wallet exhausted. Please contact the seller.",
          402,
          "seller_wallet_exhausted"
        ),
        walletRejectedEmpty: true,
      };
    }

    let walletCharge: WalletChargeResult;

    try {
      walletCharge = calculateWalletCharge(wallet);
    } catch (error) {
      orderLog("warn", "Order validation failed: wallet charge calculation failed.", {
        sellerId: input.sellerId,
        error: error instanceof Error ? error.message : "Unknown wallet error",
      });
      throw error;
    }

    const productPrice = toInt(product.price);
    const paymentMode = normalizePaymentMode(store);

    if (productPrice <= 0) {
      orderLog("warn", "Order validation failed: invalid product price.", {
        productId: input.productId,
        productPrice,
      });
      throw new OrderEngineError("Product price is invalid.", 409, "invalid_product_price");
    }

    if (
      paymentMode === "partial_advance" &&
      store.paymentProvider &&
      store.paymentProvider !== "razorpay"
    ) {
      orderLog("warn", "Order validation failed: unsupported payment provider.", {
        storeId: input.storeId,
        paymentProvider: store.paymentProvider,
      });
      throw new OrderEngineError(
        "Invalid payment configuration.",
        409,
        "unsupported_payment_provider"
      );
    }

    const paymentAmount =
      paymentMode === "partial_advance" ? getPaymentAmount(store, productPrice) : 0;
    const sellerAmountDue = Math.max(productPrice - paymentAmount, 0);
    const paymentLink = paymentMode === "partial_advance" ? toText(store.paymentLink) : "";
    const sellerReturnToken = paymentMode === "partial_advance" ? toText(store.paymentReturnToken) : "";
    const paymentTrackingToken =
      paymentMode === "partial_advance" ? generatePaymentTrackingToken() : "";
    const paymentReturnUrl = buildPaymentReturnUrl(
      req,
      sellerReturnToken,
      paymentTrackingToken
    );
    const paymentRedirectUrl =
      paymentMode === "partial_advance"
        ? buildPaymentRedirectUrl(paymentLink, paymentReturnUrl)
        : "";

    if (paymentMode === "partial_advance" && !paymentLink) {
      orderLog("warn", "Order validation failed: partial advance missing payment link.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError(
        "Payment settings incomplete.",
        409,
        "payment_link_missing"
      );
    }

    if (paymentMode === "partial_advance" && !sellerReturnToken) {
      orderLog("warn", "Order validation failed: partial advance missing return token.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError(
        "Payment settings incomplete.",
        409,
        "payment_return_token_missing"
      );
    }

    if (paymentMode === "partial_advance" && !paymentReturnUrl) {
      orderLog("warn", "Order validation failed: partial advance return URL unavailable.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError(
        "Payment return URL could not be generated.",
        500,
        "payment_return_url_missing"
      );
    }

    const selectedVariant = getValidatedSelectedVariant(input, product);
    const sellerPhone = normalizeIndianMobileInput(store.whatsappPhone || store.phone || "");
    const nextReservedQuantity = toInt(product.reservedQuantity) + 1;
    const acceptingOrdersAfter = shouldAcceptOrders(walletCharge);
    const walletSnapshot = {
      balance: Math.max(0, toInt(wallet.balance)),
      freeOrdersRemaining: Math.max(0, toInt(wallet.freeOrdersRemaining)),
      status: wallet.status || "active",
      hasFunds: walletHasFunds(wallet),
    };
    const orderPayload = {
      checkoutId: orderId,
      orderId,
      sellerId: input.sellerId,
      storeId: input.storeId,
      productId: input.productId,
      productTitle: toText(product.title),
      productPrice,
      advanceAmount: paymentAmount,
      paymentAmount,
      sellerAmountDue,
      paymentMode,
      paymentProvider: "razorpay",
      paymentLink,
      paymentReturnUrl,
      ...(paymentRedirectUrl ? { paymentRedirectUrl } : {}),
      ...(paymentTrackingToken ? { paymentTrackingToken } : {}),
      walletStatusSnapshot: walletSnapshot,
      walletCharge: walletCharge.walletCharge,
      walletTransactionId,
      walletType: walletCharge.transactionType,
      walletBalanceAfter: walletCharge.balanceAfter,
      freeOrdersRemainingAfter: walletCharge.freeOrdersRemainingAfter,
      buyerName: input.buyerName,
      ...(input.buyerEmail ? { buyerEmail: input.buyerEmail } : {}),
      buyerPhone: input.buyerPhone,
      ...(sellerPhone.ok && sellerPhone.localNumber
        ? {
            sellerPhone: sellerPhone.localNumber,
            sellerWhatsAppPhone: sellerPhone.localNumber,
            sellerWhatsAppE164: sellerPhone.e164,
          }
        : {}),
      buyerAddress: input.buyerAddress,
      buyerCity: input.buyerCity,
      buyerPincode: input.buyerPincode,
      ...(selectedVariant
        ? {
            selectedVariantId: selectedVariant.variantId,
            selectedVariantLabel: selectedVariant.label,
            selectedVariantOptions: selectedVariant.options,
          }
        : {}),
      status: paymentMode === "partial_advance" ? "awaiting_payment" : "pending_confirmation",
      whatsappOpened: false,
      reservationApplied: true,
      reservedProductId: input.productId,
      reservedQuantity: 1,
      createdAt: now,
      updatedAt: now,
    };

    const transactionPayload = {
      sellerId: input.sellerId,
      type: walletCharge.transactionType,
      amount: walletCharge.walletCharge,
      balanceBefore: Math.max(0, toInt(wallet.balance)),
      balanceAfter: walletCharge.balanceAfter,
      referenceId: orderId,
      notes: getWalletTransactionNotes(walletCharge, orderId),
      createdAt: now,
    };

    try {
      orderLog("info", "Order transaction writes prepared.", {
        orderId,
        sellerId: input.sellerId,
        storeId: input.storeId,
        productId: input.productId,
        paymentMode,
        walletType: walletCharge.transactionType,
        walletCharge: walletCharge.walletCharge,
      });
      const walletPayload = {
        sellerId: input.sellerId,
        balance: walletCharge.balanceAfter,
        freeOrdersRemaining: walletCharge.freeOrdersRemainingAfter,
        totalOrdersCharged: walletCharge.totalOrdersChargedAfter,
        totalWalletSpent: walletCharge.totalWalletSpentAfter,
        status: walletCharge.walletStatusAfter,
        updatedAt: now,
      };

      if (walletSnap.exists) {
        transaction.update(walletRef, walletPayload);
      } else {
        transaction.set(walletRef, {
          ...walletPayload,
          createdAt: now,
        });
      }
      transaction.set(walletTransactionRef, transactionPayload);
      transaction.set(orderRef, orderPayload);
      transaction.update(productRef, {
        reservedQuantity: nextReservedQuantity,
        status: getNextProductStatus({
          ...product,
          reservedQuantity: nextReservedQuantity,
        }),
        updatedAt: now,
      });
      transaction.update(storeRef, {
        acceptingOrders: acceptingOrdersAfter,
        pauseReason: acceptingOrdersAfter ? "" : "wallet_empty",
        updatedAt: now,
      });
    } catch (error) {
      orderLog("error", "Order transaction write setup failed.", {
        sellerId: input.sellerId,
        orderId,
        error,
      });
      throw new OrderEngineError("Firestore transaction failed.", 500, "transaction_write_setup_failed");
    }

    orderLog("info",
      walletCharge.transactionType === "free_order"
        ? "Order engine used free introductory order."
        : "Order engine charged seller wallet.",
      {
        sellerId: input.sellerId,
        orderId,
        walletTransactionId,
        walletCharge: walletCharge.walletCharge,
        balanceAfter: walletCharge.balanceAfter,
        freeOrdersRemainingAfter: walletCharge.freeOrdersRemainingAfter,
      }
    );

    return {
      status: "created",
      order: {
        ...orderPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      paymentLink,
      paymentMode,
      paymentRedirectUrl,
      paymentReturnUrl,
      walletStatusAfter: walletCharge.walletStatusAfter,
    };
  });

  if (transactionResult.status === "rejected") {
    if (transactionResult.walletRejectedEmpty) {
      await sendWalletStateEmailSafely({
        db,
        sellerId: input.sellerId,
        state: "empty",
      });
    }

    throw transactionResult.error;
  }

  const walletStatusAfter = transactionResult.walletStatusAfter;

  if (walletStatusAfter === "low_balance") {
    await sendWalletStateEmailSafely({
      db,
      sellerId: input.sellerId,
      state: "low",
    });
  }

  if (walletStatusAfter === "empty" || walletStatusAfter === "paused") {
    await sendWalletStateEmailSafely({
      db,
      sellerId: input.sellerId,
      state: "empty",
    });
  }

  return {
    orderId,
    order: transactionResult.order,
    paymentMode: transactionResult.paymentMode,
    paymentLink: transactionResult.paymentLink,
    paymentReturnUrl: transactionResult.paymentReturnUrl,
    paymentRedirectUrl: transactionResult.paymentRedirectUrl,
  };
}

export async function createOrderHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendOrderJson(res, 405, {
      success: false,
      code: "method_not_allowed",
      message: "Method not allowed.",
      error: "Method not allowed.",
    });
    return;
  }

  loadLocalEnv();

  const db = getAdminDbIfConfigured();

  if (!db) {
    sendOrderJson(res, 500, {
      success: false,
      code: "firebase_admin_unavailable",
      message: "Secure order creation requires Firebase Admin credentials.",
      error: "Secure order creation requires Firebase Admin credentials.",
    });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;

  orderLog("info", "Order API request body parsed.", {
    hasBody: Boolean(body),
    bodyKeys: body ? Object.keys(body).sort() : [],
  });

  if (!body) {
    sendOrderJson(res, 400, {
      success: false,
      code: "invalid_request_body",
      message: "Request body could not be read.",
      error: "Request body could not be read.",
      ...(isOrderDebugEnabled()
        ? { debug: { reason: "invalid_or_unparseable_request_body" } }
        : {}),
    });
    return;
  }

  let input: OrderInput | null = null;

  try {
    input = getOrderInput(body);
    orderLog("info", "Order API validation passed.", {
      input: getSafeOrderDebugInput(input),
    });
    const result = await createChargeableOrder({ db, input, req });
    const nextAction =
      result.paymentMode === "partial_advance" ? "payment_redirect" : "order_success";
    const redirectUrl =
      result.paymentMode === "partial_advance"
        ? result.paymentRedirectUrl
        : `/${input.storeId}/order-success/${result.orderId}`;

    sendOrderJson(res, 200, {
      success: true,
      ...result,
      redirectUrl,
      nextAction,
    });
  } catch (error) {
    const orderError =
      error instanceof OrderEngineError
        ? error
        : new OrderEngineError("Firestore transaction failed.", 500, "unhandled_order_exception");
    const debugDetails = getErrorDebugDetails(error);

    console.error("Order engine failed.", {
      publicError: orderError.message,
      code: orderError.code,
      debugReason: orderError.debugReason,
      input: input ? getSafeOrderDebugInput(input) : null,
      underlying: debugDetails,
    });
    sendOrderJson(res, orderError.statusCode, {
      success: false,
      code: orderError.code,
      message: orderError.message,
      error: orderError.message,
      details: {
        reason: orderError.debugReason || orderError.code,
      },
      ...(isOrderDebugEnabled()
        ? {
            debug: {
              reason: orderError.debugReason || "unhandled_order_exception",
              underlying: debugDetails,
              input: input ? getSafeOrderDebugInput(input) : null,
            },
          }
        : {}),
    });
  }
}
