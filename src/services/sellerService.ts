import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getDurableImageUrl } from "../lib/imageUrls";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { Seller, Store, StoreSlugReservation } from "../types/firestore";
import {
  sendSellerWelcomeEmail,
  sendStoreCreatedEmail,
} from "./emailEventService";
import {
  createSellerProduct,
  type ProductSaveProgress,
} from "./productService";
import { normalizeInstagramProfile } from "./storeService";

type PrepareSellerResult = {
  sellerId: string;
  storeId: string;
  nextRoute: string;
};

type StoreOnboardingInput = {
  phone: string;
  storeName: string;
  instagramProfile?: string;
  logoUrl?: string;
};

type StoreOnboardingDebugInfo = {
  operation:
    | "load-seller"
    | "create-minimal-seller"
    | "check-slug-reservation"
    | "create-slug-reservation"
    | "check-store"
    | "save-store"
    | "update-seller-onboarding";
  attemptedStoreSlug: string;
  storeId: string;
  payloadKeys: string[];
  creatingSlug: boolean;
  creatingStore: boolean;
  updatingSeller: boolean;
};

type FirstProductInput = {
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  collectionId?: string;
  collectionName?: string;
  inventoryQuantity?: number;
  imageFile?: File | null;
  imageFiles?: File[];
  onProgress?: (progress: ProductSaveProgress) => void;
};

type ProductOnboardingInput = {
  product?: FirstProductInput;
};

const BOOKING_ADVANCE_AMOUNT = 20;

const DEFAULT_COLORS = {
  primaryColor: "#111111",
  secondaryColor: "#f7f3ea",
  accentColor: "#7c3aed",
};

const DEFAULT_THEME_ID = "theme1";

const SLUG_TAKEN_MESSAGE = "This store link is already taken.";

class StoreOnboardingWriteError extends Error {
  debugInfo: StoreOnboardingDebugInfo;

  constructor(error: unknown, debugInfo: StoreOnboardingDebugInfo) {
    super(error instanceof Error ? error.message : "Store onboarding write failed.");
    this.name = "StoreOnboardingWriteError";
    this.debugInfo = debugInfo;
  }
}

export function getStoreOnboardingDebugInfo(
  error: unknown
): StoreOnboardingDebugInfo | null {
  return error instanceof StoreOnboardingWriteError ? error.debugInfo : null;
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "";
  }

  const { code } = error as { code?: unknown };
  return typeof code === "string" ? code : "";
}

function isPermissionDenied(error: unknown) {
  return getFirebaseErrorCode(error) === "permission-denied";
}

function createStoreOnboardingWriteError(
  error: unknown,
  debugInfo: StoreOnboardingDebugInfo
) {
  console.error("Store onboarding write failed:", debugInfo, error);
  return new StoreOnboardingWriteError(error, debugInfo);
}

export function slugifyStoreName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getSeller(uid: string): Promise<Seller | null> {
  const sellerSnap = await getDoc(doc(db, "sellers", uid));

  if (!sellerSnap.exists()) {
    return null;
  }

  return sellerSnap.data() as Seller;
}

export async function getSellerByUid(uid: string): Promise<Seller | null> {
  return getSeller(uid);
}

async function getStore(storeId: string): Promise<Store | null> {
  const storeSnap = await getDoc(doc(db, "stores", storeId));

  if (!storeSnap.exists()) {
    return null;
  }

  return storeSnap.data() as Store;
}

async function ensureMinimalSeller(user: User): Promise<Seller> {
  const uid = user.uid;
  const sellerRef = doc(db, "sellers", uid);
  let seller: Seller | null;

  try {
    seller = await getSeller(uid);
  } catch (error) {
    throw createStoreOnboardingWriteError(error, {
      operation: "load-seller",
      attemptedStoreSlug: "",
      storeId: "",
      payloadKeys: [],
      creatingSlug: false,
      creatingStore: false,
      updatingSeller: false,
    });
  }

  if (seller) {
    return seller;
  }

  const minimalSeller: Seller = {
    sellerId: uid,
    authUid: uid,
    name: user.displayName || "",
    email: user.email || "",
    phone: "",
    storeId: "",
    status: "active",
    razorpayLinked: false,
    profileImageUrl: user.photoURL || "",
    onboardingStatus: "auth_completed",
    onboardingStep: "store",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(sellerRef, minimalSeller);
  } catch (error) {
    throw createStoreOnboardingWriteError(error, {
      operation: "create-minimal-seller",
      attemptedStoreSlug: "",
      storeId: "",
      payloadKeys: Object.keys(minimalSeller),
      creatingSlug: false,
      creatingStore: false,
      updatingSeller: false,
    });
  }

  void sendSellerWelcomeEmail({ seller: minimalSeller });

  return minimalSeller;
}

