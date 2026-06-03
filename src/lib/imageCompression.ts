export type ImageCompressionPreset = {
  maxLongestSide: number;
  quality: number;
  minQuality: number;
  targetBytes: number;
  softMaxBytes: number;
  dimensionSteps: number[];
  outputType: ImageOutputType;
  fallbackOutputType?: ImageOutputType;
  preserveTransparency?: boolean;
  suffix: string;
};

type ImageOutputType = "image/webp" | "image/jpeg" | "image/png";

type LoadedImageSource = {
  image: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  mimeType: ImageOutputType;
};

const PROCESSING_ERROR_MESSAGE =
  "Could not process this image. Please try another photo or screenshot.";
const KILOBYTE = 1024;
const QUALITY_STEP = 0.06;

export const IMAGE_COMPRESSION_PRESETS = {
  productMain: {
    maxLongestSide: 1200,
    quality: 0.78,
    minQuality: 0.56,
    targetBytes: 600 * KILOBYTE,
    softMaxBytes: 700 * KILOBYTE,
    dimensionSteps: [1200, 1080, 960, 850],
    outputType: "image/webp",
    fallbackOutputType: "image/jpeg",
    suffix: "main",
  },
  storeLogo: {
    maxLongestSide: 768,
    quality: 0.82,
    minQuality: 0.64,
    targetBytes: 250 * KILOBYTE,
    softMaxBytes: 320 * KILOBYTE,
    dimensionSteps: [768, 640, 512],
    outputType: "image/webp",
    fallbackOutputType: "image/png",
    preserveTransparency: true,
    suffix: "logo",
  },
  storefrontBanner: {
    maxLongestSide: 1800,
    quality: 0.8,
    minQuality: 0.58,
    targetBytes: 900 * KILOBYTE,
    softMaxBytes: 1200 * KILOBYTE,
    dimensionSteps: [1800, 1600, 1400, 1200],
    outputType: "image/webp",
    fallbackOutputType: "image/jpeg",
    suffix: "banner",
  },
  storefrontHero: {
    maxLongestSide: 1800,
    quality: 0.82,
    minQuality: 0.58,
    targetBytes: 600 * KILOBYTE,
    softMaxBytes: 800 * KILOBYTE,
    dimensionSteps: [1800, 1600, 1400, 1200],
    outputType: "image/webp",
    fallbackOutputType: "image/jpeg",
    suffix: "hero",
  },
} satisfies Record<string, ImageCompressionPreset>;

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
export const MAX_PRODUCT_IMAGE_COUNT = 3;

export function isAllowedImageFile(file: File): boolean {
  if (allowedImageMimeTypes.has(file.type)) return true;

  const extension = getFileExtension(file.name);
  return allowedImageExtensions.has(extension);
}

