import type { ProductImage } from "../types/firestore";
import { auth } from "../lib/firebase";
import {
  assertValidImageFile,
  assertValidImageFiles,
  compressImage,
  compressLogoImage,
  compressProductImageSet,
  compressStorefrontImage,
  IMAGE_COMPRESSION_PRESETS,
  MAX_PRODUCT_IMAGE_COUNT,
  type ImageCompressionPreset,
} from "../lib/imageCompression";
import { isDurableImageUrl } from "../lib/imageUrls";

const maxImageSize = 5 * 1024 * 1024;
export const PUBLIC_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function getPublicImageCacheControl() {
  return PUBLIC_IMAGE_CACHE_CONTROL;
}

type UploadFolder = "stores" | "products" | "test";

type UploadImageResponse = {
  success?: boolean;
  url?: string | null;
  key?: string;
  cacheControl?: string;
  error?: string;
};

function validateUploadFile(file: File) {
  assertValidImageFile(file);
  if (file.size > maxImageSize) {
    throw new Error("Image must be 5MB or smaller.");
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

  const response = await fetch("/api/upload-image", {
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

export async function uploadProductImage(
  file: File | null | undefined,
  alt = "Product image"
): Promise<ProductImage | null> {
  if (!file) return null;

  const { mainFile, thumbnailFile } = await compressProductImageSet(file);
  const [uploadedImage, uploadedThumbnail] = await Promise.all([
    uploadImageBlobToR2(mainFile, "products"),
    uploadImageBlobToR2(thumbnailFile, "products"),
  ]);

  return {
    url: uploadedImage.url,
    thumbUrl: uploadedThumbnail.url,
    alt: alt.trim() || file.name || "Product image",
    key: uploadedImage.key,
    thumbKey: uploadedThumbnail.key,
    sortOrder: 0,
  };
}

export async function uploadProductImages(
  files: File[],
  alt = "Product image"
): Promise<ProductImage[]> {
  assertValidImageFiles(files, MAX_PRODUCT_IMAGE_COUNT);

  const images = await Promise.all(
    files.map(async (file, index) => {
      const image = await uploadProductImage(file, alt);

      return image
        ? {
            ...image,
            sortOrder: index,
          }
        : null;
    })
  );

  return images.filter((image): image is ProductImage => Boolean(image));
}