function toPositiveInt(value: number, fieldName: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) {
    throw new Error(`${fieldName} must be a positive whole number.`);
  }

  return amount;
}

async function reserveStoreSlug(slug: string, uid: string): Promise<string> {
  const slugRef = doc(db, "storeSlugs", slug);
  let slugSnap;

  try {
    slugSnap = await getDoc(slugRef);
  } catch (error) {
    throw createStoreOnboardingWriteError(error, {
      operation: "check-slug-reservation",
      attemptedStoreSlug: slug,
      storeId: slug,
      payloadKeys: [],
      creatingSlug: false,
      creatingStore: false,
      updatingSeller: false,
    });
  }

  if (slugSnap.exists()) {
    const reservation = slugSnap.data() as StoreSlugReservation;

    if (reservation.sellerId === uid) {
      return slug;
    }

    throw new Error(SLUG_TAKEN_MESSAGE);
  }

  const slugPayload = {
    slug,
    storeId: slug,
    sellerId: uid,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(slugRef, slugPayload);
  } catch (error) {
    const latestSlugSnap = await getDoc(slugRef);

    if (latestSlugSnap.exists()) {
      const reservation = latestSlugSnap.data() as StoreSlugReservation;

      if (reservation.sellerId === uid) {
        return slug;
      }

      throw new Error(SLUG_TAKEN_MESSAGE);
    }

    if (isPermissionDenied(error)) {
      throw createStoreOnboardingWriteError(error, {
        operation: "create-slug-reservation",
        attemptedStoreSlug: slug,
        storeId: slug,
        payloadKeys: Object.keys(slugPayload),
        creatingSlug: true,
        creatingStore: false,
        updatingSeller: false,
      });
    }

    console.error("Slug reservation failed:", error);
    throw error instanceof Error
      ? error
      : new Error("Could not reserve your store link.");
  }

  return slug;
}

export async function createUniqueStoreSlug(
  baseName: string,
  uid: string
): Promise<string> {
  const baseSlug = slugifyStoreName(baseName);

  if (!baseSlug) {
    throw new Error("Store name must include at least one letter or number.");
  }

  return reserveStoreSlug(baseSlug, uid);
}

export async function prepareSellerAfterAuth(
  user: User
): Promise<PrepareSellerResult> {
  const uid = user.uid;
  const seller = await ensureMinimalSeller(user);

  if (!seller.storeId) {
    return {
      sellerId: uid,
      storeId: "",
      nextRoute: "/onboarding/store",
    };
  }

  const store = await getStore(seller.storeId);

  if (!seller.phone?.trim() || !store || !store.storeName?.trim()) {
    return {
      sellerId: uid,
      storeId: seller.storeId,
      nextRoute: "/onboarding/store",
    };
  }

  if (
    seller.onboardingStatus !== "completed" ||
    seller.onboardingStep !== "dashboard"
  ) {
    return {
      sellerId: uid,
      storeId: seller.storeId,
      nextRoute: "/onboarding/product",
    };
  }

  return {
    sellerId: uid,
    storeId: seller.storeId,
    nextRoute: "/dashboard",
  };
}

