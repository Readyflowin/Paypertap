import type { ProductImage } from "../types/firestore";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 5 * 1024 * 1024;

type UploadFolder = "stores" | "products" | "test";

type UploadImageResponse = {
  success?: boolean;
  url?: string | null;
  key?: string;
  error?: string;
};

function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

function getUploadError(data: UploadImageResponse, fallback: string) {
  return data.error?.trim() || fallback;
}

export async function uploadImageToR2(
  file: File,
  folder: UploadFolder = "test"
): Promise<{ url: string; key: string }> {
  validateImageFile(file);

  // TODO: add client-side compression before upload for large images.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as UploadImageResponse;

  if (!response.ok || !data.success) {
    throw new Error(getUploadError(data, "Image upload failed. Please try again."));
  }

  if (!data.url || !data.key) {
    throw new Error("Image uploaded, but the public URL was not returned.");
  }

  return {
    url: data.url,
    key: data.key,
  };
}

export async function uploadProductImage(
  file: File | null | undefined,
  alt = "Product image"
): Promise<ProductImage | null> {
  if (!file) return null;

  const uploadedImage = await uploadImageToR2(file, "products");

  return {
    url: uploadedImage.url,
    thumbUrl: uploadedImage.url,
    alt: alt.trim() || file.name || "Product image",
    key: uploadedImage.key,
    sortOrder: 0,
  };
}
