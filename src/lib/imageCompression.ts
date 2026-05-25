export type ImageCompressionPreset = {
  maxLongestSide: number;
  quality: number;
  outputType: "image/webp";
  suffix: string;
};

export const IMAGE_COMPRESSION_PRESETS = {
  productMain: {
    maxLongestSide: 1400,
    quality: 0.8,
    outputType: "image/webp",
    suffix: "main",
  },
  productThumbnail: {
    maxLongestSide: 600,
    quality: 0.74,
    outputType: "image/webp",
    suffix: "thumb",
  },
  storeLogo: {
    maxLongestSide: 512,
    quality: 0.82,
    outputType: "image/webp",
    suffix: "logo",
  },
  storefrontBanner: {
    maxLongestSide: 1800,
    quality: 0.8,
    outputType: "image/webp",
    suffix: "banner",
  },
} satisfies Record<string, ImageCompressionPreset>;

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
export const MAX_PRODUCT_IMAGE_COUNT = 3;

export function isAllowedImageFile(file: File): boolean {
  if (allowedImageMimeTypes.has(file.type)) return true;

  const extension = getFileExtension(file.name);
  return allowedImageExtensions.has(extension);
}

export function assertValidImageFile(file: File) {
  if (!isAllowedImageFile(file)) {
    throw new Error("Please choose a JPEG, PNG, or WebP image.");
  }
}

export function assertValidImageFiles(files: File[], maxCount = MAX_PRODUCT_IMAGE_COUNT) {
  if (files.length > maxCount) {
    throw new Error(`Please choose up to ${maxCount} product images.`);
  }

  files.forEach(assertValidImageFile);
}

export async function compressImage(
  file: File,
  preset: ImageCompressionPreset
): Promise<File> {
  try {
    assertValidImageFile(file);

    const source = await loadImageSource(file);
    const { width, height } = getTargetSize(
      source.width,
      source.height,
      preset.maxLongestSide
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true,
    });

    if (!context) {
      throw new Error("Canvas compression is not available in this browser.");
    }

    context.drawImage(source.image, 0, 0, width, height);
    source.dispose();

    const blob = await canvasToBlob(canvas, preset.outputType, preset.quality);
    const mimeType = blob.type || preset.outputType;

    return new File([blob], getCompressedFilename(file.name, preset.suffix, mimeType), {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression failed; uploading original image instead.", error);
    return file;
  }
}

export function compressProductImageSet(file: File) {
  return Promise.all([
    compressImage(file, IMAGE_COMPRESSION_PRESETS.productMain),
    compressImage(file, IMAGE_COMPRESSION_PRESETS.productThumbnail),
  ]).then(([mainFile, thumbnailFile]) => ({
    mainFile,
    thumbnailFile,
  }));
}

export function compressLogoImage(file: File) {
  return compressImage(file, IMAGE_COMPRESSION_PRESETS.storeLogo);
}

export function compressStorefrontImage(file: File) {
  return compressImage(file, IMAGE_COMPRESSION_PRESETS.storefrontBanner);
}

function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase().trim() || "";
}

function getCompressedFilename(filename: string, suffix: string, mimeType: string) {
  const extension = mimeType === "image/webp" ? "webp" : getFileExtension(filename) || "jpg";
  const baseName =
    filename
      .replace(/\.[^.]+$/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";

  return `${baseName}-${suffix}.${extension}`;
}

function getTargetSize(width: number, height: number, maxLongestSide: number) {
  const longestSide = Math.max(width, height);

  if (longestSide <= maxLongestSide) {
    return {
      width,
      height,
    };
  }

  const scale = maxLongestSide / longestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress image."));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

async function loadImageSource(file: File): Promise<{
  image: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
}> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    return {
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read image file."));
      element.src = objectUrl;
    });

    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}
