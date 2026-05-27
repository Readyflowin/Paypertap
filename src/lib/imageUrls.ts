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
  if (!Array.isArray(images)) return [];

  return images.flatMap((image, index) => {
    if (!image || typeof image !== "object") return [];

    const record = image as Partial<ProductImage> & {
      thumbnailUrl?: unknown;
    };
    const url = getDurableImageUrl(record.url);
    const thumbUrl =
      getDurableImageUrl(record.thumbUrl) ||
      getDurableImageUrl(record.thumbnailUrl) ||
      url;
    const mediumUrl = getDurableImageUrl(record.mediumUrl);

    if (!url) return [];

    return [
      {
        url,
        thumbUrl,
        alt:
          typeof record.alt === "string" && record.alt.trim()
            ? record.alt.trim()
            : "Product image",
        key: typeof record.key === "string" ? record.key : "",
        sortOrder:
          typeof record.sortOrder === "number" && Number.isFinite(record.sortOrder)
            ? record.sortOrder
            : index,
        ...(typeof record.thumbKey === "string" && record.thumbKey
          ? { thumbKey: record.thumbKey }
          : {}),
        ...(mediumUrl ? { mediumUrl } : {}),
      },
    ];
  });
}
