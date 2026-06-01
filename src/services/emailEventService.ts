import type { CheckoutSession, Product, Seller, Store } from "../types/firestore";
import { auth } from "../lib/firebase";

type EmailEventType =
  | "seller_welcome"
  | "store_created"
  | "product_added"
  | "booking_created"
  | "buyer_booking_confirmation";

type EmailEventResponse = {
  success?: boolean;
  id?: string | null;
  error?: string;
};

function getAppUrl() {
  const configuredUrl = import.meta.env.VITE_APP_URL;

  if (typeof configuredUrl === "string" && configuredUrl.trim()) {
    return configuredUrl.trim().replace(/\/+$/g, "");
  }

  return window.location.origin;
}

function getPublicStoreUrl(storeSlug: string) {
  return `${getAppUrl()}/${storeSlug.replace(/^\/+/g, "")}`;
}

function getProductUrl(storeSlug: string, productId: string) {
  return `${getPublicStoreUrl(storeSlug)}/product/${productId}`;
}

async function sendEmailEvent(eventType: EmailEventType, payload: Record<string, unknown>) {
  try {
    const response = await fetch("/api/send-event-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventType, payload }),
    });

    const data = (await response.json().catch(() => ({}))) as EmailEventResponse;

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Email could not be sent.");
    }

    return true;
  } catch (error) {
    console.warn(`PayPerTap email event failed: ${eventType}`, error);
    return false;
  }
}

export function buildStoreEmailUrls(storeSlug: string, productId?: string) {
  return {
    appUrl: getAppUrl(),
    dashboardUrl: `${getAppUrl()}/dashboard`,
    onboardingStoreUrl: `${getAppUrl()}/onboarding/store`,
    onboardingProductUrl: `${getAppUrl()}/onboarding/product`,
    storeUrl: getPublicStoreUrl(storeSlug),
    productUrl: productId ? getProductUrl(storeSlug, productId) : "",
  };
}

export async function sendSellerWelcomeEmail(payload: {
  seller: Seller;
}) {
  if (!payload.seller.email) return false;

  const urls = buildStoreEmailUrls(payload.seller.storeId || "");
  return sendEmailEvent("seller_welcome", {
    sellerEmail: payload.seller.email,
    sellerName: payload.seller.name,
    ctaUrl: urls.onboardingStoreUrl,
  });
}

export async function sendStoreCreatedEmail(payload: {
  seller: Seller;
  store: Store;
}) {
  if (!payload.seller.email) return false;

  const storeSlug = payload.store.storeSlug || payload.store.storeId;
  const urls = buildStoreEmailUrls(storeSlug);
  return sendEmailEvent("store_created", {
    sellerEmail: payload.seller.email,
    sellerName: payload.seller.name,
    storeName: payload.store.storeName,
    storeUrl: urls.storeUrl,
    productUrl: urls.onboardingProductUrl,
  });
}

export async function sendProductAddedEmail(payload: {
  sellerEmail: string;
  product: Product;
  storeSlug: string;
}) {
  if (!payload.sellerEmail) return false;

  const productId = payload.product.productId || payload.product.id;
  const urls = buildStoreEmailUrls(payload.storeSlug, productId);
  return sendEmailEvent("product_added", {
    sellerEmail: payload.sellerEmail,
    productTitle: payload.product.title,
    price: payload.product.price,
    bookingAdvanceAmount: payload.product.bookingAdvanceAmount,
    sellerCollectAmount: payload.product.sellerCollectAmount,
    productUrl: urls.productUrl,
    storeUrl: urls.storeUrl,
  });
}

export async function sendBookingCreatedEmail(payload: {
  sellerEmail: string;
  checkoutSession: CheckoutSession;
}) {
  if (!payload.sellerEmail) return false;

  const urls = buildStoreEmailUrls("");
  return sendEmailEvent("booking_created", {
    sellerEmail: payload.sellerEmail,
    productTitle: payload.checkoutSession.productTitle,
    productPrice: payload.checkoutSession.productPrice,
    bookingAdvanceAmount: payload.checkoutSession.bookingAdvanceAmount,
    sellerCollectAmount: payload.checkoutSession.sellerCollectAmount,
    buyerName: payload.checkoutSession.buyerName,
    buyerPhone: payload.checkoutSession.buyerPhone,
    buyerCity: payload.checkoutSession.buyerCity,
    buyerPincode: payload.checkoutSession.buyerPincode,
    dashboardUrl: urls.dashboardUrl,
  });
}

export async function sendBuyerBookingConfirmationEmail(payload: {
  buyerEmail?: string;
  checkoutSession: CheckoutSession;
  store?: Store | null;
  whatsappUrl?: string;
}) {
  if (!payload.buyerEmail) {
    // TODO: buyer confirmation email requires buyer email field.
    return false;
  }

  return sendEmailEvent("buyer_booking_confirmation", {
    buyerEmail: payload.buyerEmail,
    buyerName: payload.checkoutSession.buyerName,
    storeName: payload.store?.storeName,
    productTitle: payload.checkoutSession.productTitle,
    productPrice: payload.checkoutSession.productPrice,
    bookingAdvanceAmount: payload.checkoutSession.bookingAdvanceAmount,
    sellerCollectAmount: payload.checkoutSession.sellerCollectAmount,
    whatsappUrl: payload.whatsappUrl,
  });
}

export async function sendAdminSellerOnboardingEmail(payload: {
  storeId: string;
}) {
  try {
    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) return false;

    const response = await fetch("/api/send-admin-onboarding-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeId: payload.storeId }),
    });
    const data = (await response.json().catch(() => ({}))) as EmailEventResponse;

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Admin onboarding email could not be sent.");
    }

    return true;
  } catch (error) {
    console.warn("PayPerTap admin onboarding email failed:", error);
    return false;
  }
}
