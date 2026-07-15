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

type WalletStatus = "active" | "low_balance" | "empty" | "paused";

type WalletData = {
  sellerId: string;
  balance: number;
  freeOrdersRemaining: number;
  totalOrdersCharged: number;
  totalWalletSpent: number;
  status: WalletStatus;
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

class OrderEngineError extends Error {
  debugReason?: string;
  statusCode: number;

  constructor(message: string, statusCode = 400, debugReason?: string) {
    super(message);
    this.name = "OrderEngineError";
    this.debugReason = debugReason;
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
    throw new OrderEngineError("Order Creation Failed", 400, "missing_required_order_input");
  }

  if (!/^[6-9]\d{9}$/.test(input.buyerPhone)) {
    throw new OrderEngineError("Order Creation Failed", 400, "invalid_buyer_phone");
  }

  if (!/^\d{6}$/.test(input.buyerPincode)) {
    throw new OrderEngineError("Order Creation Failed", 400, "invalid_buyer_pincode");
  }

  if (input.buyerAddress.length < 12 || input.buyerAddress.length > 160) {
    throw new OrderEngineError("Order Creation Failed", 400, "invalid_buyer_address_length");
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
    throw new OrderEngineError("Product Unavailable");
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

function createInitialWallet(sellerId: string) {
  return {
    sellerId,
    balance: 0,
    freeOrdersRemaining: INITIAL_FREE_ORDERS,
    totalOrdersCharged: 0,
    totalWalletSpent: 0,
    status: "active" as WalletStatus,
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

  throw new OrderEngineError("Wallet Empty");
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

  const originHeader = req.headers?.origin;
  const hostHeader = req.headers?.host;
  const origin = Array.isArray(originHeader)
    ? originHeader[0]
    : originHeader ||
      (Array.isArray(hostHeader)
        ? `https://${hostHeader[0]}`
        : hostHeader
          ? `https://${hostHeader}`
          : "");

  if (!origin) return "";

  return `${origin}/payment-return/${trimmedSellerReturnToken}?orderToken=${trimmedPaymentTrackingToken}`;
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
    throw new OrderEngineError("Store Temporarily Not Accepting Orders");
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
  const orderRef = db.collection("orders").doc();
  const walletTransactionRef = db.collection("walletTransactions").doc();
  const orderId = orderRef.id;
  const walletTransactionId = walletTransactionRef.id;
  let responseOrder: Record<string, unknown> | null = null;
  let responsePaymentLink = "";
  let responsePaymentMode: "cod" | "partial_advance" = "cod";
  let responsePaymentReturnUrl = "";
  let rejection: OrderEngineError | null = null;
  let walletStatusAfter: WalletStatus | "" = "";
  let walletRejectedEmpty = false;

  await db.runTransaction(async (transaction) => {
    const [storeSnap, productSnap, walletSnap] = await Promise.all([
      transaction.get(storeRef),
      transaction.get(productRef),
      transaction.get(walletRef),
    ]);

    if (!storeSnap.exists) {
      console.warn("Order engine store missing.", { storeId: input.storeId });
      throw new OrderEngineError("Store Temporarily Not Accepting Orders");
    }

    if (!productSnap.exists) {
      console.warn("Order engine product missing.", { productId: input.productId });
      throw new OrderEngineError("Product Unavailable");
    }

    const store = storeSnap.data() as StoreData;
    const product = productSnap.data() as ProductData;
    const wallet = walletSnap.exists
      ? (walletSnap.data() as WalletData)
      : createInitialWallet(input.sellerId);

    if (!store.isPublished) {
      console.warn("Order engine rejected unpublished store.", { storeId: input.storeId });
      throw new OrderEngineError("Store Temporarily Not Accepting Orders");
    }

    assertStoreAcceptingOrders(store, wallet);

    if (
      store.sellerId !== input.sellerId ||
      product.sellerId !== input.sellerId ||
      product.storeId !== input.storeId
    ) {
      console.warn("Order engine seller/product mismatch.", {
        sellerId: input.sellerId,
        storeId: input.storeId,
        productId: input.productId,
      });
      throw new OrderEngineError("Product Unavailable");
    }

    if (product.status !== "open" || getAvailableQuantity(product) <= 0) {
      console.warn("Order engine rejected unavailable product.", {
        productId: input.productId,
        status: product.status,
      });
      throw new OrderEngineError("Product Unavailable");
    }

    const now = FieldValue.serverTimestamp();

    if (!walletHasFunds(wallet)) {
      console.warn("Order engine paused store because wallet is empty.", {
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

      rejection = new OrderEngineError("Wallet Empty");
      walletRejectedEmpty = true;
      return;
    }

    let walletCharge: WalletChargeResult;

    try {
      walletCharge = calculateWalletCharge(wallet);
    } catch (error) {
      console.warn("Order engine wallet failure.", {
        sellerId: input.sellerId,
        error: error instanceof Error ? error.message : "Unknown wallet error",
      });
      throw error;
    }

    const productPrice = toInt(product.price);
    const paymentMode = normalizePaymentMode(store);
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

    if (paymentMode === "partial_advance" && !paymentLink) {
      console.warn("Order engine rejected partial advance store without payment link.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError("Store Temporarily Not Accepting Orders");
    }

    if (paymentMode === "partial_advance" && !sellerReturnToken) {
      console.warn("Order engine rejected partial advance store without return token.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError("Store Temporarily Not Accepting Orders");
    }

    if (paymentMode === "partial_advance" && !paymentReturnUrl) {
      console.warn("Order engine rejected partial advance store without return URL.", {
        storeId: input.storeId,
      });
      throw new OrderEngineError("Store Temporarily Not Accepting Orders");
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
      console.error("Order engine transaction write setup failed.", {
        sellerId: input.sellerId,
        orderId,
        error,
      });
      throw new OrderEngineError("Wallet Transaction Failed");
    }

    console.info(
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

    responsePaymentMode = paymentMode;
    responsePaymentLink = paymentLink;
    responsePaymentReturnUrl = paymentReturnUrl;
    walletStatusAfter = walletCharge.walletStatusAfter;
    responseOrder = {
      ...orderPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  if (rejection) {
    if (walletRejectedEmpty) {
      await sendWalletStateEmailSafely({
        db,
        sellerId: input.sellerId,
        state: "empty",
      });
    }

    throw rejection;
  }

  if (!responseOrder) {
    console.error("Order engine transaction completed without response order.", {
      sellerId: input.sellerId,
      orderId,
    });
    throw new OrderEngineError("Order Creation Failed");
  }

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
    order: responseOrder,
    paymentMode: responsePaymentMode,
    paymentLink: responsePaymentLink,
    paymentReturnUrl: responsePaymentReturnUrl,
  };
}

export async function createOrderHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const db = getAdminDbIfConfigured();

  if (!db) {
    sendJson(res, 500, {
      success: false,
      error: "Secure order creation requires Firebase Admin credentials.",
    });
    return;
  }

  const body = getRequestBody(req) as Record<string, unknown> | null;

  if (!body) {
    sendJson(res, 400, {
      success: false,
      error: "Order Creation Failed",
      ...(isOrderDebugEnabled()
        ? { debug: { reason: "invalid_or_unparseable_request_body" } }
        : {}),
    });
    return;
  }

  let input: OrderInput | null = null;

  try {
    input = getOrderInput(body);
    const result = await createChargeableOrder({ db, input, req });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const orderError =
      error instanceof OrderEngineError
        ? error
        : new OrderEngineError("Order Creation Failed");
    const debugDetails = getErrorDebugDetails(error);

    console.error("Order engine failed.", {
      publicError: orderError.message,
      debugReason: orderError.debugReason,
      input: input ? getSafeOrderDebugInput(input) : null,
      underlying: debugDetails,
    });
    sendJson(res, orderError.statusCode, {
      success: false,
      error: orderError.message,
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
