import { useEffect, useId, useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import clsx from "clsx";

import { Button, LoadingPulse } from "@/components/ui";

type ImageUploaderAspect = "square" | "product" | "banner";

export type ImageUploaderProps = {
  label?: string;
  helperText?: string;
  valueUrl?: string;
  selectedFile?: File | null;
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  aspect?: ImageUploaderAspect;
  isUploading?: boolean;
  error?: string;
  className?: string;
};

const aspectClassName: Record<ImageUploaderAspect, string> = {
  square: "aspect-square",
  product: "aspect-[4/5]",
  banner: "aspect-[16/7]",
};

function isAcceptedFile(file: File, accept: string) {
  const acceptedTypes = accept.split(",").map((item) => item.trim()).filter(Boolean);

  if (acceptedTypes.length === 0) return true;

  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.endsWith("/*")) {
      return file.type.startsWith(acceptedType.replace("/*", "/"));
    }

    return file.type === acceptedType;
  });
}

export function ImageUploader({
  label = "Upload image",
  helperText,
  valueUrl,
  selectedFile,
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMb = 5,
  aspect = "product",
  isUploading = false,
  error,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");
  const isControlled = selectedFile !== undefined;
  const activeFile = isControlled ? selectedFile : internalFile;

  const previewUrl = useMemo(() => {
    if (activeFile) {
      return URL.createObjectURL(activeFile);
    }

    return valueUrl || "";
  }, [activeFile, valueUrl]);

  useEffect(() => {
    if (!activeFile || !previewUrl || previewUrl === valueUrl) return;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [activeFile, previewUrl, valueUrl]);

  const visibleError = validationError || error;

  function selectFile(file: File | null) {
    setValidationError("");

    if (!file) {
      if (!isControlled) setInternalFile(null);
      onFileSelect?.(null);
      return;
    }

    if (!isAcceptedFile(file, accept)) {
      setValidationError("Choose a JPEG, PNG, WebP, or GIF image.");
      if (!isControlled) setInternalFile(null);
      onFileSelect?.(null);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setValidationError(`Image must be ${maxSizeMb}MB or smaller.`);
      if (!isControlled) setInternalFile(null);
      onFileSelect?.(null);
      return;
    }

    if (!isControlled) setInternalFile(file);
    onFileSelect?.(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function clearFile() {
    selectFile(null);
  }

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {label ? (
        <span className="text-sm font-semibold text-[var(--ppt-text)]">{label}</span>
      ) : null}

      <label
        htmlFor={inputId}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className={clsx(
          "ppt-focus-ring group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--ppt-radius-xl)] border border-dashed bg-[var(--ppt-surface)] p-4 text-center shadow-[var(--ppt-shadow-soft)] transition hover:border-[rgba(109,61,245,0.48)] hover:bg-[var(--ppt-primary-soft)]",
          aspectClassName[aspect],
          visibleError ? "border-[var(--ppt-danger)]" : "border-[var(--ppt-border)]"
        )}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleInputChange}
          disabled={isUploading}
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt={activeFile?.name || "Selected image preview"}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ppt-primary-soft)] text-[var(--ppt-primary-dark)]">
              <ImageUp size={22} aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-bold text-[var(--ppt-text)]">
              Choose image or drop it here
            </span>
            <span className="mt-1 text-xs text-[var(--ppt-text-muted)]">
              JPEG, PNG, WebP, or GIF up to {maxSizeMb}MB
            </span>
          </div>
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/78">
            <LoadingPulse label="Uploading..." />
          </div>
        ) : null}
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {activeFile ? (
            <p className="truncate text-sm font-medium text-[var(--ppt-text)]">{activeFile.name}</p>
          ) : helperText ? (
            <p className="text-sm text-[var(--ppt-text-muted)]">{helperText}</p>
          ) : null}
          {visibleError ? (
            <p className="mt-1 text-sm font-medium text-[var(--ppt-danger)]">{visibleError}</p>
          ) : null}
        </div>

        {(activeFile || valueUrl) && !isUploading ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={16} aria-hidden="true" />}
            onClick={clearFile}
          >
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}
