import { createHmac, timingSafeEqual } from "node:crypto";
import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminAuthIfConfigured,
  getAdminDbIfConfigured,
} from "./firebaseAdmin.js";
import {
  sendWalletRechargeSuccessfulEmailSafely,
  sendWalletStateEmailSafely,
} from "./emailNotifications.js";
import {
  FREE_ORDER_COUNT,
  LOW_BALANCE_THRESHOLD,
  ORDER_CHARGE,
  WALLET_RECHARGE_MAX_AMOUNT,
  WALLET_RECHARGE_MIN_AMOUNT,
} from "../../src/config/wallet.js";
import type { WalletStatus } from "../../src/types/firestore.js";

const INITIAL_FREE_ORDERS = FREE_ORDER_COUNT;
const WALLET_ORDER_CHARGE_AMOUNT = ORDER_CHARGE;
const MIN_RECHARGE_AMOUNT = WALLET_RECHARGE_MIN_AMOUNT;
const MAX_RECHARGE_AMOUNT = WALLET_RECHARGE_MAX_AMOUNT;

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type RechargeStatus = "pending" | "credited";
type AdminAdjustmentType = "bonus" | "adjustment" | "refund";

type WalletData = {
  sellerId?: string;
  balance?: number;
  freeOrdersRemaining?: number;
  totalOrdersCharged?: number;
  totalWalletSpent?: number;
  status?: WalletStatus;
  emailEvents?: Record<string, unknown>;
  createdAt?: unknown;
};

