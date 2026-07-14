import { FieldValue, type Firestore } from "firebase-admin/firestore";

import {
  type AdminSellerOnboardedPayload,
  type WalletRechargeSuccessfulPayload,
  type WalletStatePayload,
  getEmailTemplate,
} from "./emailTemplates.js";
import { isValidEmail, sendResendEmail } from "./resendClient.js";

const ADMIN_ONBOARDING_EMAIL = "info.paypertap@gmail.com";

type AdminDb = Firestore;

type SellerData = {
  sellerId?: string;
  authUid?: string;
  name?: string;
  email?: string;
  phone?: string;
  storeId?: string;
};

type StoreData = {
  storeId?: string;
  sellerId?: string;
  storeSlug?: string;
  storeName?: string;
  supportEmail?: string;
  phone?: string;
  whatsappPhone?: string;
  adminOnboardingEmailSentAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type WalletData = {
  balance?: number;
  freeOrdersRemaining?: number;
  emailEvents?: {
    lowWalletSentAt?: unknown;
    walletEmptySentAt?: unknown;
  };
};

type WalletRechargeData = {
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  emailEvents?: {
    rechargeSuccessfulSentAt?: unknown;
  };
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toFiniteNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getTimestampDate(value: unknown): Date {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
}

function formatDateTime(value: unknown) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(getTimestampDate(value));
}

function getAppUrl() {
  const configured =
    process.env.PAYPERTAP_APP_URL ||
    process.env.VITE_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://www.paypertap.in";
  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;

  return withProtocol.replace(/\/+$/g, "");
}

function getStoreUrl(store: StoreData) {
  const slug = toText(store.storeSlug) || toText(store.storeId);
  return `${getAppUrl()}/${slug.replace(/^\/+/g, "")}`;
}

function getProductUrl(store: StoreData, productId: string) {
  return `${getStoreUrl(store)}/product/${productId.replace(/^\/+/g, "")}`;
}

function getDashboardUrl() {
  return `${getAppUrl()}/dashboard`;
}

function getSellerEmail(seller: SellerData, store: StoreData) {
  const sellerRecord = seller as Record<string, unknown>;
  const candidates = [
    seller.email,
    store.supportEmail,
    sellerRecord.authEmail,
    sellerRecord.profileEmail,
    sellerRecord.userEmail,
  ];

  for (const candidate of candidates) {
    const email = toText(candidate).toLowerCase();
    if (email && isValidEmail(email)) return email;
  }

  return "";
}

function safeEmailError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown email error";
}

