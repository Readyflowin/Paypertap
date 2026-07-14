import { randomBytes } from "node:crypto";
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

const INITIAL_FREE_ORDERS = FREE_ORDER_COUNT;
const WALLET_ORDER_CHARGE_AMOUNT = ORDER_CHARGE;
const MIN_RECHARGE_AMOUNT = WALLET_RECHARGE_MIN_AMOUNT;
const MAX_RECHARGE_AMOUNT = WALLET_RECHARGE_MAX_AMOUNT;

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type WalletStatus = "active" | "low_balance" | "empty" | "paused";
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
  token?: string;
  status?: RechargeStatus;
  paymentProvider?: "razorpay";
  paymentLink?: string;
  returnUrl?: string;
  referenceId?: string;
  walletTransactionId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  creditedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type SellerData = {
  storeId?: string;
};

class WalletRechargeError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "WalletRechargeError";
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

function getAppUrl(req?: { headers?: Record<string, unknown> }) {
  const configured =
    process.env.PAYPERTAP_APP_URL ||
    process.env.VITE_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";
  const host = toText(req?.headers?.["x-forwarded-host"] || req?.headers?.host);
  const protocol = toText(req?.headers?.["x-forwarded-proto"]) || "https";
  const base = configured || (host ? `${protocol}://${host}` : "https://www.paypertap.in");
  const withProtocol = /^https?:\/\//i.test(base) ? base : `https://${base}`;

  return withProtocol.replace(/\/+$/g, "");
}

function getConfiguredRechargePaymentLink() {
  return (
    toText(process.env.PAYPERTAP_WALLET_RECHARGE_PAYMENT_LINK) ||
    toText(process.env.VITE_PAYPERTAP_WALLET_RECHARGE_PAYMENT_LINK)
  );
}

function buildRechargePaymentLink({
  amount,
  rechargeId,
  referenceId,
  returnUrl,
  token,
}: {
  amount: number;
  rechargeId: string;
  referenceId: string;
  returnUrl: string;
  token: string;
}) {
  const configuredLink = getConfiguredRechargePaymentLink();

  if (!configuredLink) {
    throw new WalletRechargeError("Wallet recharge payment link is not configured.", 500);
  }

  const replacements: Record<string, string> = {
    AMOUNT: String(amount),
    AMOUNT_PAISE: String(amount * 100),
    RECHARGE_ID: rechargeId,
    REFERENCE: referenceId,
    RETURN_URL: returnUrl,
    TOKEN: token,
  };
  let link = configuredLink;

  for (const [key, value] of Object.entries(replacements)) {
    link = link.replaceAll(`{${key}}`, encodeURIComponent(value));
  }

  try {
    const url = new URL(link);

    if (!configuredLink.includes("{RETURN_URL}")) {
      url.searchParams.set("return_url", returnUrl);
    }
    if (!configuredLink.includes("{AMOUNT}")) {
      url.searchParams.set("amount", String(amount));
    }
    if (!configuredLink.includes("{REFERENCE}")) {
      url.searchParams.set("reference_id", referenceId);
    }

    return url.toString();
  } catch {
    throw new WalletRechargeError("Wallet recharge payment link is invalid.", 500);
  }
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

function createToken() {
  return randomBytes(32).toString("hex");
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

export async function createWalletRecharge({
  amount,
  req,
  sellerId,
}: {
  amount: number;
  req?: { headers?: Record<string, unknown> };
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
  const rechargeRef = db.collection("walletRecharges").doc();
  const rechargeId = rechargeRef.id;
  const token = createToken();
  const referenceId = `PPT-WALLET-${rechargeId.slice(0, 8).toUpperCase()}`;
  const returnUrl = `${getAppUrl(req)}/wallet/recharge-return/${token}`;
  const paymentLink = buildRechargePaymentLink({
    amount: rechargeAmount,
    rechargeId,
    referenceId,
    returnUrl,
    token,
  });
  const now = FieldValue.serverTimestamp();

  await rechargeRef.set({
    rechargeId,
    sellerId: cleanSellerId,
    amount: rechargeAmount,
    token,
    status: "pending",
    paymentProvider: "razorpay",
    paymentLink,
    returnUrl,
    referenceId,
    createdAt: now,
    updatedAt: now,
  });

  console.info("Wallet recharge session created.", {
    sellerId: cleanSellerId,
    rechargeId,
    amount: rechargeAmount,
  });

  return {
    amount: rechargeAmount,
    paymentLink,
    rechargeId,
    referenceId,
    returnUrl,
    token,
  };
}

export async function creditWalletRecharge({ token }: { token: string }) {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new WalletRechargeError("Wallet recharge return is temporarily unavailable.", 500);
  }

  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 32) {
    throw new WalletRechargeError("Invalid wallet recharge return link.");
  }

  const rechargeSnap = await db
    .collection("walletRecharges")
    .where("token", "==", cleanToken)
    .limit(1)
    .get();

  if (rechargeSnap.empty) {
    throw new WalletRechargeError("Invalid wallet recharge return link.");
  }

  const rechargeDoc = rechargeSnap.docs[0];
  const rechargeId = rechargeDoc.id;
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
    const rechargeRef = db.collection("walletRecharges").doc(rechargeId);
    const currentRechargeSnap = await transaction.get(rechargeRef);

    if (!currentRechargeSnap.exists) {
      throw new WalletRechargeError("Invalid wallet recharge return link.");
    }

    const recharge = currentRechargeSnap.data() as WalletRechargeData;
    const sellerId = toText(recharge.sellerId);
    const amount = assertRechargeAmount(recharge.amount);
    const referenceId = toText(recharge.referenceId) || `PPT-WALLET-${rechargeId}`;
    const existingTransactionId = toText(recharge.walletTransactionId);

    if (!sellerId) {
      throw new WalletRechargeError("Invalid wallet recharge return link.");
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
    const walletTransactionRef = db.collection("walletTransactions").doc(`recharge_${rechargeId}`);
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
      walletTransactionId,
      creditedAt: now,
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
      rechargeId,
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

  console.info("Wallet recharge return processed.", {
    sellerId: result.sellerId,
    rechargeId,
    amount: result.amount,
    alreadyCredited: result.alreadyCredited,
    balanceAfter: result.balanceAfter,
  });

  return {
    ...result,
    rechargeId,
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
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      error: walletRechargeError.message,
    });
  }
}

export async function walletRechargeHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as Record<string, unknown> | null;

  try {
    const sellerId = await getAuthenticatedSellerId(req);
    const result = await createWalletRecharge({
      amount: assertRechargeAmount(body?.amount),
      req,
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
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      error: walletRechargeError.message,
    });
  }
}

export async function walletRechargeReturnHandler(req: any, res: JsonResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  loadLocalEnv();

  const body = getRequestBody(req) as Record<string, unknown> | null;

  try {
    const result = await creditWalletRecharge({ token: toText(body?.token) });

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const walletRechargeError =
      error instanceof WalletRechargeError
        ? error
        : new WalletRechargeError("Wallet recharge return could not be processed.");

    console.warn("Wallet recharge return failed.", {
      error: error instanceof Error ? error.message : "Unknown wallet recharge return error",
    });
    sendJson(res, walletRechargeError.statusCode, {
      success: false,
      error: walletRechargeError.message,
    });
  }
}
