import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { COMPATIBILITY_COLLECTION_NAME } from "../lib/collections";
import { MAX_PRODUCT_IMAGE_COUNT } from "../lib/imageCompression";
import {
  getDurableImageUrl,
  getProductImageUrls,
  normalizeProductImages,
} from "../lib/imageUrls";
import {
  generateVariantCombinations,
  normalizeVariantOptions,
  type ProductVariant,
  type ProductVariantOption,
} from "../lib/productVariants";
import { getNextProductStatus } from "../lib/productAvailability";
import type { Product, ProductImage, ProductStatus } from "../types/firestore";
import { uploadProductImage, uploadProductImages } from "./uploadService";

type CreateSellerProductInput = {
  title: string;
  description?: string;
  price: number;
  category?: string;
  collectionId?: string;
  collectionName?: string;
  status?: ProductStatus;
  inventoryQuantity?: number;
  imageFile?: File | null;
  imageFiles?: File[];
  sizeChartImageFile?: File | null;
  hasVariants?: boolean;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  defaultVariantId?: string;
  onProgress?: (progress: ProductSaveProgress) => void;
};

type RuleSafeProductImage = {
  url?: string;
  thumbnailUrl?: string;
  thumbUrl?: string;
  key?: string;
  thumbKey?: string;
  alt?: string;
  sortOrder?: number;
};

export type ProductSaveProgress = {
  phase: "uploading" | "saving";
  completedImages: number;
  totalImages: number;
};

export type UpdateSellerProductInput = {
  title: string;
  description?: string;
  price: number;
  category?: string;
  collectionId?: string;
  collectionName?: string;
  status: ProductStatus;
  inventoryQuantity: number;
  imageFile?: File | null;
  imageFiles?: File[];
  sizeChartImageFile?: File | null;
  hasVariants?: boolean;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  defaultVariantId?: string;
  onProgress?: (progress: ProductSaveProgress) => void;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function removeUndefinedFields<T>(data: T): T {
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedFields(item)) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, removeUndefinedFields(value)])
  ) as T;
}

function getUndefinedFieldPaths(value: unknown, prefix = ""): string[] {
  if (value === undefined) return prefix ? [prefix] : ["<root>"];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      getUndefinedFieldPaths(item, `${prefix}[${index}]`)
    );
  }

  if (!isPlainObject(value)) return [];

  return Object.entries(value).flatMap(([key, child]) =>
    getUndefinedFieldPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

function logProductPayloadDebug(
  action: "create" | "update",
  payload: Record<string, unknown>
) {
  if (!import.meta.env.DEV) return;

  const undefinedFields = getUndefinedFieldPaths(payload);
  if (undefinedFields.length) {
    console.warn(`product ${action} payload has undefined fields`, undefinedFields);
  }
}

function toPositiveInt(value: number, fieldName: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) {
    throw new Error(`${fieldName} must be a positive whole number.`);
  }

  return amount;
}

function normalizeProductVariantPayload(input: {
  hasVariants?: boolean;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  defaultVariantId?: string;
}) {
  const variantOptions = normalizeVariantOptions(input.variantOptions);
  const hasVariants = Boolean(input.hasVariants && variantOptions.length > 0);

  if (!hasVariants) {
    return {
      hasVariants: false,
      variantOptions: [],
      variants: [],
      defaultVariantId: "",
    };
  }

  const combinationCount = variantOptions.reduce(
    (total, option) => total * Math.max(option.values.length, 1),
    1
  );

  if (combinationCount > 100) {
    throw new Error("Please keep variants under 100 combinations.");
  }

  const variants = generateVariantCombinations(variantOptions, input.variants);

  return {
    hasVariants: true,
    variantOptions,
    variants,
    defaultVariantId:
      input.defaultVariantId && variants.some((variant) => variant.variantId === input.defaultVariantId)
        ? input.defaultVariantId
        : variants.find((variant) => variant.isAvailable !== false)?.variantId ||
          variants[0]?.variantId ||
          "",
  };
}

function normalizeProduct(productDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): Product {
  const data = productDoc.data();
  const price = Number(data.price || 0);
  const images = getProductImageUrls({
    images: data.images,
    imageUrl: data.imageUrl,
    thumbnailUrl: data.thumbnailUrl,
    title: data.title,
  });
  const firstImage = images[0];

  return {
    id: productDoc.id,
    ...(data as Omit<Product, "id">),
    productId: String(data.productId || productDoc.id),
    price,
    images,
    imageUrl: firstImage?.url || getDurableImageUrl(data.imageUrl),
    thumbnailUrl:
      firstImage?.thumbnailUrl ||
      firstImage?.thumbUrl ||
      getDurableImageUrl(data.thumbnailUrl) ||
      firstImage?.url ||
      "",
    inventoryQuantity: Number(data.inventoryQuantity || 1),
    reservedQuantity: Number(data.reservedQuantity || 0),
    soldQuantity: Number(data.soldQuantity || 0),
  };
}

