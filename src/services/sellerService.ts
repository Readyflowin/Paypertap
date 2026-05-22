import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Seller, Store, StoreSlugReservation } from "../types/firestore";
import {
  sendSellerWelcomeEmail,
  sendStoreCreatedEmail,
} from "./emailEventService";
import { createSellerProduct } from "./productService";

type PrepareSellerResult = {
  sellerId: string;
  storeId: string;
  nextRoute: string;
};

type StoreOnboardingInput = {
  phone: string;
  storeName: string;
  logoUrl?: string;
  logoKey?: string;
};

type FirstProductInput = {
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  inventoryQuantity?: number;
  imageFile?: File | null;
};

type ProductOnboardingInput = {
  product?: FirstProductInput;
};

const BOOKING_ADVANCE_AMOUNT = 20;

const DEFAULT_COLORS = {
  primaryColor: "#111827",
  secondaryColor: "#F9FAFB",
  accentColor: "#2563EB",
};

const SLUG_TAKEN_MESSAGE =
  "This store URL is already taken. Try a different store name.";

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
  const seller = await getSeller(uid);

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

  await setDoc(sellerRef, minimalSeller);
  void sendSellerWelcomeEmail({ seller: minimalSeller }).then(async (sent) => {
    if (!sent) return;

    try {
      await updateDoc(sellerRef, {
        "emailEvents.welcomeSentAt": serverTimestamp(),
      });
    } catch (error) {
      console.warn("Could not mark seller welcome email as sent:", error);
    }
  });

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
  const slugSnap = await getDoc(slugRef);

  if (slugSnap.exists()) {
    const reservation = slugSnap.data() as StoreSlugReservation;

    if (reservation.sellerId === uid) {
      return slug;
    }

    throw new Error(SLUG_TAKEN_MESSAGE);
  }

  try {
    await setDoc(slugRef, {
      slug,
      storeId: slug,
      sellerId: uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    const latestSlugSnap = await getDoc(slugRef);

    if (latestSlugSnap.exists()) {
      const reservation = latestSlugSnap.data() as StoreSlugReservation;

      if (reservation.sellerId === uid) {
        return slug;
      }
    }

    console.error("Slug reservation failed:", error);
    throw new Error(SLUG_TAKEN_MESSAGE);
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
  const phone = input.phone.trim();
  const storeName = input.storeName.trim();

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  if (!storeName) {
    throw new Error("Store name is required.");
  }

  if (phone.length < 8 || phone.length > 15) {
    throw new Error("Phone number must be 8 to 15 characters.");
  }

  const uid = user.uid;
  const sellerRef = doc(db, "sellers", uid);
  const seller = await ensureMinimalSeller(user);
  const existingStoreId = seller.storeId?.trim() || "";
  const storeId = existingStoreId || (await createUniqueStoreSlug(storeName, uid));
  const storeRef = doc(db, "stores", storeId);
  const existingStore = existingStoreId ? await getStore(storeId) : null;
  if (existingStoreId) {
    await reserveStoreSlug(existingStoreId, uid);
  }

  const storePayload = {
    storeId,
    sellerId: uid,
    storeSlug: storeId,
    storeName,
    bio: existingStore?.bio || "Fresh drops, limited pieces.",
    logoUrl: input.logoUrl || existingStore?.logoUrl || "",
    logoKey: input.logoKey || existingStore?.logoKey || "",
    heroImageUrl: existingStore?.heroImageUrl || "",
    themeId: existingStore?.themeId || "minimal-clean",
    primaryColor: existingStore?.primaryColor || DEFAULT_COLORS.primaryColor,
    secondaryColor:
      existingStore?.secondaryColor || DEFAULT_COLORS.secondaryColor,
    accentColor: existingStore?.accentColor || DEFAULT_COLORS.accentColor,
    fontStyle: existingStore?.fontStyle || "sans",
    bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
    phone,
    whatsappPhone: phone,
    isPublished: existingStore?.isPublished ?? true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    storeRef,
    {
      ...storePayload,
      ...(!existingStore ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true }
  );

  await setDoc(
    sellerRef,
    {
      sellerId: uid,
      authUid: uid,
      name: seller.name || user.displayName || storeName,
      email: seller.email || user.email || "",
      phone,
      storeId,
      status: seller.status || "active",
      razorpayLinked: seller.razorpayLinked ?? false,
      profileImageUrl: seller.profileImageUrl || user.photoURL || "",
      onboardingStatus: "store_completed",
      onboardingStep: "product",
      createdAt: seller.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (!existingStore?.emailEvents?.storeCreatedSentAt) {
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
      ...(existingStore || ({} as Store)),
      ...storePayload,
    };

    void sendStoreCreatedEmail({
      seller: sellerForEmail,
      store: storeForEmail,
    }).then(async (sent) => {
      if (!sent) return;

      try {
        await updateDoc(storeRef, {
          "emailEvents.storeCreatedSentAt": serverTimestamp(),
        });
      } catch (error) {
        console.warn("Could not mark store created email as sent:", error);
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
    product?.inventoryQuantity !== undefined ||
    Boolean(product?.imageFile);

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
      category: product?.category?.trim() || "General",
      inventoryQuantity: product?.inventoryQuantity
        ? toPositiveInt(product.inventoryQuantity, "Inventory quantity")
        : 1,
      imageFile: product?.imageFile || null,
      status: "open",
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
