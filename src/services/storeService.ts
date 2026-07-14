import {
  doc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getDurableImageUrl } from "../lib/imageUrls";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { Store, StoreSlugReservation } from "../types/firestore";

export type StorePaymentMode = "cod" | "partial_advance";
export type StorePaymentProvider = "razorpay";

export type StorePaymentSettings = {
  paymentMode: StorePaymentMode;
  advanceAmount: number;
  paymentProvider: StorePaymentProvider;
  paymentLink: string;
  paymentReturnToken: string;
};

export type StorePaymentSettingsInput = {
  paymentMode: StorePaymentMode;
  advanceAmount?: number;
  paymentLink?: string;
};

const DEFAULT_PAYMENT_MODE: StorePaymentMode = "cod";
const DEFAULT_PAYMENT_PROVIDER: StorePaymentProvider = "razorpay";
const DEFAULT_ADVANCE_AMOUNT = 100;

export type StoreCustomizationInput = {
  storeName?: string;
  bio?: string;
  phone?: string;
  whatsappPhone?: string;
  instagramProfile?: string;
  ownerName?: string;
  supportEmail?: string;
  supportPhone?: string;
  returnsPolicyType?: Store["returnsPolicyType"];
  returnsPolicyNotes?: string;
  logoUrl?: string;
  logoKey?: string;
  heroHeading?: string;
  heroTitle?: string;
  heroImageUrl?: string;
  heroImageKey?: string;
  heroSubtitle?: string;
  heroEyebrowText?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
  announcementText?: string;
  themeStyle?: string;
  primaryColor?: string;
  accentColor?: string;
};

function normalizePaymentMode(value: unknown): StorePaymentMode {
  return value === "partial_advance" ? "partial_advance" : "cod";
}

function normalizeAdvanceAmount(value: unknown): number {
  const amount = Math.round(Number(value) || DEFAULT_ADVANCE_AMOUNT);

  return Math.max(1, amount);
}

function isRazorpayPaymentLink(value: string): boolean {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();

  return (
    url.protocol === "https:" &&
    (hostname === "rzp.io" ||
      hostname === "razorpay.com" ||
      hostname.endsWith(".razorpay.com"))
  );
}

async function ensureStorePaymentReturnToken(storeId: string): Promise<string> {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Please sign in before saving payment settings.");
  }

  const response = await fetch("/api/store-payment-token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    paymentReturnToken?: string;
    error?: string;
  };

  if (!response.ok || !data.success || !data.paymentReturnToken) {
    throw new Error(data.error || "Could not prepare payment return link.");
  }

  return data.paymentReturnToken;
}

function normalizeStorePaymentSettings(store: Store): StorePaymentSettings {
  return {
    paymentMode: normalizePaymentMode(store.paymentMode),
    advanceAmount: normalizeAdvanceAmount(store.advanceAmount),
    paymentProvider: DEFAULT_PAYMENT_PROVIDER,
    paymentLink: store.paymentLink?.trim() || "",
    paymentReturnToken: store.paymentReturnToken?.trim() || "",
  };
}

export async function getStorePaymentSettings(
  storeId: string
): Promise<StorePaymentSettings> {
  const storeRef = doc(db, "stores", storeId);
  const storeSnap = await getDoc(storeRef);

  if (!storeSnap.exists()) {
    throw new Error("Store not found.");
  }

  const store = storeSnap.data() as Store;
  return normalizeStorePaymentSettings(store);
}

export async function updateStorePaymentSettings(
  storeId: string,
  input: StorePaymentSettingsInput
): Promise<StorePaymentSettings> {
  const currentSettings = await getStorePaymentSettings(storeId);
  const paymentMode = normalizePaymentMode(input.paymentMode);
  const advanceAmount =
    paymentMode === "partial_advance"
      ? normalizeAdvanceAmount(input.advanceAmount)
      : currentSettings.advanceAmount || DEFAULT_ADVANCE_AMOUNT;
  const paymentLink = input.paymentLink?.trim() || "";

  if (paymentMode === "partial_advance") {
    if (!Number.isInteger(advanceAmount) || advanceAmount < 1) {
      throw new Error("Advance amount must be a positive whole number.");
    }

    if (!paymentLink) {
      throw new Error("Payment link is required for partial advance orders.");
    }

    if (!isRazorpayPaymentLink(paymentLink)) {
      throw new Error("Please enter a valid Razorpay payment link.");
    }
  }

  const paymentReturnToken =
    currentSettings.paymentReturnToken || (await ensureStorePaymentReturnToken(storeId));
  const updatePayload = {
    paymentMode,
    advanceAmount,
    paymentProvider: DEFAULT_PAYMENT_PROVIDER,
    paymentLink: paymentMode === "partial_advance" ? paymentLink : "",
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, "stores", storeId), updatePayload);

  return {
    paymentMode: updatePayload.paymentMode,
    advanceAmount: updatePayload.advanceAmount,
    paymentProvider: updatePayload.paymentProvider,
    paymentLink: updatePayload.paymentLink,
    paymentReturnToken,
  };
}

export function normalizeInstagramProfile(value?: string): {
  instagramUrl: string;
  instagramHandle: string;
} {
  const raw = (value || "").trim();

  if (!raw) {
    return { instagramUrl: "", instagramHandle: "" };
  }

  const withoutAt = raw.replace(/^@+/, "").trim();
  const urlMatch = withoutAt.match(/^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)/i);

  if (urlMatch?.[2]) {
    const handle = urlMatch[2].replace(/^@+/, "").replace(/\/+$/g, "");
    return {
      instagramUrl: `https://instagram.com/${handle}`,
      instagramHandle: handle,
    };
  }

  const handle = withoutAt
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .replace(/\/+$/g, "");

  if (!handle) {
    return { instagramUrl: "", instagramHandle: "" };
  }

  return {
    instagramUrl: `https://instagram.com/${handle}`,
    instagramHandle: handle,
  };
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const storeRef = doc(db, "stores", storeId);
  const storeSnap = await getDoc(storeRef);

  if (!storeSnap.exists()) {
    return null;
  }

  return storeSnap.data() as Store;
}

