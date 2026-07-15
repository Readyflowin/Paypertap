import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { CheckoutSession } from "../types/firestore";
import {
  FREE_ORDER_COUNT,
  LOW_BALANCE_THRESHOLD,
  ORDER_CHARGE,
  WALLET_RECHARGE_AMOUNTS,
  WALLET_RECHARGE_MAX_AMOUNT,
  WALLET_RECHARGE_MIN_AMOUNT,
} from "../config/wallet";
import type { StorePaymentMode } from "./storeService";

export type WalletStatus = "active" | "low_balance" | "empty" | "paused";

export type SellerWallet = {
  sellerId: string;
  balance: number;
  freeOrdersRemaining: number;
  totalOrdersCharged: number;
  totalWalletSpent: number;
  status: WalletStatus;
  emailEvents?: {
    lowWalletSentAt?: unknown;
    walletEmptySentAt?: unknown;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type WalletTransactionType =
  | "recharge"
  | "free_order"
  | "order_charge"
  | "bonus"
  | "adjustment"
  | "refund";

export type CreateChargeableOrderInput = {
  sellerId: string;
  storeId: string;
  productId: string;
  productTitle?: string;
  productPrice?: number;
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

export type CreateChargeableOrderResult = {
  orderId: string;
  order: CheckoutSession;
  paymentMode: StorePaymentMode;
  paymentLink: string;
  paymentRedirectUrl: string;
  paymentReturnUrl: string;
};

export type WalletTransaction = {
  sellerId: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  notes?: string;
  createdAt?: unknown;
};

export type WalletTransactionRecord = WalletTransaction & {
  transactionId: string;
};

export const INITIAL_FREE_ORDERS = FREE_ORDER_COUNT;
export const WALLET_ORDER_CHARGE_AMOUNT = ORDER_CHARGE;
export const WALLET_LOW_BALANCE_THRESHOLD = LOW_BALANCE_THRESHOLD;
export {
  WALLET_RECHARGE_AMOUNTS,
  WALLET_RECHARGE_MAX_AMOUNT,
  WALLET_RECHARGE_MIN_AMOUNT,
};
const WALLET_COLLECTION = "wallets";
const WALLET_TRANSACTION_COLLECTION = "walletTransactions";

export type WalletRechargeStartResult = {
  amount: number;
  paymentLink: string;
  rechargeId: string;
  referenceId: string;
  returnUrl: string;
  token: string;
};

export type WalletRechargeReturnResult = {
  alreadyCredited: boolean;
  amount: number;
  balanceAfter: number;
  balanceBefore: number;
  rechargeId: string;
  referenceId: string;
  sellerId: string;
  walletStatus: WalletStatus;
  walletTransactionId: string;
};

export type WalletReconcileResult = {
  repaired: boolean;
  wallet: SellerWallet;
};

function assertSellerId(sellerId: string) {
  const normalizedSellerId = sellerId.trim();

  if (!normalizedSellerId) {
    throw new Error("sellerId is required.");
  }

  return normalizedSellerId;
}

function assertRechargeAmount(amount: number): number {
  const normalizedAmount = Math.round(Number(amount) || 0);

  if (
    normalizedAmount < WALLET_RECHARGE_MIN_AMOUNT ||
    normalizedAmount > WALLET_RECHARGE_MAX_AMOUNT
  ) {
    throw new Error("Recharge amount must be between ₹100 and ₹25,000.");
  }

  return normalizedAmount;
}

function walletDoc(sellerId: string) {
  return doc(db, WALLET_COLLECTION, assertSellerId(sellerId));
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

export async function initializeWallet(sellerId: string): Promise<SellerWallet> {
  const normalizedSellerId = assertSellerId(sellerId);

  if (auth.currentUser?.uid !== normalizedSellerId) {
    throw new Error("Please sign in before loading wallet.");
  }

  const result = await reconcileWalletFromActivity();
  return result.wallet;
}

export async function getWallet(sellerId: string): Promise<SellerWallet> {
  const walletRef = walletDoc(sellerId);
  const walletSnap = await getDoc(walletRef);

  if (walletSnap.exists()) {
    return walletSnap.data() as SellerWallet;
  }

  return initializeWallet(sellerId);
}

export async function getWalletTransactions(
  sellerId: string
): Promise<WalletTransactionRecord[]> {
  const normalizedSellerId = assertSellerId(sellerId);
  const transactionsQuery = query(
    collection(db, WALLET_TRANSACTION_COLLECTION),
    where("sellerId", "==", normalizedSellerId)
  );
  const transactionsSnap = await getDocs(transactionsQuery);

  return transactionsSnap.docs
    .map((transactionDoc) => ({
      ...(transactionDoc.data() as WalletTransaction),
      transactionId: transactionDoc.id,
    }))
    .sort(
      (a, b) =>
        getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
    );
}

export function walletHasFunds(
  wallet: Pick<SellerWallet, "balance" | "freeOrdersRemaining">
): boolean {
  return (
    wallet.freeOrdersRemaining > 0 || wallet.balance >= WALLET_ORDER_CHARGE_AMOUNT
  );
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Please sign in before recharging wallet.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function startWalletRecharge(
  amount: number
): Promise<WalletRechargeStartResult> {
  const rechargeAmount = assertRechargeAmount(amount);
  const response = await fetch("/api/wallet-recharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ amount: rechargeAmount }),
  });
  const payload = (await response.json().catch(() => null)) as
    | (Partial<WalletRechargeStartResult> & { success?: boolean; error?: string })
    | null;

  if (
    !response.ok ||
    !payload?.success ||
    !payload.paymentLink ||
    !payload.rechargeId ||
    !payload.token
  ) {
    throw new Error(payload?.error || "Wallet recharge could not be started.");
  }

  return {
    amount: Number(payload.amount || rechargeAmount),
    paymentLink: payload.paymentLink,
    rechargeId: payload.rechargeId,
    referenceId: payload.referenceId || payload.rechargeId,
    returnUrl: payload.returnUrl || "",
    token: payload.token,
  };
}

export async function processWalletRechargeReturn(
  token: string
): Promise<WalletRechargeReturnResult> {
  const response = await fetch("/api/wallet-recharge-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = (await response.json().catch(() => null)) as
    | (Partial<WalletRechargeReturnResult> & { success?: boolean; error?: string })
    | null;

  if (
    !response.ok ||
    !payload?.success ||
    !payload.rechargeId ||
    !payload.sellerId ||
    !payload.walletTransactionId
  ) {
    throw new Error(payload?.error || "Wallet recharge return could not be processed.");
  }

  return {
    alreadyCredited: payload.alreadyCredited === true,
    amount: Number(payload.amount || 0),
    balanceAfter: Number(payload.balanceAfter || 0),
    balanceBefore: Number(payload.balanceBefore || 0),
    rechargeId: payload.rechargeId,
    referenceId: payload.referenceId || payload.rechargeId,
    sellerId: payload.sellerId,
    walletStatus: payload.walletStatus || "active",
    walletTransactionId: payload.walletTransactionId,
  };
}

export async function reconcileWalletFromActivity(): Promise<WalletReconcileResult> {
  const response = await fetch("/api/wallet-reconcile", {
    method: "POST",
    headers: await getAuthHeader(),
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        success?: boolean;
        repaired?: boolean;
        wallet?: SellerWallet;
        error?: string;
      }
    | null;

  if (!response.ok || !payload?.success || !payload.wallet) {
    throw new Error(payload?.error || "Wallet balance could not be refreshed.");
  }

  return {
    repaired: payload.repaired === true,
    wallet: payload.wallet,
  };
}

type CreateChargeableOrderApiResponse = {
  success?: boolean;
  error?: string;
  debug?: unknown;
  orderId?: string;
  order?: CheckoutSession;
  paymentMode?: StorePaymentMode;
  paymentLink?: string;
  paymentRedirectUrl?: string;
  paymentReturnUrl?: string;
};

function normalizeBuyerPhone(phone: string): string {
  const normalizedPhone = normalizeIndianMobileInput(phone);

  return normalizedPhone.localNumber || phone.replace(/[^\d]/g, "");
}

export async function createChargeableOrder(
  input: CreateChargeableOrderInput
): Promise<CreateChargeableOrderResult> {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      buyerPhone: normalizeBuyerPhone(input.buyerPhone),
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | CreateChargeableOrderApiResponse
    | null;

  if (!response.ok || !payload?.success || !payload.orderId || !payload.order) {
    if (payload?.debug) {
      console.error("Order creation API debug:", payload.debug);
    }

    throw new Error(payload?.error || "Order service did not return a valid response.");
  }

  return {
    orderId: payload.orderId,
    order: payload.order,
    paymentMode: payload.paymentMode || payload.order.paymentMode || "cod",
    paymentLink: payload.paymentLink || payload.order.paymentLink || "",
    paymentRedirectUrl:
      payload.paymentRedirectUrl ||
      payload.order.paymentRedirectUrl ||
      payload.paymentLink ||
      payload.order.paymentLink ||
      "",
    paymentReturnUrl: payload.paymentReturnUrl || payload.order.paymentReturnUrl || "",
  };
}
