import type { StorefrontProduct, StorefrontStore } from "./themes/types";
import {
  getDisplayImageUrl,
  getPrimaryProductImage,
  getProductImageUrls as getNormalizedProductImageUrls,
} from "@/lib/imageUrls";

type FlexibleStore = StorefrontStore & {
  bannerImageUrl?: unknown;
  bannerUrl?: unknown;
  coverImageUrl?: unknown;
  coverUrl?: unknown;
  headerImageUrl?: unknown;
  heroImage?: unknown;
  heroUrl?: unknown;
};

type FlexibleProduct = StorefrontProduct & {
  imageUrl?: unknown;
  imageUrls?: unknown;
  imagesUrls?: unknown;
  productImages?: unknown;
  thumbnailUrl?: unknown;
  url?: unknown;
};

export function normalizePublicImageUrl(value: unknown): string {
  return getDisplayImageUrl(value);
}

export function getStorefrontImageLoading(index: number): "eager" | "lazy" {
  return index < 2 ? "eager" : "lazy";
}

export function getStorefrontImageFetchPriority(
  index: number
): "high" | "auto" {
  return index < 2 ? "high" : "auto";
}

export function getProductImageUrls(
  product: StorefrontProduct,
  preferThumbnail = false
) {
  const images = getNormalizedProductImageUrls(product as FlexibleProduct);
  const urls = images
    .map((image) =>
      preferThumbnail
        ? image.thumbnailUrl || image.thumbUrl || image.url
        : image.url || image.thumbnailUrl || image.thumbUrl
    )
    .filter(Boolean);

  return [...new Set(urls)].slice(0, 3);
}

export function getProductGridImageUrl(product: StorefrontProduct) {
  return getPrimaryProductImage(product as FlexibleProduct);
}

export function getProductDetailImageUrls(product: StorefrontProduct) {
  return getProductImageUrls(product, false);
}

export function getStoreHeroImageUrl(store: StorefrontStore) {
  const flexibleStore = store as FlexibleStore;

  return (
    normalizePublicImageUrl(store.heroImageUrl) ||
    normalizePublicImageUrl(flexibleStore.heroUrl) ||
    normalizePublicImageUrl(flexibleStore.heroImage) ||
    normalizePublicImageUrl(flexibleStore.coverImageUrl) ||
    normalizePublicImageUrl(flexibleStore.coverUrl) ||
    normalizePublicImageUrl(flexibleStore.bannerImageUrl) ||
    normalizePublicImageUrl(flexibleStore.bannerUrl) ||
    normalizePublicImageUrl(flexibleStore.headerImageUrl)
  );
}
