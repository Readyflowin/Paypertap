import type { StorefrontProduct, StorefrontStore } from "./themes/types";
import type { ProductImage } from "@/types/firestore";

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

type ImageLike = Partial<ProductImage> & {
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  url?: unknown;
};

export function normalizePublicImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";

  return value.trim();
}

export function getStorefrontImageLoading(index: number): "eager" | "lazy" {
  return index < 2 ? "eager" : "lazy";
}

export function getStorefrontImageFetchPriority(
  index: number
): "high" | "auto" {
  return index < 2 ? "high" : "auto";
}

function toArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function getImageRecordUrl(image: unknown, preferThumbnail: boolean) {
  if (typeof image === "string") return normalizePublicImageUrl(image);
  if (!image || typeof image !== "object") return "";

  const record = image as ImageLike;

  if (preferThumbnail) {
    return (
      normalizePublicImageUrl(record.thumbUrl) ||
      normalizePublicImageUrl(record.thumbnailUrl) ||
      normalizePublicImageUrl(record.url) ||
      normalizePublicImageUrl(record.mediumUrl) ||
      normalizePublicImageUrl(record.imageUrl)
    );
  }

  return (
    normalizePublicImageUrl(record.url) ||
    normalizePublicImageUrl(record.mediumUrl) ||
    normalizePublicImageUrl(record.imageUrl) ||
    normalizePublicImageUrl(record.thumbUrl) ||
    normalizePublicImageUrl(record.thumbnailUrl)
  );
}

export function getProductImageUrls(
  product: StorefrontProduct,
  preferThumbnail = false
) {
  const flexibleProduct = product as FlexibleProduct;
  const imageRecords = [
    ...toArray(product.images),
    ...toArray(flexibleProduct.productImages),
  ];
  const urls = imageRecords
    .map((image) => getImageRecordUrl(image, preferThumbnail))
    .concat(
      ...(preferThumbnail
        ? [
            normalizePublicImageUrl(flexibleProduct.thumbnailUrl),
            normalizePublicImageUrl(flexibleProduct.imageUrl),
            normalizePublicImageUrl(flexibleProduct.url),
          ]
        : [
            normalizePublicImageUrl(flexibleProduct.imageUrl),
            normalizePublicImageUrl(flexibleProduct.url),
            normalizePublicImageUrl(flexibleProduct.thumbnailUrl),
          ]),
      ...toArray(flexibleProduct.imageUrls).map(normalizePublicImageUrl),
      ...toArray(flexibleProduct.imagesUrls).map(normalizePublicImageUrl)
    )
    .filter(Boolean);

  return [...new Set(urls)].slice(0, 3);
}

export function getProductGridImageUrl(product: StorefrontProduct) {
  return getProductImageUrls(product, true)[0] || "";
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
