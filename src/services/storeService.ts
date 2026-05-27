import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getDurableImageUrl } from "../lib/imageUrls";
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
): Promise<Partial<Store>> {
  const instagram = normalizeInstagramProfile(input.instagramProfile);
  const payload: Partial<Store> & Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.storeName !== undefined) payload.storeName = input.storeName.trim();
  if (input.bio !== undefined) payload.bio = input.bio.trim();
  if (input.phone !== undefined) payload.phone = input.phone.trim();
  if (input.whatsappPhone !== undefined) payload.whatsappPhone = input.whatsappPhone.trim();
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
  if (input.instagramProfile !== undefined) {
    payload.instagramProfile = input.instagramProfile.trim();
    payload.instagramUrl = instagram.instagramUrl;
  }

  await updateDoc(doc(db, "stores", storeId), payload);

  return payload;
}
