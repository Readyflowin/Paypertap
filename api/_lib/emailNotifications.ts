import { FieldValue, type Firestore } from "firebase-admin/firestore";

import {
  type AdminSellerOnboardedPayload,
  type BookingCreatedPayload,
  getEmailTemplate,
} from "./emailTemplates.js";
import { isValidEmail, sendResendEmail } from "./resendClient.js";

const ADMIN_ONBOARDING_EMAIL = "info.paypertap@gmail.com";

type AdminDb = Firestore;

type CheckoutSessionData = {
  checkoutId?: string;
  sellerId?: string;
  storeId?: string;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  bookingAdvanceAmount?: number;
  sellerCollectAmount?: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPincode?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  emailEvents?: {
    sellerBookingSentAt?: unknown;
  };
  createdAt?: unknown;
};

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
  sellerConfirmationAdvanceType?: string;
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
  adminOnboardingEmailSentAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
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

function getVariantDetails(checkout: CheckoutSessionData) {
  const label = toText(checkout.selectedVariantLabel);
  if (label) return label;

  const options = checkout.selectedVariantOptions;
  if (!options || typeof options !== "object") return "";

  return Object.entries(options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
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

export async function sendSellerBookingEmailIfNeeded({
  checkoutId,
  db,
}: {
  checkoutId: string;
  db: AdminDb;
}) {
  const checkoutRef = db.collection("checkoutSessions").doc(checkoutId);
  const checkoutSnap = await checkoutRef.get();

  if (!checkoutSnap.exists) {
    console.warn("Seller booking email skipped: checkout session missing", { checkoutId });
    return;
  }

  const checkout = checkoutSnap.data() as CheckoutSessionData;

  if (checkout.emailEvents?.sellerBookingSentAt) {
    console.info("Seller booking email skipped: already sent", { checkoutId });
    return;
  }

  const sellerId = toText(checkout.sellerId);
  const storeId = toText(checkout.storeId);

  if (!sellerId || !storeId) {
    console.warn("Seller booking email skipped: seller/store missing", { checkoutId });
    return;
  }

  const [sellerSnap, storeSnap] = await Promise.all([
    db.collection("sellers").doc(sellerId).get(),
    db.collection("stores").doc(storeId).get(),
  ]);
  const seller = sellerSnap.exists ? (sellerSnap.data() as SellerData) : {};
  const store = storeSnap.exists ? (storeSnap.data() as StoreData) : {};
  const sellerEmail = getSellerEmail(seller, store);

  if (!sellerEmail) {
    console.warn("Seller booking email skipped: seller email missing", {
      checkoutId,
      sellerId,
      storeId,
    });
    return;
  }

  const payload: BookingCreatedPayload = {
    sellerEmail,
    storeName: toText(store.storeName) || "PayPerTap store",
    productTitle: toText(checkout.productTitle),
    productUrl: getProductUrl(store, toText(checkout.productId)),
    variantDetails: getVariantDetails(checkout),
    productPrice: toFiniteNumber(checkout.productPrice),
    bookingAdvanceAmount: toFiniteNumber(checkout.bookingAdvanceAmount, 20),
    sellerCollectAmount: toFiniteNumber(checkout.sellerCollectAmount),
    sellerConfirmationAmountPending: toFiniteNumber(
      checkout.sellerConfirmationAmountPending
    ),
    finalBalanceAfterConfirmation: toFiniteNumber(
      checkout.finalBalanceAfterConfirmation,
      toFiniteNumber(checkout.sellerCollectAmount)
    ),
    buyerName: toText(checkout.buyerName),
    buyerPhone: toText(checkout.buyerPhone),
    buyerAddress: toText(checkout.buyerAddress),
    buyerCity: toText(checkout.buyerCity),
    buyerPincode: toText(checkout.buyerPincode),
    checkoutId,
    bookingDateText: formatDateTime(checkout.createdAt),
    dashboardUrl: getDashboardUrl(),
  };
  const template = getEmailTemplate("booking_created", payload);
  const id = await sendResendEmail({
    to: sellerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  await checkoutRef.set(
    {
      emailEvents: {
        ...(checkout.emailEvents || {}),
        sellerBookingSentAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.info("Seller booking email sent", { checkoutId, sellerId, storeId, id });
}

export async function sendSellerBookingEmailSafely(input: {
  checkoutId: string;
  db: AdminDb;
}) {
  try {
    await sendSellerBookingEmailIfNeeded(input);
  } catch (error) {
    console.error("Email failed: seller booking", {
      checkoutId: input.checkoutId,
      error: safeEmailError(error),
    });
  }
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
    sellerConfirmationAdvanceType: toText(store.sellerConfirmationAdvanceType),
    sellerConfirmationAdvanceFixedAmount: store.sellerConfirmationAdvanceFixedAmount ?? null,
    sellerConfirmationAdvancePercent: store.sellerConfirmationAdvancePercent ?? null,
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
