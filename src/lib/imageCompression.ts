import type { ProductImage } from "../types/firestore";

type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: string;
};

const MAX_ORIGINAL_BYTES = 8 * 1024 * 1024;
const MAX_COMPRESSED_DATA_URL_BYTES = 900 * 1024;
const TOO_LARGE_MESSAGE = "Image is too large. Please choose a smaller image.";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Image could not be processed. You can continue without an image."));
    };

    reader.onerror = () => {
      reject(new Error("Image could not be processed. You can continue without an image."));
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(new Error("Image could not be processed. You can continue without an image."));
    };
    image.src = dataUrl;
  });
}

function getDataUrlBytes(dataUrl: string): number {
  return Math.ceil((dataUrl.length * 3) / 4);
}

export async function compressImageFile(
  file: File,
  {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.72,
    outputType = "image/jpeg",
  }: CompressImageOptions = {}
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error(TOO_LARGE_MESSAGE);
  }

  try {
    const sourceDataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(sourceDataUrl);
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image could not be processed. You can continue without an image.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const compressedDataUrl = canvas.toDataURL(outputType, quality);

    if (getDataUrlBytes(compressedDataUrl) > MAX_COMPRESSED_DATA_URL_BYTES) {
      throw new Error(TOO_LARGE_MESSAGE);
    }

    return compressedDataUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Image could not be processed. You can continue without an image.");
  }
}

export async function compressImagePair(
  file: File,
  alt: string
): Promise<ProductImage> {
  const [mediumDataUrl, thumbDataUrl] = await Promise.all([
    compressImageFile(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.72,
      outputType: "image/jpeg",
    }),
    compressImageFile(file, {
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.68,
      outputType: "image/jpeg",
    }),
  ]);

  return {
    url: mediumDataUrl,
    mediumUrl: mediumDataUrl,
    thumbUrl: thumbDataUrl,
    alt,
    key: "",
    sortOrder: 0,
  };
}
