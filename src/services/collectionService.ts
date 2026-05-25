import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  COMPATIBILITY_COLLECTION_NAME,
  getCollectionNameKey,
  getCollectionSlug,
  normalizeCollectionName,
} from "../lib/collections";
import type { Product, StoreCollection } from "../types/firestore";

export type CollectionInput = {
  name: string;
  description?: string;
};

const MAX_BATCH_WRITES = 450;

function assertStoreId(storeId: string): string {
  const normalizedStoreId = storeId.trim();

  if (!normalizedStoreId) {
    throw new Error("Store setup is not ready yet.");
  }

  return normalizedStoreId;
}

function assertCollectionId(collectionId: string): string {
  const normalizedCollectionId = collectionId.trim();

  if (!normalizedCollectionId) {
    throw new Error("Collection is not ready yet.");
  }

  return normalizedCollectionId;
}

function normalizeCollectionDoc(collectionDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): StoreCollection {
  const data = collectionDoc.data();
  const name = normalizeCollectionName(String(data.name || ""));

  return {
    id: collectionDoc.id,
    collectionId: String(data.collectionId || collectionDoc.id),
    storeId: String(data.storeId || ""),
    name,
    slug: String(data.slug || getCollectionSlug(name)),
    description: String(data.description || ""),
    productCount:
      typeof data.productCount === "number" ? data.productCount : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function assertCollectionName(name: string): string {
  const normalizedName = normalizeCollectionName(name);

  if (!normalizedName) {
    throw new Error("Collection name is required.");
  }

  return normalizedName;
}

async function assertUniqueCollectionName(
  storeId: string,
  name: string,
  currentCollectionId?: string
) {
  const existingCollections = await listStoreCollections(storeId);
  const nextKey = getCollectionNameKey(name);
  const duplicate = existingCollections.find(
    (item) =>
      item.collectionId !== currentCollectionId &&
      getCollectionNameKey(item.name) === nextKey
  );

  if (duplicate) {
    throw new Error("A collection with this name already exists.");
  }
}

export async function listStoreCollections(
  storeId: string,
  products: Product[] = []
): Promise<StoreCollection[]> {
  if (!storeId) return [];

  const collectionsRef = collection(db, "stores", storeId, "collections");
  const collectionsSnap = await getDocs(collectionsRef);
  const productCounts = products.reduce((counts, product) => {
    if (product.collectionId) {
      counts.set(product.collectionId, (counts.get(product.collectionId) || 0) + 1);
    }

    return counts;
  }, new Map<string, number>());

  return collectionsSnap.docs
    .map((collectionDoc) => {
      const storeCollection = normalizeCollectionDoc(collectionDoc);

      return {
        ...storeCollection,
        productCount:
          productCounts.get(storeCollection.collectionId) ??
          storeCollection.productCount,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createStoreCollection(
  storeId: string,
  input: CollectionInput
): Promise<StoreCollection> {
  const safeStoreId = assertStoreId(storeId);
  const name = assertCollectionName(input.name);
  await assertUniqueCollectionName(safeStoreId, name);

  const collectionRef = doc(collection(db, "stores", safeStoreId, "collections"));
  const collectionId = collectionRef.id;
  const payload = {
    collectionId,
    storeId: safeStoreId,
    name,
    slug: getCollectionSlug(name),
    description: input.description?.trim() || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(collectionRef, payload);

  return {
    id: collectionId,
    ...payload,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export async function updateStoreCollection(
  storeId: string,
  collectionId: string,
  input: CollectionInput
): Promise<StoreCollection> {
  const safeStoreId = assertStoreId(storeId);
  const safeCollectionId = assertCollectionId(collectionId);
  const name = assertCollectionName(input.name);
  await assertUniqueCollectionName(safeStoreId, name, safeCollectionId);

  const payload = {
    name,
    slug: getCollectionSlug(name),
    description: input.description?.trim() || "",
    updatedAt: serverTimestamp(),
  };

  await updateDoc(
    doc(db, "stores", safeStoreId, "collections", safeCollectionId),
    payload
  );

  const productsQuery = query(
    collection(db, "products"),
    where("storeId", "==", safeStoreId),
    where("collectionId", "==", safeCollectionId)
  );
  const productsSnap = await getDocs(productsQuery);

  for (let index = 0; index < productsSnap.docs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);

    productsSnap.docs.slice(index, index + MAX_BATCH_WRITES).forEach((productDoc) => {
      batch.update(productDoc.ref, {
        category: name,
        collectionName: name,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  return {
    id: safeCollectionId,
    collectionId: safeCollectionId,
    storeId: safeStoreId,
    ...payload,
    updatedAt: undefined,
  };
}

export async function clearProductsForDeletedCollection(
  storeId: string,
  collectionId: string
): Promise<void> {
  const safeStoreId = assertStoreId(storeId);
  const safeCollectionId = assertCollectionId(collectionId);
  const productsQuery = query(
    collection(db, "products"),
    where("storeId", "==", safeStoreId),
    where("collectionId", "==", safeCollectionId)
  );
  const productsSnap = await getDocs(productsQuery);

  for (let index = 0; index < productsSnap.docs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);

    productsSnap.docs.slice(index, index + MAX_BATCH_WRITES).forEach((productDoc) => {
      batch.update(productDoc.ref, {
        collectionId: "",
        collectionName: "",
        category: COMPATIBILITY_COLLECTION_NAME,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
}

export async function deleteStoreCollection(
  storeId: string,
  collectionId: string
): Promise<void> {
  const safeStoreId = assertStoreId(storeId);
  const safeCollectionId = assertCollectionId(collectionId);

  await clearProductsForDeletedCollection(safeStoreId, safeCollectionId);
  await deleteDoc(doc(db, "stores", safeStoreId, "collections", safeCollectionId));
}

export async function assignProductToCollection(
  storeId: string,
  product: Pick<Product, "id" | "productId" | "storeId">,
  collection?: Pick<StoreCollection, "collectionId" | "name"> | null
): Promise<void> {
  const safeStoreId = assertStoreId(storeId);
  const productId = product.id || product.productId;

  if (!productId || product.storeId !== safeStoreId) {
    throw new Error("This product does not belong to the current store.");
  }

  await updateDoc(doc(db, "products", productId), {
    collectionId: collection?.collectionId || "",
    collectionName: collection?.name || "",
    category: collection?.name || COMPATIBILITY_COLLECTION_NAME,
    updatedAt: serverTimestamp(),
  });
}

export const createCollection = createStoreCollection;
export const updateCollection = updateStoreCollection;
export const deleteCollection = deleteStoreCollection;
