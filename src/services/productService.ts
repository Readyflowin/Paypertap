import type { User } from "firebase/auth";
import {
  collection,
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
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "../lib/money";
import type { Product, ProductImage, ProductStatus } from "../types/firestore";
import { sendProductAddedEmail } from "./emailEventService";
import { uploadProductImage } from "./uploadService";

type CreateSellerProductInput = {
  title: string;
  description?: string;
  price: number;
  category?: string;
  status?: ProductStatus;
  inventoryQuantity?: number;
  imageFile?: File | null;
};

export type UpdateSellerProductInput = {
  title: string;
  description?: string;
  price: number;
  category?: string;
  status: ProductStatus;
  inventoryQuantity: number;
  imageFile?: File | null;
};

function toPositiveInt(value: number, fieldName: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) {
    throw new Error(`${fieldName} must be a positive whole number.`);
  }

  return amount;
}

function normalizeProduct(productDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): Product {
  const data = productDoc.data();
  const price = Number(data.price || 0);
  const bookingAdvanceAmount =
    Number(data.bookingAdvanceAmount) ||
    Number(data.advanceAmount) ||
    BOOKING_ADVANCE_AMOUNT;
  const sellerCollectAmount =
    Number(data.sellerCollectAmount) ||
    Number(data.remainingAmount) ||
    getSellerCollectAmount(price);

  return {
    id: productDoc.id,
    ...(data as Omit<Product, "id">),
    productId: String(data.productId || productDoc.id),
    price,
    bookingAdvanceAmount,
    sellerCollectAmount,
    inventoryQuantity: Number(data.inventoryQuantity || 1),
    reservedQuantity: Number(data.reservedQuantity || 0),
    soldQuantity: Number(data.soldQuantity || 0),
  };
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

  if (price <= BOOKING_ADVANCE_AMOUNT) {
    throw new Error("Product price must be greater than ₹20.");
  }

  const inventoryQuantity = toPositiveInt(
    input.inventoryQuantity ?? 1,
    "Inventory quantity"
  );
  let productImage: ProductImage | null = null;

  if (input.imageFile) {
    productImage = await uploadProductImage(input.imageFile, title);
  }
  const images: ProductImage[] = productImage ? [productImage] : [];
  const sortOrder = Date.now();

  const productData = {
    productId,
    sellerId: user.uid,
    storeId,
    title,
    description: input.description?.trim() || "",
    price,
    bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
    sellerCollectAmount: getSellerCollectAmount(price),
    category: input.category?.trim() || "General",
    images,
    status: input.status || "open",
    isFeatured: false,
    sortOrder,
    inventoryQuantity,
    reservedQuantity: 0,
    soldQuantity: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(productRef, productData);

  const createdProduct: Product = {
    id: productId,
    ...productData,
  };

  if (user.email) {
    void sendProductAddedEmail({
      sellerEmail: user.email,
      product: createdProduct,
      storeSlug: storeId,
    }).then(async (sent) => {
      if (!sent) return;

      try {
        await updateDoc(productRef, {
          "emailEvents.productAddedSentAt": serverTimestamp(),
        });
      } catch (error) {
        console.warn("Could not mark product added email as sent:", error);
      }
    });
  }

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

  if (price <= BOOKING_ADVANCE_AMOUNT) {
    throw new Error("Product price must be greater than ₹20.");
  }

  const inventoryQuantity = toPositiveInt(
    input.inventoryQuantity,
    "Inventory quantity"
  );
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);

  if (inventoryQuantity < reservedQuantity + soldQuantity) {
    throw new Error("Inventory cannot be lower than reserved plus sold quantity.");
  }

  let images: ProductImage[] = product.images || [];

  if (input.imageFile) {
    const image = await uploadProductImage(input.imageFile, title);
    images = image ? [image] : images;
  }

  const productRef = doc(db, "products", product.productId || product.id);
  const updatePayload = {
    title,
    description: input.description?.trim() || "",
    category: input.category?.trim() || "General",
    price,
    bookingAdvanceAmount: BOOKING_ADVANCE_AMOUNT,
    sellerCollectAmount: getSellerCollectAmount(price),
    inventoryQuantity,
    status: input.status,
    images,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(productRef, updatePayload);

  return {
    ...product,
    ...updatePayload,
    updatedAt: undefined,
  };
}
