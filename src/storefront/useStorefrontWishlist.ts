import { useCallback, useEffect, useMemo, useState } from "react";

import type { StorefrontProduct } from "./themes/types";

const WISHLIST_STORAGE_PREFIX = "paypertap:wishlist";

type FlexibleWishlistProduct = StorefrontProduct & {
  category?: unknown;
  name?: unknown;
  price?: unknown;
  slug?: unknown;
};

type WishlistOptions = {
  isPreview?: boolean;
  storeId?: string;
  storeSlug?: string;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toKeyPart(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return toText(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readWishlist(storageKey: string) {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      writeWishlist(storageKey, new Set<string>());
      return new Set<string>();
    }

    return new Set(
      parsedValue.filter((item): item is string => typeof item === "string")
    );
  } catch (error) {
    console.warn("Unable to read PayPerTap wishlist.", error);
    writeWishlist(storageKey, new Set<string>());
    return new Set<string>();
  }
}

function writeWishlist(storageKey: string, ids: Set<string>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.warn("Unable to save PayPerTap wishlist.", error);
  }
}

export function getStorefrontWishlistProductKey(
  product: StorefrontProduct,
  fallbackIndex = 0
) {
  const flexibleProduct = product as FlexibleWishlistProduct;
  const stableId =
    toText(product.id) || toText(product.productId) || toText(flexibleProduct.slug);

  if (stableId) {
    return `product:${stableId}`;
  }

  const fallbackLabel = [
    toText(product.title) || toText(flexibleProduct.name),
    toKeyPart(product.category) || toKeyPart(flexibleProduct.category),
    toKeyPart(product.price) || toKeyPart(flexibleProduct.price),
  ]
    .filter(Boolean)
    .join("-");

  return `fallback:${slugify(fallbackLabel) || `item-${fallbackIndex}`}`;
}

export function getWishlistKey({
  isPreview,
  storeId,
  storeSlug,
}: WishlistOptions) {
  const storeScope = slugify(storeSlug || storeId || "unknown-store");
  const mode = isPreview ? "preview" : "store";

  return `${WISHLIST_STORAGE_PREFIX}:${mode}:${storeScope}`;
}

export function useStorefrontWishlist(options: WishlistOptions) {
  const storageKey = useMemo(() => getWishlistKey(options), [options]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(
    () => new Set<string>()
  );

  useEffect(() => {
    setWishlistedIds(readWishlist(storageKey));
  }, [storageKey]);

  const isWishlisted = useCallback(
    (product: StorefrontProduct, fallbackIndex?: number) =>
      wishlistedIds.has(getStorefrontWishlistProductKey(product, fallbackIndex)),
    [wishlistedIds]
  );

  const toggleWishlistItem = useCallback(
    (product: StorefrontProduct, fallbackIndex?: number) => {
      const productKey = getStorefrontWishlistProductKey(product, fallbackIndex);

      setWishlistedIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(productKey)) {
          nextIds.delete(productKey);
        } else {
          nextIds.add(productKey);
        }

        writeWishlist(storageKey, nextIds);
        return nextIds;
      });
    },
    [storageKey]
  );

  return {
    isWishlisted,
    toggleWishlistItem,
    wishlistedIds: Array.from(wishlistedIds),
    wishlistCount: wishlistedIds.size,
  };
}