type WalletRechargeData = {
  rechargeId?: string;
  sellerId?: string;
  amount?: number;
  requestedAmount?: number;
  status?: RechargeStatus;
  paymentProvider?: "razorpay";
  referenceId?: string;
  razorpayOrderId?: string;
  razorpayOrderStatus?: string;
  razorpayPaymentId?: string;
  razorpayPaymentStatus?: string;
  walletTransactionId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  completedAt?: unknown;
  creditedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type SellerData = {
  email?: string;
  name?: string;
  phone?: string;
  storeId?: string;
};

class WalletRechargeError extends Error {
  code: string;
  details?: Record<string, unknown>;
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400,
    code = "wallet_recharge_error",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "WalletRechargeError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

type RazorpayOrder = {
  id?: string;
  amount?: number;
  amount_paid?: number;
  currency?: string;
  receipt?: string;
  status?: string;
};

type RazorpayPayment = {
  amount?: number;
  currency?: string;
  id?: string;
  order_id?: string;
  status?: string;
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

function toInt(value: unknown, fallback = 0) {
  const valueAsNumber = Number(value);

  return Number.isFinite(valueAsNumber) ? Math.trunc(valueAsNumber) : fallback;
}

function getBearerToken(req: { headers?: Record<string, unknown> }) {
  const header = toText(req.headers?.authorization || req.headers?.Authorization);
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || "";
}

async function getAuthenticatedSellerId(req: { headers?: Record<string, unknown> }) {
  const auth = getAdminAuthIfConfigured();

  if (!auth) {
    throw new WalletRechargeError("Wallet recharge is temporarily unavailable.", 500);
  }

  const token = getBearerToken(req);

  if (!token) {
    throw new WalletRechargeError("Please sign in before recharging wallet.", 401);
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new WalletRechargeError("Please sign in before recharging wallet.", 401);
  }
}

async function assertAuthenticatedAdmin(req: { headers?: Record<string, unknown> }) {
  const auth = getAdminAuthIfConfigured();

  if (!auth) {
    throw new WalletRechargeError("Wallet adjustment is temporarily unavailable.", 500);
  }

  const token = getBearerToken(req);

  if (!token) {
    throw new WalletRechargeError("Admin sign-in is required.", 401);
  }

  try {
    const decoded = await auth.verifyIdToken(token);

    if (decoded.admin !== true) {
      throw new WalletRechargeError("Admin access is required.", 403);
    }
  } catch (error) {
    if (error instanceof WalletRechargeError) throw error;
    throw new WalletRechargeError("Admin access is required.", 403);
  }
}

function getRazorpayCredentials() {
  const keyId = toText(process.env.RAZORPAY_KEY_ID);
  const keySecret = toText(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    throw new WalletRechargeError(
      "Missing Razorpay credentials.",
      500,
      "missing_razorpay_credentials",
      {
        hasKeyId: Boolean(keyId),
        hasKeySecret: Boolean(keySecret),
      }
    );
  }

  return { keyId, keySecret };
}

function getRazorpayAuthHeader() {
  const { keyId, keySecret } = getRazorpayCredentials();
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return `Basic ${credentials}`;
}

async function razorpayRequest<T>({
  body,
  method,
  path,
}: {
  body?: Record<string, unknown>;
  method: "GET" | "POST";
  path: string;
}): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & { error?: { description?: string; reason?: string } })
    | null;

  if (!response.ok) {
    throw new WalletRechargeError(
      payload?.error?.description || "Razorpay request failed.",
      502,
      "razorpay_request_failed",
      {
        method,
        path,
        statusCode: response.status,
        reason: payload?.error?.reason || "",
      }
    );
  }

  return payload as T;
}

async function createRazorpayRechargeOrder({
  amount,
  rechargeId,
  referenceId,
  sellerId,
}: {
  amount: number;
  rechargeId: string;
  referenceId: string;
  sellerId: string;
}) {
  const response = await razorpayRequest<RazorpayOrder>({
    method: "POST",
    path: "/orders",
    body: {
      amount: amount * 100,
      currency: "INR",
      receipt: referenceId,
      notes: {
        sellerId,
        rechargeId,
        referenceId,
      },
    },
  });

  const razorpayOrderId = toText(response.id);

  if (
    !razorpayOrderId ||
    Number(response.amount || 0) !== amount * 100 ||
    toText(response.currency).toUpperCase() !== "INR"
  ) {
    throw new WalletRechargeError(
      "Unable to create Razorpay order.",
      502,
      "razorpay_order_invalid_response",
      {
        hasOrderId: Boolean(razorpayOrderId),
        amount: response.amount || 0,
        currency: response.currency || "",
      }
    );
  }

  return {
    razorpayOrderId,
    razorpayOrderStatus: toText(response.status) || "created",
  };
}

function assertRechargeAmount(amountInput: unknown) {
  const amount = toInt(amountInput);

  if (
    amount < MIN_RECHARGE_AMOUNT ||
    amount > MAX_RECHARGE_AMOUNT ||
    !Number.isInteger(amount)
  ) {
    throw new WalletRechargeError(
      `Recharge amount must be between Rs. ${MIN_RECHARGE_AMOUNT.toLocaleString("en-IN")} and Rs. ${MAX_RECHARGE_AMOUNT.toLocaleString("en-IN")}.`
    );
  }

  return amount;
}

async function fetchRazorpayOrder(razorpayOrderId: string) {
  return await razorpayRequest<RazorpayOrder>({
    method: "GET",
    path: `/orders/${encodeURIComponent(razorpayOrderId)}`,
  });
}

async function fetchRazorpayPayment(paymentId: string) {
  return await razorpayRequest<RazorpayPayment>({
    method: "GET",
    path: `/payments/${encodeURIComponent(paymentId)}`,
  });
}

function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(razorpaySignature, "hex");

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      409,
      "invalid_razorpay_signature"
    );
  }
}

async function verifyWalletRechargePayment({
  referenceId,
  rechargeAmount,
  rechargeId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  referenceId: string;
  rechargeAmount: number;
  rechargeId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      409,
      "missing_razorpay_payment_fields",
      { rechargeId }
    );
  }

  verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });

  const order = await fetchRazorpayOrder(razorpayOrderId);
  const payment = await fetchRazorpayPayment(razorpayPaymentId);
  const amountPaise = rechargeAmount * 100;

  if (
    toText(order.id) !== razorpayOrderId ||
    Number(order.amount || 0) !== amountPaise ||
    toText(order.currency).toUpperCase() !== "INR" ||
    toText(order.receipt) !== referenceId
  ) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      409,
      "razorpay_order_mismatch",
      {
        rechargeId,
        razorpayOrderId,
        orderAmount: order.amount || 0,
        orderCurrency: order.currency || "",
        orderReceipt: order.receipt || "",
      }
    );
  }

  if (Number(order.amount_paid || 0) < amountPaise) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      409,
      "razorpay_order_not_paid",
      {
        rechargeId,
        razorpayOrderId,
        amountPaise,
        amountPaid: order.amount_paid || 0,
        orderStatus: order.status || "",
      }
    );
  }

  const paymentStatus = toText(payment.status).toLowerCase();

  if (
    toText(payment.id) !== razorpayPaymentId ||
    toText(payment.order_id) !== razorpayOrderId ||
    paymentStatus !== "captured" ||
    Number(payment.amount || 0) !== amountPaise ||
    toText(payment.currency).toUpperCase() !== "INR"
  ) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      409,
      "payment_mismatch",
      {
        rechargeId,
        razorpayOrderId,
        razorpayPaymentId,
        paymentStatus: payment.status || "",
        paymentAmount: payment.amount || 0,
        paymentCurrency: payment.currency || "",
      }
    );
  }

  return {
    orderStatus: toText(order.status),
    paymentId: razorpayPaymentId,
    paymentStatus: toText(payment.status),
  };
}