export async function sendAdminSellerOnboardedEmailIfNeeded({
  db,
  sellerId,
  storeId,
}: {
  db: AdminDb;
  sellerId: string;
  storeId: string;
}) {
  const storeRef = db.collection("stores").doc(storeId);
  const [sellerSnap, storeSnap] = await Promise.all([
    db.collection("sellers").doc(sellerId).get(),
    storeRef.get(),
  ]);

  if (!sellerSnap.exists || !storeSnap.exists) {
    throw new Error("Seller or store was not found.");
  }

  const seller = sellerSnap.data() as SellerData;
  const store = storeSnap.data() as StoreData;

  if (store.sellerId !== sellerId || seller.storeId !== storeId) {
    throw new Error("Seller/store ownership mismatch.");
  }

  if (store.adminOnboardingEmailSentAt) {
    console.info("Admin seller onboarding email skipped: already sent", {
      sellerId,
      storeId,
    });
    return;
  }

  const payload: AdminSellerOnboardedPayload = {
    sellerName: toText(seller.name),
    sellerEmail: toText(seller.email),
    sellerPhone: toText(seller.phone) || toText(store.whatsappPhone) || toText(store.phone),
    storeName: toText(store.storeName) || storeId,
    storeSlug: toText(store.storeSlug) || storeId,
    storeUrl: getStoreUrl(store),
    createdAtText: formatDateTime(store.createdAt || store.updatedAt),
    sellerId,
    storeId,
  };
  const template = getEmailTemplate("admin_seller_onboarded", payload);
  const id = await sendResendEmail({
    to: ADMIN_ONBOARDING_EMAIL,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  await storeRef.set(
    {
      adminOnboardingEmailSentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.info("Admin seller onboarding email sent", { sellerId, storeId, id });
}

async function getWalletSellerContext({
  db,
  sellerId,
}: {
  db: AdminDb;
  sellerId: string;
}) {
  const sellerSnap = await db.collection("sellers").doc(sellerId).get();
  const seller = sellerSnap.exists ? (sellerSnap.data() as SellerData) : {};
  const storeId = toText(seller.storeId);
  const storeSnap = storeId ? await db.collection("stores").doc(storeId).get() : null;
  const store = storeSnap?.exists ? (storeSnap.data() as StoreData) : {};
  const sellerEmail = getSellerEmail(seller, store);

  return { seller, store, sellerEmail };
}

export async function sendWalletRechargeSuccessfulEmailIfNeeded({
  db,
  rechargeId,
  sellerId,
}: {
  db: AdminDb;
  rechargeId: string;
  sellerId: string;
}) {
  const rechargeRef = db.collection("walletRecharges").doc(rechargeId);
  const rechargeSnap = await rechargeRef.get();

  if (!rechargeSnap.exists) {
    console.warn("Wallet recharge email skipped: recharge missing", { rechargeId });
    return;
  }

  const recharge = rechargeSnap.data() as WalletRechargeData;

  if (recharge.emailEvents?.rechargeSuccessfulSentAt) {
    console.info("Wallet recharge email skipped: already sent", { rechargeId });
    return;
  }

  const { seller, sellerEmail } = await getWalletSellerContext({ db, sellerId });

  if (!sellerEmail) {
    console.warn("Wallet recharge email skipped: seller email missing", {
      rechargeId,
      sellerId,
    });
    return;
  }

  const payload: WalletRechargeSuccessfulPayload = {
    sellerEmail,
    sellerName: toText(seller.name),
    amount: toFiniteNumber(recharge.amount),
    balanceBefore: toFiniteNumber(recharge.balanceBefore),
    balanceAfter: toFiniteNumber(recharge.balanceAfter),
    referenceId: toText(recharge.referenceId) || rechargeId,
    dashboardUrl: getDashboardUrl(),
  };
  const template = getEmailTemplate("wallet_recharge_successful", payload);
  const id = await sendResendEmail({
    to: sellerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  await rechargeRef.set(
    {
      emailEvents: {
        ...(recharge.emailEvents || {}),
        rechargeSuccessfulSentAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.info("Wallet recharge email sent", { rechargeId, sellerId, id });
}

export async function sendWalletRechargeSuccessfulEmailSafely(input: {
  db: AdminDb;
  rechargeId: string;
  sellerId: string;
}) {
  try {
    await sendWalletRechargeSuccessfulEmailIfNeeded(input);
  } catch (error) {
    console.error("Email failed: wallet recharge successful", {
      rechargeId: input.rechargeId,
      sellerId: input.sellerId,
      error: safeEmailError(error),
    });
  }
}

export async function sendWalletStateEmailIfNeeded({
  db,
  sellerId,
  state,
}: {
  db: AdminDb;
  sellerId: string;
  state: "low" | "empty";
}) {
  const walletRef = db.collection("wallets").doc(sellerId);
  const walletSnap = await walletRef.get();

  if (!walletSnap.exists) {
    console.warn("Wallet state email skipped: wallet missing", { sellerId, state });
    return;
  }

  const wallet = walletSnap.data() as WalletData;
  const eventField = state === "low" ? "lowWalletSentAt" : "walletEmptySentAt";

  if (wallet.emailEvents?.[eventField]) {
    console.info("Wallet state email skipped: already sent", { sellerId, state });
    return;
  }

  const { seller, sellerEmail } = await getWalletSellerContext({ db, sellerId });

  if (!sellerEmail) {
    console.warn("Wallet state email skipped: seller email missing", { sellerId, state });
    return;
  }

  const payload: WalletStatePayload = {
    sellerEmail,
    sellerName: toText(seller.name),
    balance: toFiniteNumber(wallet.balance),
    freeOrdersRemaining: toFiniteNumber(wallet.freeOrdersRemaining),
    dashboardUrl: getDashboardUrl(),
  };
  const template = getEmailTemplate(state === "low" ? "wallet_low" : "wallet_empty", payload);
  const id = await sendResendEmail({
    to: sellerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  await walletRef.set(
    {
      emailEvents: {
        ...(wallet.emailEvents || {}),
        [eventField]: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.info("Wallet state email sent", { sellerId, state, id });
}

export async function sendWalletStateEmailSafely(input: {
  db: AdminDb;
  sellerId: string;
  state: "low" | "empty";
}) {
  try {
    await sendWalletStateEmailIfNeeded(input);
  } catch (error) {
    console.error("Email failed: wallet state", {
      sellerId: input.sellerId,
      state: input.state,
      error: safeEmailError(error),
    });
  }
}
