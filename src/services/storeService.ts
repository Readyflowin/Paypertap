import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Store, StoreSlugReservation } from "../types/firestore";

export type StoreCustomizationInput = {
  storeName?: string;
  bio?: string;
  tagline?: string;
  phone?: string;
  whatsappPhone?: string;
  whatsappNumber?: string;
  instagramProfile?: string;
  logoUrl?: string;
  logoKey?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  themeStyle?: string;
  fontStyle?: string;
  backgroundColor?: string;
  textColor?: string;
  cardColor?: string;
  primaryColor?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
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
  if (input.tagline !== undefined) payload.tagline = input.tagline.trim();
  if (input.phone !== undefined) payload.phone = input.phone.trim();
  if (input.whatsappPhone !== undefined) payload.whatsappPhone = input.whatsappPhone.trim();
  if (input.whatsappNumber !== undefined) payload.whatsappNumber = input.whatsappNumber.trim();
  if (input.logoUrl !== undefined) payload.logoUrl = input.logoUrl;
  if (input.logoKey !== undefined) payload.logoKey = input.logoKey;
  if (input.heroHeading !== undefined) payload.heroHeading = input.heroHeading.trim();
  if (input.heroSubtitle !== undefined) payload.heroSubtitle = input.heroSubtitle.trim();
  if (input.themeStyle !== undefined) payload.themeStyle = input.themeStyle;
  if (input.fontStyle !== undefined) payload.fontStyle = input.fontStyle;
  if (input.backgroundColor !== undefined) payload.backgroundColor = input.backgroundColor;
  if (input.textColor !== undefined) payload.textColor = input.textColor;
  if (input.cardColor !== undefined) payload.cardColor = input.cardColor;
  if (input.primaryColor !== undefined) payload.primaryColor = input.primaryColor;
  if (input.accentColor !== undefined) payload.accentColor = input.accentColor;
  if (input.buttonColor !== undefined) payload.buttonColor = input.buttonColor;
  if (input.buttonTextColor !== undefined) payload.buttonTextColor = input.buttonTextColor;
  if (input.instagramProfile !== undefined) {
    payload.instagramUrl = instagram.instagramUrl;
    payload.instagramHandle = instagram.instagramHandle;
  }

  await updateDoc(doc(db, "stores", storeId), payload);

  return payload;
}
