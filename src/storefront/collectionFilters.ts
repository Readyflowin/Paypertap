import type { StorefrontProduct } from "./themes/types";
import type { StoreCollection } from "@/types/firestore";
import {
  getCollectionNameKey,
  isCompatibilityCollectionName,
  normalizeCollectionName,
} from "@/lib/collections";

export const ALL_COLLECTIONS = "All";

type CollectionProduct = StorefrontProduct & {
  categoryName?: unknown;
  collectionId?: unknown;
  collectionName?: unknown;
  name?: unknown;
};

type CollectionLike = Pick<StoreCollection, "collectionId" | "name">;

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toSearchText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toSearchText).filter(Boolean).join(" ");
  }

  return "";
}

function toInitialsSearchText(value: unknown): string {
  return toSearchText(value)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toLowerCase();
}

export function getProductCollection(product: StorefrontProduct): string {
  const flexibleProduct = product as CollectionProduct;
  const explicitCollection =
    toText(flexibleProduct.collectionName) ||
    toText(flexibleProduct.categoryName);

  if (explicitCollection) {
    return normalizeCollectionName(explicitCollection);
  }

  const legacyCategory = normalizeCollectionName(toText(product.category));

  return legacyCategory && !isCompatibilityCollectionName(legacyCategory)
    ? legacyCategory
    : "";
}

export function getProductCollectionId(product: StorefrontProduct): string {
  const flexibleProduct = product as CollectionProduct;

  return toText(flexibleProduct.collectionId);
}

export function getUniqueCollections(
  products: StorefrontProduct[],
  managedCollections: CollectionLike[] = []
): string[] {
  const collectionsByKey = new Map<string, string>();
  const managedNamesById = new Map<string, string>();

  managedCollections.forEach((collection) => {
    const collectionName = normalizeCollectionName(collection.name);
    const key = getCollectionNameKey(collectionName);

    if (collectionName && !collectionsByKey.has(key)) {
      collectionsByKey.set(key, collectionName);
    }

    if (collection.collectionId && collectionName) {
      managedNamesById.set(collection.collectionId, collectionName);
    }
  });

  products.forEach((product) => {
    const productCollectionId = getProductCollectionId(product);

    if (productCollectionId && managedNamesById.has(productCollectionId)) {
      return;
    }

    const collectionName = getProductCollection(product);
    const key = getCollectionNameKey(collectionName);

    if (collectionName && !collectionsByKey.has(key)) {
      collectionsByKey.set(key, collectionName);
    }
  });

  return Array.from(collectionsByKey.values()).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function filterProductsByCollection(
  products: StorefrontProduct[],
  collectionName: string,
  managedCollections: CollectionLike[] = []
): StorefrontProduct[] {
  if (!collectionName || collectionName === ALL_COLLECTIONS) {
    return products;
  }

  const selectedKey = getCollectionNameKey(collectionName);
  const managedCollection = managedCollections.find(
    (collection) => getCollectionNameKey(collection.name) === selectedKey
  );

  return products.filter((product) => {
    const productCollectionId = getProductCollectionId(product);

    if (
      managedCollection?.collectionId &&
      productCollectionId === managedCollection.collectionId
    ) {
      return true;
    }

    return getCollectionNameKey(getProductCollection(product)) === selectedKey;
  });
}

export function normalizeSearchQuery(query: unknown): string {
  return toSearchText(query).replace(/\s+/g, " ").trim().toLowerCase();
}

export function getProductSearchText(product: StorefrontProduct): string {
  const flexibleProduct = product as CollectionProduct;

  return [
    toSearchText(product.title),
    toSearchText(flexibleProduct.name),
    toSearchText(product.description),
    toSearchText(flexibleProduct.collectionName),
    toSearchText(flexibleProduct.categoryName),
    toSearchText(flexibleProduct.collectionId),
    toSearchText(product.category),
    toInitialsSearchText(product.title),
    toInitialsSearchText(flexibleProduct.name),
    toInitialsSearchText(product.category),
    toInitialsSearchText(flexibleProduct.collectionName),
    toInitialsSearchText(flexibleProduct.categoryName),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function filterProductsBySearch(
  products: StorefrontProduct[],
  query: string
): StorefrontProduct[] {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    getProductSearchText(product).includes(normalizedQuery)
  );
}

export function filterProductsByCollectionAndSearch(
  products: StorefrontProduct[],
  collectionName: string,
  query: string,
  managedCollections: CollectionLike[] = []
): StorefrontProduct[] {
  return filterProductsBySearch(
    filterProductsByCollection(products, collectionName, managedCollections),
    query
  );
}
