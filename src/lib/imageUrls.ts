import type { ProductImage } from "../types/firestore";

const localhostHostnames = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

type DurableImageUrlOptions = {
  allowDataUrl?: boolean;
  allowRelativeStaticAsset?: boolean;
};

export function isDurableImageUrl(
  value: unknown,
  {
    allowDataUrl = false,
    allowRelativeStaticAsset = false,
  }: DurableImageUrlOptions = {}
): value is string {
  if (typeof value !== "string") return false;

  const url = value.trim();
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.startsWith("blob:") || lowerUrl.startsWith("file:")) {
    return false;
  }

  if (lowerUrl.startsWith("data:")) {
    return allowDataUrl && lowerUrl.startsWith("data:image/");
  }

  if (allowRelativeStaticAsset && url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return false;
    }

    return !localhostHostnames.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function getDurableImageUrl(
  value: unknown,
  options?: DurableImageUrlOptions
) {
  return isDurableImageUrl(value, options) ? value.trim() : "";
}

export function getDisplayImageUrl(value: unknown) {
  return getDurableImageUrl(value, {
    allowDataUrl: true,
    allowRelativeStaticAsset: true,
  });
}

type ProductImageSource = Partial<ProductImage> & {
  publicUrl?: unknown;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  url?: unknown;
};

type ProductImageProduct = {
  images?: unknown;
  imageUrl?: unknown;
  imageUrls?: unknown;
  imagesUrls?: unknown;
  productImages?: unknown;
  thumbnailUrl?: unknown;
  title?: unknown;
  url?: unknown;
};

function removeUndefinedImageFields(image: ProductImage): ProductImage {
  return Object.fromEntries(
    Object.entries(image).filter(([, value]) => value !== undefined)
  ) as ProductImage;
}

function getImagePrimaryUrl(record: ProductImageSource) {
  return (
    getDurableImageUrl(record.url) ||
    getDurableImageUrl(record.publicUrl) ||
    getDurableImageUrl(record.imageUrl)
  );
}

function getSafeImageSortOrder(value: unknown, fallbackIndex: number) {
  if (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 2) {
    return Number(value);
  }

  return Math.min(Math.max(fallbackIndex, 0), 2);
}

function getSafeImageAlt(value: unknown, productTitle: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return productTitle.trim() || "Product image";
}

export function normalizeProductImages(
  uploadResults: unknown,
  productTitle = "Product image"
): ProductImage[] {
  if (!Array.isArray(uploadResults)) return [];

  return uploadResults.slice(0, 3).flatMap((image, index) => {
    if (typeof image === "string") {
      const url = getDurableImageUrl(image);
      return url
        ? [
            {
              url,
              thumbnailUrl: url,
              thumbUrl: url,
              alt: productTitle.trim() || "Product image",
              sortOrder: index,
            },
          ]
        : [];
    }

    if (!image || typeof image !== "object") return [];

    const record = image as ProductImageSource;
    const url = getImagePrimaryUrl(record);
    if (!url) return [];

    const thumbnailUrl =
      getDurableImageUrl(record.thumbnailUrl) ||
      getDurableImageUrl(record.thumbUrl);
    const key = typeof record.key === "string" ? record.key.trim() : "";
    const thumbKey =
      typeof record.thumbKey === "string" ? record.thumbKey.trim() : "";

    return [
      removeUndefinedImageFields({
        url,
        ...(thumbnailUrl ? { thumbnailUrl, thumbUrl: thumbnailUrl } : {}),
        ...(key ? { key } : {}),
        ...(thumbKey ? { thumbKey } : {}),
        alt: getSafeImageAlt(record.alt, productTitle),
        sortOrder: getSafeImageSortOrder(record.sortOrder, index),
      }),
    ];
  });
}

export function getProductImageUrls(product: ProductImageProduct): ProductImage[] {
  const productTitle =
    typeof product.title === "string" ? product.title : "Product image";
  const images = [
    ...normalizeProductImages(product.images, productTitle),
    ...normalizeProductImages(product.productImages, productTitle),
  ].slice(0, 3);

  if (images.length) return images;

  const legacyImages = normalizeProductImages(
    [
      ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
      ...(Array.isArray(product.imagesUrls) ? product.imagesUrls : []),
    ],
    productTitle
  );

  if (legacyImages.length) return legacyImages;

  const imageUrl =
    getDurableImageUrl(product.imageUrl) || getDurableImageUrl(product.url);
  if (!imageUrl) return [];

  const thumbnailUrl = getDurableImageUrl(product.thumbnailUrl) || imageUrl;

  return [
    {
      url: imageUrl,
      thumbnailUrl,
      thumbUrl: thumbnailUrl,
      alt: productTitle,
      sortOrder: 0,
    },
  ];
}

export function getPrimaryProductImage(product: ProductImageProduct) {
  const images = getProductImageUrls(product);
  const firstImage = images[0];

  return (
    getDisplayImageUrl(firstImage?.thumbnailUrl) ||
    getDisplayImageUrl(firstImage?.thumbUrl) ||
    getDisplayImageUrl(firstImage?.url) ||
    getDisplayImageUrl(product.thumbnailUrl) ||
    getDisplayImageUrl(product.imageUrl)
  );
}

export function hasTemporaryImageUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const url = value.trim();
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.startsWith("blob:") || lowerUrl.startsWith("file:")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return localhostHostnames.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function imageRecordHasTemporaryUrl(image: unknown) {
  if (typeof image === "string") return hasTemporaryImageUrl(image);
  if (!image || typeof image !== "object") return false;

  const record = image as Partial<ProductImage> & {
    imageUrl?: unknown;
    thumbnailUrl?: unknown;
  };

  return [
    record.url,
    record.thumbUrl,
    record.mediumUrl,
    record.imageUrl,
    record.thumbnailUrl,
  ].some(hasTemporaryImageUrl);
}

export function productHasTemporaryImageUrls(product: { images?: unknown }) {
  const record = product as {
    imageUrl?: unknown;
    imageUrls?: unknown;
    imagesUrls?: unknown;
    productImages?: unknown;
    thumbnailUrl?: unknown;
    url?: unknown;
  };

  return [
    record.imageUrl,
    record.thumbnailUrl,
    record.url,
    ...(Array.isArray(record.imageUrls) ? record.imageUrls : []),
    ...(Array.isArray(record.imagesUrls) ? record.imagesUrls : []),
    ...(Array.isArray(record.images) ? record.images : []),
    ...(Array.isArray(record.productImages) ? record.productImages : []),
  ].some(imageRecordHasTemporaryUrl);
}

export function sanitizePersistedProductImages(images: unknown): ProductImage[] {
  return normalizeProductImages(images);
}