function getProductImageFiles(input: {
  imageFile?: File | null;
  imageFiles?: File[];
}) {
  const files = input.imageFiles?.length
    ? input.imageFiles
    : input.imageFile
      ? [input.imageFile]
      : [];

  if (files.length > MAX_PRODUCT_IMAGE_COUNT) {
    throw new Error(`Please choose up to ${MAX_PRODUCT_IMAGE_COUNT} product images.`);
  }

  return files;
}

function toRuleSafeProductImages(images: ProductImage[]): RuleSafeProductImage[] {
  return normalizeProductImages(images);
}

function getPrimaryImageFields(images: RuleSafeProductImage[]) {
  const firstImage = images[0];
  const imageUrl = getDurableImageUrl(firstImage?.url);

  return {
    imageUrl,
    thumbnailUrl:
      getDurableImageUrl(firstImage?.thumbnailUrl) ||
      getDurableImageUrl(firstImage?.thumbUrl) ||
      imageUrl,
  };
}

function getPersistedProductImages(product: Product): ProductImage[] {
  const images = getProductImageUrls(product);

  if (images.length) {
    return images;
  }

  const imageUrl = getDurableImageUrl(product.imageUrl);
  if (!imageUrl) {
    return [];
  }

  return [
    {
      url: imageUrl,
      thumbnailUrl: getDurableImageUrl(product.thumbnailUrl) || imageUrl,
      thumbUrl: getDurableImageUrl(product.thumbnailUrl) || imageUrl,
      alt: product.title || "Product image",
      key: "",
      sortOrder: 0,
    },
  ];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productSnap = await getDoc(doc(db, "products", productId));

  if (!productSnap.exists()) {
    return null;
  }

  return normalizeProduct(productSnap);
}

export async function getPublicProductById(
  productId: string
): Promise<Product | null> {
  const product = await getProductById(productId);

  if (!product || !["open", "hold", "sold"].includes(product.status)) {
    return null;
  }

  return product;
}