export async function getStoreBySlugOrId(slugOrId: string): Promise<Store | null> {
  const directStore = await getStoreById(slugOrId);

  if (directStore) {
    return directStore;
  }

  const slugSnap = await getDoc(doc(db, "storeSlugs", slugOrId));

  if (!slugSnap.exists()) {
    return null;
  }

  const reservation = slugSnap.data() as StoreSlugReservation;
  const mappedStoreId = reservation.storeId || slugOrId;

  if (!mappedStoreId || mappedStoreId === slugOrId) {
    return null;
  }

  return getStoreById(mappedStoreId);
}

export async function updateStorePublishStatus(
  storeId: string,
  isPublished: boolean
): Promise<void> {
  await updateDoc(doc(db, "stores", storeId), {
    isPublished,
    updatedAt: serverTimestamp(),
  });
}

export async function updateStoreCustomization(
  storeId: string,
  input: StoreCustomizationInput
): Promise<Store> {
  const instagram = normalizeInstagramProfile(input.instagramProfile);
  const payload: Partial<Store> & Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.storeName !== undefined) payload.storeName = input.storeName.trim();
  if (input.bio !== undefined) payload.bio = input.bio.trim();
  if (input.phone !== undefined) {
    const phone = normalizeIndianMobileInput(input.phone);
    if (!phone.ok || !phone.localNumber) {
      throw new Error(phone.error || "Please enter a valid 10-digit Indian WhatsApp number.");
    }
    payload.phone = phone.localNumber;
  }
  if (input.whatsappPhone !== undefined) {
    const whatsappPhone = normalizeIndianMobileInput(input.whatsappPhone);
    if (!whatsappPhone.ok || !whatsappPhone.localNumber) {
      throw new Error(
        whatsappPhone.error || "Please enter a valid 10-digit Indian WhatsApp number."
      );
    }
    payload.whatsappPhone = whatsappPhone.localNumber;
  }
  if (input.supportPhone !== undefined) {
    const rawSupportPhone = input.supportPhone.trim();
    if (rawSupportPhone) {
      const supportPhone = normalizeIndianMobileInput(rawSupportPhone);
      if (!supportPhone.ok || !supportPhone.localNumber) {
        throw new Error(
          supportPhone.error || "Please enter a valid 10-digit Indian WhatsApp number."
        );
      }
      payload.supportPhone = supportPhone.localNumber;
    } else {
      payload.supportPhone = "";
    }
  }
  if (input.ownerName !== undefined) payload.ownerName = input.ownerName.trim();
  if (input.supportEmail !== undefined) payload.supportEmail = input.supportEmail.trim();
  if (input.returnsPolicyType !== undefined) payload.returnsPolicyType = input.returnsPolicyType;
  if (input.returnsPolicyNotes !== undefined) {
    payload.returnsPolicyNotes = input.returnsPolicyNotes.trim();
  }
  if (input.logoUrl !== undefined) {
    const logoUrl = input.logoUrl.trim();
    if (logoUrl && !getDurableImageUrl(logoUrl)) {
      throw new Error("Please re-upload the store logo before saving.");
    }
    payload.logoUrl = logoUrl;
    payload.storeLogoUrl = logoUrl;
  }
  if (input.heroTitle !== undefined) {
    payload.heroTitle = input.heroTitle.trim();
  } else if (input.heroHeading !== undefined) {
    payload.heroTitle = input.heroHeading.trim();
  }
  if (input.heroSubtitle !== undefined) payload.heroSubtitle = input.heroSubtitle.trim();
  if (input.heroEyebrowText !== undefined) {
    payload.heroEyebrowText = input.heroEyebrowText.trim();
  }
  if (input.heroPrimaryCtaText !== undefined) {
    payload.heroPrimaryCtaText = input.heroPrimaryCtaText.trim();
  }
  if (input.heroSecondaryCtaText !== undefined) {
    payload.heroSecondaryCtaText = input.heroSecondaryCtaText.trim();
  }
  if (input.heroImageUrl !== undefined) {
    const heroImageUrl = input.heroImageUrl.trim();
    if (heroImageUrl && !getDurableImageUrl(heroImageUrl)) {
      throw new Error("Please re-upload the hero image before saving.");
    }
    payload.heroImageUrl = heroImageUrl;
  }
  if (input.heroImageKey !== undefined) payload.heroImageKey = input.heroImageKey.trim();
  if (input.announcementText !== undefined) {
    payload.announcementText = input.announcementText.trim();
  }
  if (input.primaryColor !== undefined) payload.primaryColor = input.primaryColor;
  if (input.accentColor !== undefined) payload.accentColor = input.accentColor;
  if (input.instagramProfile !== undefined) {
    payload.instagramProfile = input.instagramProfile.trim();
    payload.instagramUrl = instagram.instagramUrl;
  }

  const storeRef = doc(db, "stores", storeId);

  await updateDoc(storeRef, payload);

  const savedStoreSnap = await getDocFromServer(storeRef);

  if (!savedStoreSnap.exists()) {
    throw new Error("Store settings were saved but the store could not be reloaded.");
  }

  return savedStoreSnap.data() as Store;
}