function walletHasFunds(wallet: Pick<WalletData, "balance" | "freeOrdersRemaining">) {
  return (
    toInt(wallet.freeOrdersRemaining) > 0 ||
    toInt(wallet.balance) >= WALLET_ORDER_CHARGE_AMOUNT
  );
}

function getWalletStatus(balance: number, freeOrdersRemaining: number): WalletStatus {
  if (freeOrdersRemaining > 0 || balance >= LOW_BALANCE_THRESHOLD) return "active";
  if (balance >= WALLET_ORDER_CHARGE_AMOUNT) return "low_balance";

  return "paused";
}

function getInitialWallet(sellerId: string, now: unknown): WalletData {
  return {
    sellerId,
    balance: 0,
    freeOrdersRemaining: INITIAL_FREE_ORDERS,
    totalOrdersCharged: 0,
    totalWalletSpent: 0,
    status: "active",
    createdAt: now,
  };
}

async function getSellerStoreId(db: Firestore, sellerId: string) {
  const sellerSnap = await db.collection("sellers").doc(sellerId).get();
  const seller = sellerSnap.exists ? (sellerSnap.data() as SellerData) : {};

  return toText(seller.storeId);
}

async function getExistingSeller(db: Firestore, sellerId: string) {
  const sellerSnap = await db.collection("sellers").doc(sellerId).get();

  if (!sellerSnap.exists) {
    throw new WalletRechargeError(
      "Seller account is unavailable.",
      404,
      "seller_not_found",
      { sellerId }
    );
  }

  return sellerSnap.data() as SellerData;
}

export async function createWalletRechargeOrder({
  amount,
  sellerId,
}: {
  amount: number;
  sellerId: string;
}) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new WalletRechargeError("Wallet recharge is temporarily unavailable.", 500);
  }

  const cleanSellerId = sellerId.trim();

  if (!cleanSellerId) {
    throw new WalletRechargeError("Please sign in before recharging wallet.", 401);
  }

  const rechargeAmount = assertRechargeAmount(amount);
  await getExistingSeller(db, cleanSellerId);
  const rechargeRef = db.collection("walletRecharges").doc();
  const rechargeId = rechargeRef.id;
  const referenceId = `PPT-WALLET-${rechargeId.slice(0, 8).toUpperCase()}`;
  const { razorpayOrderId, razorpayOrderStatus } = await createRazorpayRechargeOrder({
    amount: rechargeAmount,
    rechargeId,
    referenceId,
    sellerId: cleanSellerId,
  });
  const now = FieldValue.serverTimestamp();

  await rechargeRef.set({
    rechargeId,
    sellerId: cleanSellerId,
    amount: rechargeAmount,
    requestedAmount: rechargeAmount,
    status: "pending",
    paymentProvider: "razorpay",
    referenceId,
    razorpayOrderId,
    razorpayOrderStatus,
    createdAt: now,
    updatedAt: now,
  });

  console.info("Wallet recharge session created.", {
    sellerId: cleanSellerId,
    rechargeId,
    amount: rechargeAmount,
    razorpayOrderId,
  });

  const { keyId } = getRazorpayCredentials();

  return {
    amount: rechargeAmount,
    currency: "INR",
    keyId,
    razorpayOrderId,
    rechargeId,
    referenceId,
  };
}