export function assertValidImageFile(file: File) {
  if (!isAllowedImageFile(file)) {
    throw new Error("Please choose a PNG, JPG, JPEG, or WebP image.");
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
  assertValidImageFile(file);

  let source: LoadedImageSource | null = null;

  try {
    source = await loadImageSource(file);
    const result = await compressImageSource(file, source, preset);

    logCompressionDiagnostics(file, preset, result);

    return new File([result.blob], getCompressedFilename(file.name, preset.suffix, result.mimeType), {
      type: result.mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression failed.", error);
    throw new Error(PROCESSING_ERROR_MESSAGE);
  } finally {
    source?.dispose();
  }
}

export function compressLogoImage(file: File) {
  return compressImage(file, IMAGE_COMPRESSION_PRESETS.storeLogo);
}

export function compressStorefrontImage(file: File) {
  return compressImage(file, IMAGE_COMPRESSION_PRESETS.storefrontBanner);
}

export async function cropImageToAspectRatio(
  file: File,
  aspectRatio = 2 / 3
): Promise<File> {
  assertValidImageFile(file);

  let source: LoadedImageSource | null = null;

  try {
    source = await loadImageSource(file);
    const crop = getCenteredCrop(source.width, source.height, aspectRatio);
    const target = getHeroTargetSize(crop.width, crop.height);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      throw new Error("Canvas crop is not available in this browser.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(
      source.image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      target.width,
      target.height
    );

    const result = await compressHeroCanvas(canvas);

    return new File(
      [result.blob],
      getCompressedFilename(file.name, "hero", result.mimeType),
      {
        type: result.mimeType,
        lastModified: Date.now(),
      }
    );
  } catch (error) {
    console.warn("Hero image crop failed.", error);
    throw new Error("Could not process this image. Please try another photo.");
  } finally {
    source?.dispose();
  }
}

export function compressHeroImage(file: File) {
  return cropImageToAspectRatio(file, 2 / 3);
}

function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase().trim() || "";
}

function getCompressedFilename(filename: string, suffix: string, mimeType: string) {
  const extension = getExtensionForMimeType(mimeType);
  const baseName =
    filename
      .replace(/\.[^.]+$/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";

  return `${baseName}-${suffix}.${extension}`;
}

function getExtensionForMimeType(mimeType: string) {
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/png") return "png";
  return "jpg";
}

async function compressImageSource(
  file: File,
  source: LoadedImageSource,
  preset: ImageCompressionPreset
): Promise<CompressionResult> {
  const outputTypes = getOutputTypes(preset);
  let bestResult: CompressionResult | null = null;

  for (const outputType of outputTypes) {
    const dimensionSteps = getDimensionSteps(source.width, source.height, preset);

    for (const maxLongestSide of dimensionSteps) {
      const { width, height } = getTargetSize(source.width, source.height, maxLongestSide);
      const canvas = renderToCanvas(source, width, height, outputType, preset);
      const dimensionBest = await compressCanvas(canvas, outputType, preset);

      if (!dimensionBest) {
        continue;
      }

      bestResult = getBetterResult(bestResult, dimensionBest);

      if (dimensionBest.blob.size <= preset.targetBytes) {
        return dimensionBest;
      }

      if (dimensionBest.blob.size <= preset.softMaxBytes) {
        return dimensionBest;
      }
    }
  }

  if (!bestResult) {
    throw new Error(`Could not compress ${file.name}.`);
  }

  if (bestResult.blob.size > preset.softMaxBytes) {
    logCompressionWarning(file, preset, bestResult);
  }

  return bestResult;
}

function getOutputTypes(preset: ImageCompressionPreset): ImageOutputType[] {
  return Array.from(
    new Set([preset.outputType, preset.fallbackOutputType].filter(Boolean))
  ) as ImageOutputType[];
}

function getDimensionSteps(
  width: number,
  height: number,
  preset: ImageCompressionPreset
) {
  const originalLongestSide = Math.max(width, height);
  const steps = preset.dimensionSteps.length
    ? preset.dimensionSteps
    : [preset.maxLongestSide];

  return Array.from(
    new Set(
      steps
        .map((step) => Math.min(step, preset.maxLongestSide, originalLongestSide))
        .filter((step) => step > 0)
    )
  );
}

function renderToCanvas(
  source: LoadedImageSource,
  width: number,
  height: number,
  outputType: ImageOutputType,
  preset: ImageCompressionPreset
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", {
    alpha: outputType !== "image/jpeg",
  });

  if (!context) {
    throw new Error("Canvas compression is not available in this browser.");
  }

  if (outputType === "image/jpeg" && !preset.preserveTransparency) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(source.image, 0, 0, width, height);
  return canvas;
}

async function compressCanvas(
  canvas: HTMLCanvasElement,
  outputType: ImageOutputType,
  preset: ImageCompressionPreset
): Promise<CompressionResult | null> {
  let bestResult: CompressionResult | null = null;

  for (
    let quality = preset.quality;
    quality >= preset.minQuality - Number.EPSILON;
    quality -= QUALITY_STEP
  ) {
    const normalizedQuality = Math.max(preset.minQuality, Number(quality.toFixed(2)));
    const blob = await canvasToBlob(canvas, outputType, normalizedQuality);
    const mimeType = normalizeBlobMimeType(blob, outputType);

    if (!mimeType) {
      return null;
    }

    const result = {
      blob,
      width: canvas.width,
      height: canvas.height,
      quality: normalizedQuality,
      mimeType,
    };

    bestResult = getBetterResult(bestResult, result);

    if (blob.size <= preset.targetBytes) {
      return result;
    }
  }

  return bestResult;
}

function normalizeBlobMimeType(
  blob: Blob,
  requestedType: ImageOutputType
): ImageOutputType | null {
  const actualType = blob.type as ImageOutputType;

  if (actualType === requestedType) return actualType;
  if (!blob.type && requestedType === "image/jpeg") return requestedType;
  if (!blob.type && requestedType === "image/png") return requestedType;

  return null;
}

function getBetterResult(
  current: CompressionResult | null,
  candidate: CompressionResult
) {
  if (!current) return candidate;
  return candidate.blob.size < current.blob.size ? candidate : current;
}

function logCompressionDiagnostics(
  file: File,
  preset: ImageCompressionPreset,
  result: CompressionResult
) {
  if (!import.meta.env.DEV) return;

  console.info("[image-compression]", {
    preset: preset.suffix,
    original: {
      name: file.name,
      type: file.type || "unknown",
      sizeBytes: file.size,
    },
    optimized: {
      type: result.mimeType,
      extension: getExtensionForMimeType(result.mimeType),
      sizeBytes: result.blob.size,
      width: result.width,
      height: result.height,
      quality: result.quality,
    },
  });
}

function logCompressionWarning(
  file: File,
  preset: ImageCompressionPreset,
  result: CompressionResult
) {
  if (!import.meta.env.DEV) return;

  console.warn("[image-compression] optimized image remains above target", {
    preset: preset.suffix,
    name: file.name,
    sizeBytes: result.blob.size,
    softMaxBytes: preset.softMaxBytes,
    type: result.mimeType,
    width: result.width,
    height: result.height,
    quality: result.quality,
  });
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

function getCenteredCrop(width: number, height: number, aspectRatio: number) {
  const sourceRatio = width / height;
  let cropWidth = width;
  let cropHeight = height;

  if (sourceRatio > aspectRatio) {
    cropWidth = Math.round(height * aspectRatio);
  } else if (sourceRatio < aspectRatio) {
    cropHeight = Math.round(width / aspectRatio);
  }

  return {
    x: Math.max(0, Math.round((width - cropWidth) / 2)),
    y: Math.max(0, Math.round((height - cropHeight) / 2)),
    width: Math.max(1, cropWidth),
    height: Math.max(1, cropHeight),
  };
}

function getHeroTargetSize(cropWidth: number, cropHeight: number) {
  const maxWidth = 1200;
  const maxHeight = 1800;
  const scale = Math.min(1, maxWidth / cropWidth, maxHeight / cropHeight);

  return {
    width: Math.max(1, Math.round(cropWidth * scale)),
    height: Math.max(1, Math.round(cropHeight * scale)),
  };
}

async function compressHeroCanvas(canvas: HTMLCanvasElement): Promise<CompressionResult> {
  const preset = IMAGE_COMPRESSION_PRESETS.storefrontHero;
  const outputTypes = getOutputTypes(preset);
  let bestResult: CompressionResult | null = null;

  for (const outputType of outputTypes) {
    const result = await compressCanvas(canvas, outputType, preset);

    if (!result) {
      continue;
    }

    bestResult = getBetterResult(bestResult, result);

    if (result.blob.size <= preset.targetBytes || result.blob.size <= preset.softMaxBytes) {
      return result;
    }
  }

  if (!bestResult) {
    throw new Error("Could not compress hero image.");
  }

  return bestResult;
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

async function loadImageSource(file: File): Promise<LoadedImageSource> {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      };
    } catch {
      // Fall back to an HTMLImageElement for browser-decodable files that
      // createImageBitmap cannot read.
    }
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
