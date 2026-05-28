import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Package, UploadCloud, WalletCards } from "lucide-react";

import {
  PptBadge,
  PptButton,
  PptField,
  PptNotice,
  PptSelectField,
  PptTapLoader,
} from "../components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import {
  assertValidImageFiles,
  MAX_PRODUCT_IMAGE_COUNT,
} from "../lib/imageCompression";
import {
  completeProductOnboarding,
  getSellerByUid,
} from "../services/sellerService";
import { listStoreCollections } from "../services/collectionService";
import type { ProductSaveProgress } from "../services/productService";
import type { StoreCollection } from "../types/firestore";

function sanitizePositiveNumberInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits || /^0+$/.test(digits)) return "";

  return digits.replace(/^0+/, "");
}

function getProductSaveStatus(
  progress: ProductSaveProgress | null,
  fallbackSavingLabel: string
) {
  if (!progress) return fallbackSavingLabel;

  if (progress.phase === "saving") {
    return progress.totalImages > 0
      ? "Images uploaded, saving product..."
      : fallbackSavingLabel;
  }

  if (progress.totalImages <= 0) return fallbackSavingLabel;

  const activeImage = Math.min(
    progress.totalImages,
    progress.completedImages + 1
  );

  return `Uploading ${activeImage}/${progress.totalImages}...`;
}

export default function ProductOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [collections, setCollections] = useState<StoreCollection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imageFileName, setImageFileName] = useState("");
  const [saveProgress, setSaveProgress] = useState<ProductSaveProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadCollections() {
      const seller = await getSellerByUid(user.uid);

      if (!seller?.storeId) return;

      const storeCollections = await listStoreCollections(seller.storeId).catch(() => []);

      if (!cancelled) {
        setCollections(storeCollections);
      }
    }

    void loadCollections();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls([]);
      return;
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(objectUrls);

    return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }, [imageFiles]);

  async function finishOnboarding(includeProduct: boolean) {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSaveProgress(null);
      const selectedCollection = collections.find(
        (collection) => collection.collectionId === collectionId
      );

      const result = await completeProductOnboarding(user, {
        product: includeProduct
          ? {
              title,
              price: price ? Number(price) : undefined,
              description,
              category: selectedCollection?.name || "General",
              collectionId: selectedCollection?.collectionId || "",
              collectionName: selectedCollection?.name || "",
              inventoryQuantity: inventoryQuantity ? Number(inventoryQuantity) : undefined,
              imageFiles,
              onProgress: setSaveProgress,
            }
          : undefined,
      });

      navigate(result.nextRoute);
    } catch (err) {
      console.error("Product onboarding failed:", err);
      setError(err instanceof Error ? err.message : "Could not finish onboarding.");
    } finally {
      setLoading(false);
      setSaveProgress(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await finishOnboarding(true);
  }

  if (authLoading) {
    return (
      <main className="pds-page grid min-h-screen place-items-center px-4">
        <PptTapLoader title="Checking your account..." description="Loading your product setup." />
      </main>
    );
  }

  return (
    <main className="pds-page flex min-h-screen items-center justify-center px-4 py-10">
      <section className="pds-panel w-full max-w-2xl">
        <PptBadge tone="primary">Step 2 of 2</PptBadge>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--pds-text)]">
          Add your first product
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--pds-muted)]">
          Add your first product now, or skip and add unlimited products later from your dashboard.
        </p>

        <div className="mt-6">
          <PptNotice tone="info" title="How PayPerTap booking works" icon={<WalletCards size={19} />}>
            Buyers pay ₹20 booking via PayPerTap. You collect the remaining amount on
            WhatsApp, UPI, or COD. The PayPerTap booking fee stays fixed at ₹20.
          </PptNotice>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="pds-form-grid">
            <PptField
              label="Product title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Limited drop tee"
              icon={<Package size={17} />}
            />

            <PptField
              label="Price"
              type="number"
              min={21}
              step={1}
              value={price}
              onChange={(event) => setPrice(sanitizePositiveNumberInput(event.target.value))}
              placeholder="1299"
              inputMode="numeric"
              autoComplete="off"
              icon={<WalletCards size={17} />}
              helper="Enter the full product price. Buyers book first, then pay the remaining amount directly to you."
            />

            <PptSelectField
              label="Collection"
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              options={["", ...collections.map((collection) => collection.collectionId)]}
              getOptionLabel={(option) =>
                option
                  ? collections.find((collection) => collection.collectionId === option)?.name ||
                    option
                  : "No collection"
              }
            />

            <PptField
              label="Pieces available"
              type="number"
              min={1}
              step={1}
              value={inventoryQuantity}
              onChange={(event) =>
                setInventoryQuantity(sanitizePositiveNumberInput(event.target.value))
              }
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <PptField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short product details"
            textarea
          />

          <div className="pds-upload-card text-left">
            <div className="pds-upload-icon">
              <UploadCloud size={22} />
            </div>
            <strong>Product images</strong>
            <p>
              {imageFileName
                ? `${imageFileName} selected.`
                : `JPEG, PNG, or WebP. You can upload up to ${MAX_PRODUCT_IMAGE_COUNT} images per product.`}
            </p>
            <label className="inline-flex">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  try {
                    const files = Array.from(event.target.files ?? []);
                    assertValidImageFiles(files, MAX_PRODUCT_IMAGE_COUNT);
                    setImageFiles(files);
                    setImageFileName(files.map((file) => file.name).join(", "));
                    setError("");
                    setSaveProgress(null);
                  } catch (err) {
                    event.target.value = "";
                    setImageFiles([]);
                    setImageFileName("");
                    setError(err instanceof Error ? err.message : "Please choose valid images.");
                  }
                }}
                className="sr-only"
              />
              <span className="pds-button pds-button-secondary pds-button-md pds-button-rounded-lg">
                <ImageIcon size={16} />
                <span>Choose images</span>
              </span>
            </label>
            {imagePreviewUrls.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {imagePreviewUrls.map((imagePreviewUrl, index) => (
                  <div
                    className="aspect-square overflow-hidden rounded-[18px] border border-[var(--pds-border)] bg-white"
                    key={imagePreviewUrl}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt={`Selected product preview ${index + 1}`}
                      decoding="async"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {error ? (
            <PptNotice tone="danger" title="Could not finish onboarding">
              {error}
            </PptNotice>
          ) : null}
          {loading ? (
            <p className="text-sm font-medium text-[var(--pds-muted)]">
              {getProductSaveStatus(saveProgress, "Saving product...")}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <PptButton
              type="button"
              variant="secondary"
              onClick={() => finishOnboarding(false)}
              disabled={loading}
              fullWidth
            >
              Skip product for now
            </PptButton>
            <PptButton type="submit" loading={loading} disabled={loading} fullWidth>
              {loading
                ? getProductSaveStatus(saveProgress, "Saving product...")
                : "Save product and continue"}
            </PptButton>
          </div>
        </form>
      </section>
    </main>
  );
}
