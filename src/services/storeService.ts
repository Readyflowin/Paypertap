import {
  doc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getDurableImageUrl } from "../lib/imageUrls";
import { normalizeIndianMobileInput } from "../lib/phone";
import {
  DEFAULT_SELLER_CONFIRMATION_ADVANCE_TYPE,
  isSellerConfirmationAdvanceType,
  type SellerConfirmationAdvanceType,
} from "../lib/confirmationAdvance";
import type { StorefrontThemeId } from "../storefront/themes/types";
import type { Store, StoreSlugReservation } from "../types/firestore";

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
  heroSubtitle?: string;
  themeStyle?: string;
  primaryColor?: string;
  accentColor?: string;
  sellerConfirmationAdvanceType?: SellerConfirmationAdvanceType;
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
};

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

const VALID_STOREFRONT_THEME_IDS: StorefrontThemeId[] = [
  "theme1",
  "theme2",
  "theme3",
];

export async function updateStoreTheme(
  storeId: string,
  themeId: StorefrontThemeId
): Promise<Pick<Store, "themeId">> {
  if (!VALID_STOREFRONT_THEME_IDS.includes(themeId)) {
    throw new Error("Please choose a valid storefront theme.");
  }

  await updateDoc(doc(db, "stores", storeId), {
    themeId,
    updatedAt: serverTimestamp(),
  });

  return { themeId };
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
  if (input.heroHeading !== undefined) payload.heroTitle = input.heroHeading.trim();
  if (input.heroSubtitle !== undefined) payload.heroSubtitle = input.heroSubtitle.trim();
  if (input.primaryColor !== undefined) payload.primaryColor = input.primaryColor;
  if (input.accentColor !== undefined) payload.accentColor = input.accentColor;
  if (input.sellerConfirmationAdvanceType !== undefined) {
    if (!isSellerConfirmationAdvanceType(input.sellerConfirmationAdvanceType)) {
      throw new Error("Please choose a valid confirmation advance option.");
    }

    payload.sellerConfirmationAdvanceType = input.sellerConfirmationAdvanceType;
    payload.sellerConfirmationAdvanceFixedAmount =
      input.sellerConfirmationAdvanceType === "fixed"
        ? Math.round(Number(input.sellerConfirmationAdvanceFixedAmount) || 0)
        : null;
    payload.sellerConfirmationAdvancePercent =
      input.sellerConfirmationAdvanceType === "percentage"
        ? Math.round(Number(input.sellerConfirmationAdvancePercent) || 0)
        : null;

    if (
      input.sellerConfirmationAdvanceType === "fixed" &&
      Number(payload.sellerConfirmationAdvanceFixedAmount) < 20
    ) {
      throw new Error("Fixed confirmation amount must be at least ₹20.");
    }

    if (
      input.sellerConfirmationAdvanceType === "percentage" &&
      Number(payload.sellerConfirmationAdvancePercent) <= 0
    ) {
      throw new Error("Confirmation percentage must be greater than 0.");
    }
  } else if (input.sellerConfirmationAdvanceFixedAmount !== undefined) {
    payload.sellerConfirmationAdvanceType = DEFAULT_SELLER_CONFIRMATION_ADVANCE_TYPE;
    payload.sellerConfirmationAdvanceFixedAmount = null;
    payload.sellerConfirmationAdvancePercent = null;
  }
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
