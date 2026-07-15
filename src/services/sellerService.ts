import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getDurableImageUrl } from "../lib/imageUrls";
import { normalizeIndianMobileInput } from "../lib/phone";
import type { Seller, Store } from "../types/firestore";
import {
  createSellerProduct,
  type ProductSaveProgress,
} from "./productService";

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

type StoreOnboardingApiResponse = {
  success?: boolean;
  storeId?: string;
  nextRoute?: string;
  stage?: string;
  message?: string;
  error?: string;
  originalError?: unknown;
  details?: Partial<StoreOnboardingDebugInfo> & {
    requestedSlug?: string;
    selectedStoreId?: string;
    previousStoreId?: string;
    branch?: string;
  };
};

type StoreOnboardingDebugInfo = {
  operation:
    | "load-seller"
    | "create-minimal-seller"
    | "initialize-wallet"
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
  stage?: string;
  originalError?: unknown;
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

function createStoreOnboardingWriteError(
  error: unknown,
  debugInfo: StoreOnboardingDebugInfo
) {
  console.error("Store onboarding write failed:", debugInfo, error);
  return new StoreOnboardingWriteError(error, debugInfo);
}

function onboardingLog(event: string, details: Record<string, unknown> = {}) {
  console.info("Seller onboarding decision:", {
    event,
    ...details,
  });
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

async function loadSellerForAuth(user: User): Promise<Seller | null> {
  const uid = user.uid;

  try {
    return await getSeller(uid);
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
}

function toPositiveInt(value: number, fieldName: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) {
    throw new Error(`${fieldName} must be a positive whole number.`);
  }

  return amount;
}

export async function prepareSellerAfterAuth(
  user: User
): Promise<PrepareSellerResult> {
  const uid = user.uid;
  const seller = await loadSellerForAuth(user);

  if (!seller?.storeId) {
    onboardingLog("new-or-auth-only-seller", {
      uid,
      sellerExists: Boolean(seller),
      storeId: "",
      onboardingStatus: seller?.onboardingStatus || "",
      onboardingStep: seller?.onboardingStep || "",
      nextRoute: "/onboarding/store",
    });
    return {
      sellerId: uid,
      storeId: "",
      nextRoute: "/onboarding/store",
    };
  }

  const store = await getStore(seller.storeId);

  if (!seller.phone?.trim() || !store || !store.storeName?.trim()) {
    onboardingLog("seller-needs-store-onboarding", {
      uid,
      sellerExists: true,
      sellerStoreId: seller.storeId,
      storeExists: Boolean(store),
      storeHasName: Boolean(store?.storeName?.trim()),
      hasPhone: Boolean(seller.phone?.trim()),
      onboardingStatus: seller.onboardingStatus,
      onboardingStep: seller.onboardingStep,
      nextRoute: "/onboarding/store",
    });
    return {
      sellerId: uid,
      storeId: store ? seller.storeId : "",
      nextRoute: "/onboarding/store",
    };
  }

  if (
    seller.onboardingStatus !== "completed" ||
    seller.onboardingStep !== "dashboard"
  ) {
    onboardingLog("seller-needs-product-onboarding", {
      uid,
      storeId: seller.storeId,
      onboardingStatus: seller.onboardingStatus,
      onboardingStep: seller.onboardingStep,
      nextRoute: "/onboarding/product",
    });
    return {
      sellerId: uid,
      storeId: seller.storeId,
      nextRoute: "/onboarding/product",
    };
  }

  onboardingLog("seller-ready-for-dashboard", {
    uid,
    storeId: seller.storeId,
    onboardingStatus: seller.onboardingStatus,
    onboardingStep: seller.onboardingStep,
    nextRoute: "/dashboard",
  });
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

  const storeId = slugifyStoreName(storeName);

  if (!storeId) {
    throw new Error("Store name must include at least one letter or number.");
  }

  const instagramProfile = input.instagramProfile?.trim() || "";
  const inputLogoUrl = input.logoUrl?.trim() || "";
  const safeLogoUrl = getDurableImageUrl(inputLogoUrl);

  if (inputLogoUrl && !safeLogoUrl) {
    throw new Error("Please re-upload the store logo before saving.");
  }

  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/store?action=onboarding", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        storeName,
        instagramProfile,
        logoUrl: safeLogoUrl,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as StoreOnboardingApiResponse;

    if (!response.ok || !data.success || !data.storeId || !data.nextRoute) {
      const detailStoreId = data.details?.selectedStoreId || data.storeId || storeId;
      throw createStoreOnboardingWriteError(
        new Error(data.message || data.error || "Could not save your store."),
        {
          operation: "save-store",
          attemptedStoreSlug: data.details?.requestedSlug || storeId,
          storeId: detailStoreId,
          payloadKeys: ["phone", "storeName", "instagramProfile", "logoUrl"],
          creatingSlug: data.details?.creatingSlug ?? true,
          creatingStore: data.details?.creatingStore ?? true,
          updatingSeller: data.details?.updatingSeller ?? false,
          stage: data.stage,
          originalError: data.originalError,
        }
      );
    }

    onboardingLog("store-onboarding-api-succeeded", {
      uid: user.uid,
      requestedSlug: storeId,
      storeId: data.storeId,
      nextRoute: data.nextRoute,
      details: data.details || null,
    });

    return {
      storeId: data.storeId,
      nextRoute: data.nextRoute,
    };
  } catch (error) {
    if (error instanceof StoreOnboardingWriteError) {
      throw error;
    }

    throw createStoreOnboardingWriteError(error, {
      operation: "save-store",
      attemptedStoreSlug: storeId,
      storeId,
      payloadKeys: ["phone", "storeName", "instagramProfile", "logoUrl"],
      creatingSlug: true,
      creatingStore: true,
      updatingSeller: false,
    });
  }
}

export async function completeProductOnboarding(
  user: User,
  input: ProductOnboardingInput
): Promise<{ nextRoute: string }> {
  const uid = user.uid;
  const seller = await loadSellerForAuth(user);

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

    if (!Number.isInteger(price) || price <= 0) {
      throw new Error("Product price must be greater than 0.");
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