export async function getOpenProductsByStoreId(
  storeId: string
): Promise<Product[]> {
  const productsRef = collection(db, "products");

  const productsQuery = query(
    productsRef,
    where("storeId", "==", storeId),
    where("status", "in", ["open", "hold", "sold"])
  );

  const productsSnap = await getDocs(productsQuery);

  const products = productsSnap.docs.map((productDoc) =>
    normalizeProduct(productDoc)
  );

  return products.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPublicProductsByStoreId(
  storeId: string
): Promise<Product[]> {
  const productsRef = collection(db, "products");
  const productsQuery = query(
    productsRef,
    where("storeId", "==", storeId),
    where("status", "in", ["open", "hold", "sold"])
  );
  const productsSnap = await getDocs(productsQuery);

  const products = productsSnap.docs.map((productDoc) =>
    normalizeProduct(productDoc)
  );

  return products.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSellerProductsForStore(
  sellerId: string,
  storeId: string
): Promise<Product[]> {
  const productsRef = collection(db, "products");
  const productsQuery = query(productsRef, where("sellerId", "==", sellerId));
  const productsSnap = await getDocs(productsQuery);

  const products = productsSnap.docs.map((productDoc) =>
    normalizeProduct(productDoc)
  );

  return products
    .filter((product) => product.storeId === storeId)
    .sort((a, b) => b.sortOrder - a.sortOrder);
}

export async function createSellerProduct(
  user: User,
  storeId: string,
  input: CreateSellerProductInput
): Promise<Product> {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Product title is required.");
  }

  const productRef = doc(collection(db, "products"));
  const productId = productRef.id;
  const price = toPositiveInt(input.price, "Price");

  const inventoryQuantity = toPositiveInt(
    input.inventoryQuantity ?? 1,
    "Inventory quantity"
  );
  const collectionId = input.collectionId?.trim() || "";
  const collectionName = input.collectionName?.trim() || input.category?.trim() || "";
  const imageFiles = getProductImageFiles(input);
  const images: ProductImage[] = imageFiles.length
    ? await uploadProductImages(imageFiles, title, {
        onImageUploaded: (completedImages, totalImages) =>
          input.onProgress?.({
            phase: "uploading",
            completedImages,
            totalImages,
          }),
      })
    : [];
  const ruleSafeImages = toRuleSafeProductImages(images);
  const primaryImageFields = getPrimaryImageFields(ruleSafeImages);
  const sizeChartImage = input.sizeChartImageFile
    ? await uploadProductImage(input.sizeChartImageFile, `${title} size chart`)
    : null;
  const sizeChartImageFields = sizeChartImage?.url
    ? {
        sizeChartImage: sizeChartImage.url,
        sizeChartImageUrl: sizeChartImage.url,
        sizeChartImageKey: sizeChartImage.key || "",
      }
    : {};
  const sortOrder = Date.now();
  const variantPayload = normalizeProductVariantPayload(input);

  const rawProductData = {
    productId,
    sellerId: user.uid,
    storeId,
    title,
    description: input.description?.trim() || "",
    price,
    category: input.category?.trim() || collectionName || COMPATIBILITY_COLLECTION_NAME,
    collectionId,
    collectionName,
    images: ruleSafeImages,
    ...primaryImageFields,
    ...sizeChartImageFields,
    status: input.status || "open",
    isFeatured: false,
    sortOrder,
    inventoryQuantity,
    reservedQuantity: 0,
    soldQuantity: 0,
    ...variantPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  logProductPayloadDebug("create", rawProductData);
  const productData = removeUndefinedFields(rawProductData);
  input.onProgress?.({
    phase: "saving",
    completedImages: imageFiles.length,
    totalImages: imageFiles.length,
  });

  await setDoc(productRef, productData);

  const createdProduct: Product = {
    id: productId,
    ...productData,
  };

  // Product-created seller emails are intentionally disabled to avoid Resend quota waste.
  // The dashboard/onboarding success state is the product creation confirmation.

  return createdProduct;
}

export async function updateSellerProduct(
  user: User,
  product: Product,
  input: UpdateSellerProductInput
): Promise<Product> {
  if (product.sellerId !== user.uid) {
    throw new Error("You can only edit your own products.");
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error("Product title is required.");
  }

  const price = toPositiveInt(input.price, "Price");

  const inventoryQuantity = toPositiveInt(
    input.inventoryQuantity,
    "Inventory quantity"
  );
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);

  if (inventoryQuantity < reservedQuantity + soldQuantity) {
    throw new Error("Total stock cannot be less than reserved + sold quantity.");
  }

  const nextStatus =
    input.status === "draft" || input.status === "unpublished"
      ? input.status
      : getNextProductStatus({
          inventoryQuantity,
          reservedQuantity,
          soldQuantity,
        });

  let images: ProductImage[] = getPersistedProductImages(product);
  const collectionId = input.collectionId?.trim() || "";
  const collectionName = input.collectionName?.trim() || input.category?.trim() || "";

  const imageFiles = getProductImageFiles(input);

  if (imageFiles.length) {
    images = await uploadProductImages(imageFiles, title, {
      onImageUploaded: (completedImages, totalImages) =>
        input.onProgress?.({
          phase: "uploading",
          completedImages,
          totalImages,
        }),
    });
  }

  const ruleSafeImages = toRuleSafeProductImages(images);
  const primaryImageFields = getPrimaryImageFields(ruleSafeImages);
  const sizeChartImage = input.sizeChartImageFile
    ? await uploadProductImage(input.sizeChartImageFile, `${title} size chart`)
    : null;
  const sizeChartImageFields = sizeChartImage?.url
    ? {
        sizeChartImage: sizeChartImage.url,
        sizeChartImageUrl: sizeChartImage.url,
        sizeChartImageKey: sizeChartImage.key || "",
      }
    : {};
  const variantPayload = normalizeProductVariantPayload(input);

  const productRef = doc(db, "products", product.productId || product.id);
  const rawUpdatePayload = {
    title,
    description: input.description?.trim() || "",
    category: input.category?.trim() || collectionName || COMPATIBILITY_COLLECTION_NAME,
    collectionId,
    collectionName,
    price,
    inventoryQuantity,
    status: nextStatus,
    images: ruleSafeImages,
    ...primaryImageFields,
    ...sizeChartImageFields,
    ...variantPayload,
    updatedAt: serverTimestamp(),
  };
  const updatePayload = removeUndefinedFields(rawUpdatePayload);
  logProductPayloadDebug("update", updatePayload);
  input.onProgress?.({
    phase: "saving",
    completedImages: imageFiles.length,
    totalImages: imageFiles.length,
  });

  await updateDoc(productRef, updatePayload);

  return {
    ...product,
    ...updatePayload,
    collectionId,
    status: nextStatus,
    updatedAt: undefined,
  };
}

export async function deleteSellerProduct(
  user: User,
  product: Product,
  options: { preserveHistory: boolean }
): Promise<{ deleted: boolean; product?: Product }> {
  if (product.sellerId !== user.uid) {
    throw new Error("You can only delete your own products.");
  }

  const productRef = doc(db, "products", product.productId || product.id);

  if (!options.preserveHistory) {
    await deleteDoc(productRef);
    return { deleted: true };
  }

  const updatePayload = {
    status: "unpublished" as ProductStatus,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(productRef, updatePayload);

  return {
    deleted: false,
    product: {
      ...product,
      ...updatePayload,
      updatedAt: undefined,
    },
  };
}
