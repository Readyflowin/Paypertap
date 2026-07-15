import type { ProductImage } from "../types/firestore";
import { auth } from "../lib/firebase";
import {
  assertValidImageFile,
  assertValidImageFiles,
  compressImage,
  compressHeroImage,
  compressLogoImage,
  compressStorefrontImage,
  IMAGE_COMPRESSION_PRESETS,
  MAX_PRODUCT_IMAGE_COUNT,
  type ImageCompressionPreset,
} from "../lib/imageCompression";
import { isDurableImageUrl } from "../lib/imageUrls";

const maxOptimizedImageSize = 12 * 1024 * 1024;
const imageProcessingErrorMessage =
  "Could not process this image. Please try another photo or screenshot.";
export const PUBLIC_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function getPublicImageCacheControl() {
  return PUBLIC_IMAGE_CACHE_CONTROL;
}

type UploadFolder = "stores" | "products" | "heroes" | "test";

type UploadImageResponse = {
  success?: boolean;
  url?: string | null;
  key?: string;
  cacheControl?: string;
  error?: string;
};

function validateUploadFile(file: File) {
  assertValidImageFile(file);
  if (file.size > maxOptimizedImageSize) {
    throw new Error(imageProcessingErrorMessage);
  }
}

function getUploadError(data: UploadImageResponse, fallback: string) {
  return data.error?.trim() || fallback;
}

async function uploadImageBlobToR2(
  file: File,
  folder: UploadFolder = "test"
): Promise<{ url: string; key: string }> {
  validateUploadFile(file);

  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error("Please sign in before uploading images.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload?action=image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as UploadImageResponse;

  if (!response.ok || !data.success) {
    throw new Error(getUploadError(data, "Image upload failed. Please try again."));
  }

  if (!data.url || !data.key || !isDurableImageUrl(data.url)) {
    throw new Error(
      "Image upload is not configured with a durable public URL. Please check storage settings and try again."
    );
  }

  return {
    url: data.url,
    key: data.key,
  };
}

function getDefaultPresetForFolder(folder: UploadFolder): ImageCompressionPreset {
  if (folder === "stores") return IMAGE_COMPRESSION_PRESETS.storeLogo;
  if (folder === "products") return IMAGE_COMPRESSION_PRESETS.productMain;
  if (folder === "heroes") return IMAGE_COMPRESSION_PRESETS.storefrontHero;
  return IMAGE_COMPRESSION_PRESETS.storefrontBanner;
}

export async function uploadCompressedImage(
  file: File,
  folder: UploadFolder = "test",
  preset: ImageCompressionPreset = getDefaultPresetForFolder(folder)
): Promise<{ url: string; key: string }> {
  const compressedFile = await compressImage(file, preset);
  return uploadImageBlobToR2(compressedFile, folder);
}

export async function uploadImageToR2(
  file: File,
  folder: UploadFolder = "test"
): Promise<{ url: string; key: string }> {
  if (folder === "stores") {
    const compressedLogo = await compressLogoImage(file);
    return uploadImageBlobToR2(compressedLogo, folder);
  }

  if (folder === "products") {
    return uploadCompressedImage(file, folder, IMAGE_COMPRESSION_PRESETS.productMain);
  }

  const compressedImage = await compressStorefrontImage(file);
  return uploadImageBlobToR2(compressedImage, folder);
}

export async function uploadHeroImage(
  file: File
): Promise<{ url: string; key: string }> {
  const heroFile = await compressHeroImage(file);
  return uploadImageBlobToR2(heroFile, "heroes");
}

export async function uploadOptimizedHeroImage(
  file: File
): Promise<{ url: string; key: string }> {
  validateUploadFile(file);
  return uploadImageBlobToR2(file, "heroes");
}

export async function uploadProductImage(
  file: File | null | undefined,
  alt = "Product image"
): Promise<ProductImage | null> {
  if (!file) return null;

  const mainFile = await compressImage(file, IMAGE_COMPRESSION_PRESETS.productMain);
  // Product uploads intentionally create one optimized object per selected image.
  // Old thumbnail fields remain readable, but new uploads do not create thumb objects.
  const uploadedImage = await uploadImageBlobToR2(mainFile, "products");

  return {
    url: uploadedImage.url,
    alt: alt.trim() || file.name || "Product image",
    key: uploadedImage.key,
    sortOrder: 0,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
}

export async function uploadProductImages(
  files: File[],
  alt = "Product image",
  options: {
    concurrency?: number;
    onImageUploaded?: (completedImages: number, totalImages: number) => void;
  } = {}
): Promise<ProductImage[]> {
  assertValidImageFiles(files, MAX_PRODUCT_IMAGE_COUNT);
  options.onImageUploaded?.(0, files.length);

  let completedImages = 0;
  const concurrency = Math.min(
    Math.max(options.concurrency ?? 2, 1),
    MAX_PRODUCT_IMAGE_COUNT
  );

  const images = await mapWithConcurrency(files, concurrency, async (file, index) => {
    const image = await uploadProductImage(file, alt);
    completedImages += 1;
    options.onImageUploaded?.(completedImages, files.length);

    return image
      ? {
          ...image,
          sortOrder: index,
        }
      : null;
  });

  return images.filter((image): image is ProductImage => Boolean(image));
}