export async function verifyAndCreditWalletRecharge({
  rechargeId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  sellerId,
}: {
  rechargeId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  sellerId: string;
}) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new WalletRechargeError("Wallet recharge verification is temporarily unavailable.", 500);
  }

  const cleanRechargeId = rechargeId.trim();
  const cleanSellerId = sellerId.trim();
  const cleanOrderId = razorpayOrderId.trim();
  const cleanPaymentId = razorpayPaymentId.trim();
  const cleanSignature = razorpaySignature.trim();

  if (!cleanRechargeId || !cleanSellerId || !cleanOrderId || !cleanPaymentId || !cleanSignature) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      400,
      "missing_payment_verification_input"
    );
  }

  const rechargeDoc = await db.collection("walletRecharges").doc(cleanRechargeId).get();

  if (!rechargeDoc.exists) {
    throw new WalletRechargeError(
      "Payment verification failed.",
      404,
      "recharge_not_found",
      { rechargeId: cleanRechargeId }
    );
  }

  const rechargeBeforeTransaction = rechargeDoc.data() as WalletRechargeData;
  let verification:
    | {
        orderStatus: string;
        paymentId: string;
        paymentStatus: string;
      }
    | null = null;

  if (
    rechargeBeforeTransaction.status !== "credited" ||
    !toText(rechargeBeforeTransaction.walletTransactionId)
  ) {
    if (
      toText(rechargeBeforeTransaction.sellerId) !== cleanSellerId ||
      toText(rechargeBeforeTransaction.razorpayOrderId) !== cleanOrderId
    ) {
      throw new WalletRechargeError(
        "Payment verification failed.",
        409,
        "recharge_order_mismatch",
        {
          rechargeId: cleanRechargeId,
          hasSellerMatch: toText(rechargeBeforeTransaction.sellerId) === cleanSellerId,
          hasOrderMatch: toText(rechargeBeforeTransaction.razorpayOrderId) === cleanOrderId,
        }
      );
    }

    verification = await verifyWalletRechargePayment({
      razorpayOrderId: cleanOrderId,
      razorpayPaymentId: cleanPaymentId,
      razorpaySignature: cleanSignature,
      referenceId: toText(rechargeBeforeTransaction.referenceId) || `PPT-WALLET-${cleanRechargeId}`,
      rechargeAmount: assertRechargeAmount(
        rechargeBeforeTransaction.requestedAmount || rechargeBeforeTransaction.amount
      ),
      rechargeId: cleanRechargeId,
    });
  }

  let result:
    | {
        alreadyCredited: boolean;
        amount: number;
        balanceAfter: number;
        balanceBefore: number;
        referenceId: string;
        sellerId: string;
        walletStatus: WalletStatus;
        walletTransactionId: string;
      }
    | null = null;

  await db.runTransaction(async (transaction) => {
    const rechargeRef = db.collection("walletRecharges").doc(cleanRechargeId);
    const currentRechargeSnap = await transaction.get(rechargeRef);

    if (!currentRechargeSnap.exists) {
      throw new WalletRechargeError("Payment verification failed.", 404, "recharge_not_found");
    }

    const recharge = currentRechargeSnap.data() as WalletRechargeData;
    const sellerId = toText(recharge.sellerId);
    const amount = assertRechargeAmount(recharge.requestedAmount || recharge.amount);
    const referenceId = toText(recharge.referenceId) || `PPT-WALLET-${cleanRechargeId}`;
    const existingTransactionId = toText(recharge.walletTransactionId);

    if (
      !sellerId ||
      sellerId !== cleanSellerId ||
      toText(recharge.razorpayOrderId) !== cleanOrderId
    ) {
      throw new WalletRechargeError(
        "Payment verification failed.",
        409,
        "recharge_order_mismatch"
      );
    }

    if (recharge.status === "credited" && existingTransactionId) {
      result = {
        alreadyCredited: true,
        amount,
        balanceAfter: toInt(recharge.balanceAfter),
        balanceBefore: toInt(recharge.balanceBefore),
        referenceId,
        sellerId,
        walletStatus: "active",
        walletTransactionId: existingTransactionId,
      };
      return;
    }

    const walletRef = db.collection("wallets").doc(sellerId);
    const walletSnap = await transaction.get(walletRef);
    const now = FieldValue.serverTimestamp();
    const currentWallet = walletSnap.exists
      ? (walletSnap.data() as WalletData)
      : getInitialWallet(sellerId, now);
    const balanceBefore = Math.max(0, toInt(currentWallet.balance));
    const freeOrdersRemaining = Math.max(0, toInt(currentWallet.freeOrdersRemaining));
    const balanceAfter = balanceBefore + amount;
    const walletStatus = getWalletStatus(balanceAfter, freeOrdersRemaining);
    const walletPayload = {
      sellerId,
      balance: balanceAfter,
      freeOrdersRemaining,
      totalOrdersCharged: Math.max(0, toInt(currentWallet.totalOrdersCharged)),
      totalWalletSpent: Math.max(0, toInt(currentWallet.totalWalletSpent)),
      status: walletStatus,
      emailEvents: currentWallet.emailEvents || {},
      updatedAt: now,
    };
    const walletTransactionRef = db.collection("walletTransactions").doc(`recharge_${cleanRechargeId}`);
    const walletTransactionId = walletTransactionRef.id;

    if (walletSnap.exists) {
      transaction.update(walletRef, walletPayload);
    } else {
      transaction.set(walletRef, {
        ...walletPayload,
        createdAt: now,
      });
    }

    transaction.set(walletTransactionRef, {
      sellerId,
      type: "recharge",
      amount,
      balanceBefore,
      balanceAfter,
      referenceId,
      notes: "Wallet recharge",
      createdAt: now,
    });

    transaction.update(rechargeRef, {
      status: "credited",
      balanceBefore,
      balanceAfter,
      razorpayOrderId: cleanOrderId,
      razorpayOrderStatus: verification?.orderStatus || "",
      razorpayPaymentId: verification?.paymentId || "",
      razorpayPaymentStatus: verification?.paymentStatus || "",
      walletTransactionId,
      creditedAt: now,
      completedAt: now,
      updatedAt: now,
    });

    result = {
      alreadyCredited: false,
      amount,
      balanceAfter,
      balanceBefore,
      referenceId,
      sellerId,
      walletStatus,
      walletTransactionId,
    };
  });

  if (!result) {
    throw new WalletRechargeError("Wallet recharge could not be processed.");
  }

  const storeId = await getSellerStoreId(db, result.sellerId);

  if (storeId && walletHasFunds({ balance: result.balanceAfter, freeOrdersRemaining: 0 })) {
    await db.collection("stores").doc(storeId).set(
      {
        acceptingOrders: true,
        pauseReason: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (!result.alreadyCredited) {
    await sendWalletRechargeSuccessfulEmailSafely({
      db,
      rechargeId: cleanRechargeId,
      sellerId: result.sellerId,
    });

    if (result.walletStatus === "low_balance") {
      await sendWalletStateEmailSafely({
        db,
        sellerId: result.sellerId,
        state: "low",
      });
    }
  }

  console.info("Wallet recharge payment verified.", {
    sellerId: result.sellerId,
    rechargeId: cleanRechargeId,
    amount: result.amount,
    alreadyCredited: result.alreadyCredited,
    balanceAfter: result.balanceAfter,
  });

  return {
    ...result,
    rechargeId: cleanRechargeId,
  };
}

export async function applyAdminWalletAdjustment({
  amount,
  notes,
  referenceId,
  sellerId,
  type,
}: {
  amount: number;
  notes?: string;
  referenceId?: string;
  sellerId: string;
  type: AdminAdjustmentType;
}) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new WalletRechargeError("Wallet adjustment is temporarily unavailable.", 500);
  }

  const adjustmentAmount = toInt(amount);

  if (adjustmentAmount <= 0) {
    throw new WalletRechargeError("Wallet adjustment amount must be positive.");
  }

  const cleanSellerId = sellerId.trim();

  if (!cleanSellerId) {
    throw new WalletRechargeError("sellerId is required.");
  }

  const walletTransactionRef = db.collection("walletTransactions").doc();
  let stateEmail: "low" | "empty" | "" = "";
  let balanceAfterAdjustment = 0;
  let freeOrdersRemainingAfterAdjustment = 0;

  await db.runTransaction(async (transaction) => {
    const walletRef = db.collection("wallets").doc(cleanSellerId);
    const walletSnap = await transaction.get(walletRef);
    const now = FieldValue.serverTimestamp();
    const currentWallet = walletSnap.exists
      ? (walletSnap.data() as WalletData)
      : getInitialWallet(cleanSellerId, now);
    const balanceBefore = Math.max(0, toInt(currentWallet.balance));
    const freeOrdersRemaining = Math.max(0, toInt(currentWallet.freeOrdersRemaining));
    const balanceAfter = balanceBefore + adjustmentAmount;
    const status = getWalletStatus(balanceAfter, freeOrdersRemaining);
    const walletPayload = {
      sellerId: cleanSellerId,
      balance: balanceAfter,
      freeOrdersRemaining,
      totalOrdersCharged: Math.max(0, toInt(currentWallet.totalOrdersCharged)),
      totalWalletSpent: Math.max(0, toInt(currentWallet.totalWalletSpent)),
      status,
      emailEvents: currentWallet.emailEvents || {},
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

    transaction.set(walletTransactionRef, {
      sellerId: cleanSellerId,
      type,
      amount: adjustmentAmount,
      balanceBefore,
      balanceAfter,
      referenceId: referenceId?.trim() || walletTransactionRef.id,
      notes: notes?.trim() || "Admin wallet adjustment",
      createdAt: now,
    });

    if (status === "low_balance") stateEmail = "low";
    if (status === "paused") stateEmail = "empty";
    balanceAfterAdjustment = balanceAfter;
    freeOrdersRemainingAfterAdjustment = freeOrdersRemaining;
  });

  const storeId = await getSellerStoreId(db, cleanSellerId);

  if (
    storeId &&
    walletHasFunds({
      balance: balanceAfterAdjustment,
      freeOrdersRemaining: freeOrdersRemainingAfterAdjustment,
    })
  ) {
    await db.collection("stores").doc(storeId).set(
      {
        acceptingOrders: true,
        pauseReason: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (stateEmail) {
    await sendWalletStateEmailSafely({
      db,
      sellerId: cleanSellerId,
      state: stateEmail,
    });
  }

  return walletTransactionRef.id;
}

export async function adminWalletAdjustmentHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as Record<string, unknown> | null;

  try {
    await assertAuthenticatedAdmin(req);

    const type = toText(body?.type) as AdminAdjustmentType;

    if (!["bonus", "adjustment", "refund"].includes(type)) {
      throw new WalletRechargeError("Unsupported wallet adjustment type.");
    }

    const walletTransactionId = await applyAdminWalletAdjustment({
      amount: toInt(body?.amount),
      notes: toText(body?.notes),
      referenceId: toText(body?.referenceId),
      sellerId: toText(body?.sellerId),
      type,
    });

    sendJson(res, 200, {
      success: true,
      walletTransactionId,
    });
  } catch (error) {
    const walletRechargeError =
      error instanceof WalletRechargeError
        ? error
        : new WalletRechargeError("Wallet adjustment could not be applied.");

    console.warn("Admin wallet adjustment failed.", {
      error: error instanceof Error ? error.message : "Unknown wallet adjustment error",
      code: walletRechargeError.code,
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      code: walletRechargeError.code,
      error: walletRechargeError.message,
      message: walletRechargeError.message,
      ...(walletRechargeError.details ? { details: walletRechargeError.details } : {}),
    });
  }
}

export async function walletRechargeCreateOrderHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as Record<string, unknown> | null;

  try {
    const sellerId = await getAuthenticatedSellerId(req);
    const result = await createWalletRechargeOrder({
      amount: assertRechargeAmount(body?.amount),
      sellerId,
    });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const walletRechargeError =
      error instanceof WalletRechargeError
        ? error
        : new WalletRechargeError("Wallet recharge could not be started.");

    console.warn("Wallet recharge failed.", {
      error: error instanceof Error ? error.message : "Unknown wallet recharge error",
      code: walletRechargeError.code,
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      code: walletRechargeError.code,
      error: walletRechargeError.message,
      message: walletRechargeError.message,
      ...(walletRechargeError.details ? { details: walletRechargeError.details } : {}),
    });
  }
}

export async function walletRechargeVerifyPaymentHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as Record<string, unknown> | null;

  try {
    const sellerId = await getAuthenticatedSellerId(req);
    const result = await verifyAndCreditWalletRecharge({
      rechargeId: toText(body?.rechargeId),
      razorpayOrderId: toText(body?.razorpayOrderId),
      razorpayPaymentId: toText(body?.razorpayPaymentId),
      razorpaySignature: toText(body?.razorpaySignature),
      sellerId,
    });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const walletRechargeError =
      error instanceof WalletRechargeError
        ? error
        : new WalletRechargeError("Wallet recharge payment could not be verified.");

    console.warn("Wallet recharge verification failed.", {
      error: error instanceof Error ? error.message : "Unknown wallet recharge verification error",
      code: walletRechargeError.code,
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      code: walletRechargeError.code,
      error: walletRechargeError.message,
      message: walletRechargeError.message,
      ...(walletRechargeError.details ? { details: walletRechargeError.details } : {}),
    });
  }
}
