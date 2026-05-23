import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Package, Tags, UploadCloud, WalletCards } from "lucide-react";

import {
  PptBadge,
  PptButton,
  PptField,
  PptNotice,
  PptTapLoader,
} from "../components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import { completeProductOnboarding } from "../services/sellerService";

export default function ProductOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function finishOnboarding(includeProduct: boolean) {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await completeProductOnboarding(user, {
        product: includeProduct
          ? {
              title,
              price: price ? Number(price) : undefined,
              description,
              category,
              inventoryQuantity: inventoryQuantity ? Number(inventoryQuantity) : undefined,
              imageFile,
            }
          : undefined,
      });

      navigate(result.nextRoute);
    } catch (err) {
      console.error("Product onboarding failed:", err);
      setError(err instanceof Error ? err.message : "Could not finish onboarding.");
    } finally {
      setLoading(false);
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
            Buyers pay ₹20 advance on PayPerTap. You collect the remaining amount on WhatsApp,
            UPI, or COD. The Phase 1 booking advance stays fixed at ₹20.
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
              onChange={(event) => setPrice(event.target.value)}
              placeholder="1299"
              icon={<WalletCards size={17} />}
            />

            <PptField
              label="Category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Apparel"
              icon={<Tags size={17} />}
            />

            <PptField
              label="Inventory quantity"
              type="number"
              min={1}
              step={1}
              value={inventoryQuantity}
              onChange={(event) => setInventoryQuantity(event.target.value)}
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
            <strong>Product image</strong>
            <p>
              {imageFileName ? `${imageFileName} selected.` : "JPEG, PNG, WebP, or GIF up to 5MB."}
            </p>
            <label className="inline-flex">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImageFile(file);
                  setImageFileName(file?.name || "");
                }}
                className="sr-only"
              />
              <span className="pds-button pds-button-secondary pds-button-md pds-button-rounded-lg">
                <ImageIcon size={16} />
                <span>Choose image</span>
              </span>
            </label>
            {imagePreviewUrl ? (
              <div className="mt-4 overflow-hidden rounded-[22px] border border-[var(--pds-border)] bg-white">
                <img
                  src={imagePreviewUrl}
                  alt="Selected product preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          {error ? (
            <PptNotice tone="danger" title="Could not finish onboarding">
              {error}
            </PptNotice>
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
              {loading && imageFile
                ? "Uploading image..."
                : loading
                  ? "Saving product..."
                  : "Save product and continue"}
            </PptButton>
          </div>
        </form>
      </section>
    </main>
  );
}
