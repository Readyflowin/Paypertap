import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminAuthIfConfigured,
  getAdminDbIfConfigured,
} from "./firebaseAdmin.js";
import {
  FREE_ORDER_COUNT,
  LOW_BALANCE_THRESHOLD,
  ORDER_CHARGE,
} from "../../src/config/wallet.js";

type JsonResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

type WalletStatus = "active" | "low_balance" | "empty" | "paused";

type WalletData = {
  sellerId?: string;
  balance?: number;
  freeOrdersRemaining?: number;
  totalOrdersCharged?: number;
  totalWalletSpent?: number;
  status?: WalletStatus;
  emailEvents?: Record<string, unknown>;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type WalletTransactionData = {
  sellerId?: string;
  type?: string;
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  createdAt?: unknown;
};

class WalletReconcileError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "WalletReconcileError";
    this.statusCode = statusCode;
  }
}

function sendJson(res: JsonResponse, statusCode: number, body: unknown) {
  res.setHeader?.("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value: unknown, fallback = 0) {
  const valueAsNumber = Number(value);

  return Number.isFinite(valueAsNumber) ? Math.max(0, Math.trunc(valueAsNumber)) : fallback;
}

function getTimestampMillis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return 0;
}

function getBearerToken(req: { headers?: Record<string, unknown> }) {
  const header = toText(req.headers?.authorization || req.headers?.Authorization);
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || "";
}

async function getAuthenticatedSellerId(req: { headers?: Record<string, unknown> }) {
  const auth = getAdminAuthIfConfigured();

  if (!auth) {
    throw new WalletReconcileError("Wallet repair is temporarily unavailable.", 500);
  }

  const token = getBearerToken(req);

  if (!token) {
    throw new WalletReconcileError("Please sign in to refresh wallet balance.", 401);
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new WalletReconcileError("Please sign in to refresh wallet balance.", 401);
  }
}

function getWalletStatus(balance: number, freeOrdersRemaining: number): WalletStatus {
  if (freeOrdersRemaining > 0 || balance >= LOW_BALANCE_THRESHOLD) return "active";
  if (balance >= ORDER_CHARGE) return "low_balance";

  return "paused";
}

function walletHasFunds(wallet: Pick<WalletData, "balance" | "freeOrdersRemaining">) {
  return (
    toInt(wallet.freeOrdersRemaining) > 0 ||
    toInt(wallet.balance) >= ORDER_CHARGE
  );
}

async function getSellerStoreId(db: Firestore, sellerId: string) {
  const sellerSnap = await db.collection("sellers").doc(sellerId).get();
  const seller = sellerSnap.exists ? (sellerSnap.data() as { storeId?: string }) : {};

  return toText(seller.storeId);
}

function serializeWallet(
  sellerId: string,
  wallet: WalletData,
  balance: number,
  freeOrdersRemaining: number,
  status: WalletStatus
) {
  return {
    sellerId,
    balance,
    freeOrdersRemaining,
    totalOrdersCharged: toInt(wallet.totalOrdersCharged),
    totalWalletSpent: toInt(wallet.totalWalletSpent),
    status,
    emailEvents: wallet.emailEvents || {},
    createdAt: wallet.createdAt || null,
    updatedAt: wallet.updatedAt || null,
  };
}

async function findLatestTransactionBalanceAfter(db: Firestore, sellerId: string) {
  const transactionsSnap = await db
    .collection("walletTransactions")
    .where("sellerId", "==", sellerId)
    .get();

  return transactionsSnap.docs
    .map((docSnap) => docSnap.data() as WalletTransactionData)
    .filter((transaction) => toText(transaction.type) && transaction.balanceAfter !== undefined)
    .sort(
      (a, b) =>
        getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
    )
    .find((transaction) => toInt(transaction.balanceAfter) > 0);
}

export async function reconcileSellerWalletFromTransactions(
  sellerId: string,
  db: Firestore
) {
  const walletRef = db.collection("wallets").doc(sellerId);
  const walletSnap = await walletRef.get();
  const wallet = walletSnap.exists ? (walletSnap.data() as WalletData) : {};
  const currentBalance = toInt(wallet.balance);
  const freeOrdersRemaining = walletSnap.exists
    ? toInt(wallet.freeOrdersRemaining)
    : FREE_ORDER_COUNT;
  const latestTransaction = await findLatestTransactionBalanceAfter(db, sellerId);
  const latestTransactionBalanceAfter = toInt(latestTransaction?.balanceAfter);
  const targetBalance = Math.max(currentBalance, latestTransactionBalanceAfter);
  const targetStatus = getWalletStatus(targetBalance, freeOrdersRemaining);
  const now = FieldValue.serverTimestamp();
  let repaired = false;

  if (!walletSnap.exists || targetBalance > currentBalance || wallet.status !== targetStatus) {
    repaired = !walletSnap.exists || targetBalance > currentBalance;
    const walletPayload = {
      sellerId,
      balance: targetBalance,
      freeOrdersRemaining,
      totalOrdersCharged: toInt(wallet.totalOrdersCharged),
      totalWalletSpent: toInt(wallet.totalWalletSpent),
      status: targetStatus,
      emailEvents: wallet.emailEvents || {},
      updatedAt: now,
    };

    if (walletSnap.exists) {
      await walletRef.update(walletPayload);
    } else {
      await walletRef.set({
        ...walletPayload,
        createdAt: now,
      });
    }
  }

  if (walletHasFunds({ balance: targetBalance, freeOrdersRemaining })) {
    const storeId = await getSellerStoreId(db, sellerId);

    if (storeId) {
      await db.collection("stores").doc(storeId).set(
        {
          acceptingOrders: true,
          pauseReason: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return {
    repaired,
    wallet: serializeWallet(
      sellerId,
      wallet,
      targetBalance,
      freeOrdersRemaining,
      targetStatus
    ),
  };
}

export async function walletReconcileHandler(
  req: { method?: string; headers?: Record<string, unknown> },
  res: JsonResponse
) {
  loadLocalEnv();

  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed." });
    return;
  }

  try {
    const sellerId = await getAuthenticatedSellerId(req);
    const db = getAdminDbIfConfigured();

    if (!db) {
      throw new WalletReconcileError("Wallet repair is temporarily unavailable.", 500);
    }

    const result = await reconcileSellerWalletFromTransactions(sellerId, db);

    sendJson(res, 200, {
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode =
      error instanceof WalletReconcileError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Wallet repair failed.";

    sendJson(res, statusCode, {
      success: false,
      error: message,
    });
  }
}