export async function completeStoreOnboarding(
  user: User,
  input: StoreOnboardingInput
): Promise<{ storeId: string; nextRoute: string }> {
  const phoneResult = normalizeIndianMobileInput(input.phone);
  const phone = phoneResult.localNumber || "";
  const storeName = input.storeName.trim();

  if (!storeName) {
    throw new Error("Store name is required.");
  }

  if (!phoneResult.ok || !phone) {
    throw new Error(
      phoneResult.error || "Please enter a valid 10-digit Indian WhatsApp number."
    );
  }

  const uid = user.uid;
  const sellerRef = doc(db, "sellers", uid);
  const seller = await ensureMinimalSeller(user);
  const existingStoreId = seller.storeId?.trim() || "";
  const storeId = existingStoreId || slugifyStoreName(storeName);

  if (!storeId) {
    throw new Error("Store name must include at least one letter or number.");
  }

  await reserveStoreSlug(storeId, uid);

  const storeRef = doc(db, "stores", storeId);
  const instagramProfile = input.instagramProfile?.trim() || "";
  const instagram = normalizeInstagramProfile(instagramProfile);
  const inputLogoUrl = input.logoUrl?.trim() || "";
  const safeLogoUrl = getDurableImageUrl(inputLogoUrl);
  const bio = "Fresh drops, limited pieces.";

  if (inputLogoUrl && !safeLogoUrl) {
    throw new Error("Please re-upload the store logo before saving.");
  }

  const storePayload = {
    storeId,
    sellerId: uid,
    storeSlug: storeId,
    storeName,
    storeDescription: bio,
    description: bio,
    bio,
    logoUrl: safeLogoUrl,
    storeLogoUrl: safeLogoUrl,
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    themeId: DEFAULT_THEME_ID,
    primaryColor: DEFAULT_COLORS.primaryColor,
    secondaryColor: DEFAULT_COLORS.secondaryColor,
    accentColor: DEFAULT_COLORS.accentColor,
    bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
    phone,
    whatsappPhone: phone,
    instagramProfile,
    instagramUrl: instagram.instagramUrl,
    isPublished: true,
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(storeRef, storePayload, { merge: true });
  } catch (error) {
    throw createStoreOnboardingWriteError(error, {
      operation: "save-store",
      attemptedStoreSlug: storeId,
      storeId,
      payloadKeys: Object.keys(storePayload),
      creatingSlug: false,
      creatingStore: !existingStoreId,
      updatingSeller: false,
    });
  }

  const sellerOnboardingPayload = {
    name: seller.name || user.displayName || storeName,
    phone,
    storeId,
    status: seller.status || "active",
    razorpayLinked: seller.razorpayLinked ?? false,
    profileImageUrl: seller.profileImageUrl || user.photoURL || "",
    onboardingStatus: "store_completed",
    onboardingStep: "product",
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(sellerRef, sellerOnboardingPayload);
  } catch (error) {
    throw createStoreOnboardingWriteError(error, {
      operation: "update-seller-onboarding",
      attemptedStoreSlug: storeId,
      storeId,
      payloadKeys: Object.keys(sellerOnboardingPayload),
      creatingSlug: false,
      creatingStore: false,
      updatingSeller: true,
    });
  }

  if (!existingStoreId) {
    const sellerForEmail: Seller = {
      ...seller,
      sellerId: uid,
      authUid: uid,
      name: seller.name || user.displayName || storeName,
      email: seller.email || user.email || "",
      phone,
      storeId,
    };
    const storeForEmail: Store = {
      ...storePayload,
    };

    void sendStoreCreatedEmail({
      seller: sellerForEmail,
      store: storeForEmail,
    }).then(async (sent) => {
      if (!sent) return;

      try {
        await updateDoc(storeRef, {
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.warn("Could not touch store after created email was sent:", error);
      }
    });
  }

  return {
    storeId,
    nextRoute: "/onboarding/product",
  };
}

export async function completeProductOnboarding(
  user: User,
  input: ProductOnboardingInput
): Promise<{ nextRoute: string }> {
  const uid = user.uid;
  const seller = await ensureMinimalSeller(user);

  if (!seller?.storeId) {
    throw new Error("Please complete your store setup first.");
  }

  const product = input.product;
  const title = product?.title?.trim() || "";
  const hasPrice = product?.price !== undefined && product.price !== null;
  const price = hasPrice ? Number(product?.price) : 0;
  const hasProductInput =
    Boolean(title) ||
    hasPrice ||
    Boolean(product?.description?.trim()) ||
    Boolean(product?.category?.trim()) ||
    Boolean(product?.collectionName?.trim()) ||
    product?.inventoryQuantity !== undefined ||
    Boolean(product?.imageFile) ||
    Boolean(product?.imageFiles?.length);

  if (hasProductInput) {
    if (!title) {
      throw new Error("Product title is required.");
    }

    if (!Number.isInteger(price) || price <= BOOKING_ADVANCE_AMOUNT) {
      throw new Error("Product price must be greater than ₹20.");
    }

    await createSellerProduct(user, seller.storeId, {
      title,
      description: product?.description?.trim() || "",
      price,
      category: product?.category?.trim() || product?.collectionName?.trim() || "General",
      collectionId: product?.collectionId?.trim() || "",
      collectionName: product?.collectionName?.trim() || product?.category?.trim() || "",
      inventoryQuantity: product?.inventoryQuantity
        ? toPositiveInt(product.inventoryQuantity, "Inventory quantity")
        : 1,
      imageFiles: product?.imageFiles || (product?.imageFile ? [product.imageFile] : []),
      status: "open",
      onProgress: product?.onProgress,
    });
  }

  await updateDoc(doc(db, "sellers", uid), {
    onboardingStatus: "completed",
    onboardingStep: "dashboard",
    updatedAt: serverTimestamp(),
  });

  return {
    nextRoute: "/dashboard",
  };
}
