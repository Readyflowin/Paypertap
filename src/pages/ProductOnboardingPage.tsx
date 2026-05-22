import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
              inventoryQuantity: inventoryQuantity
                ? Number(inventoryQuantity)
                : undefined,
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
      <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4">
        <p className="text-sm font-medium text-gray-600">Checking your account...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 py-10 text-gray-950">
      <section className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-gray-500">Step 2 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Add your first product
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add your first product now, or skip and add unlimited products later
          from your dashboard.
        </p>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Buyers will pay ₹20 advance on PayPerTap. You collect the remaining
          amount on WhatsApp/UPI/COD.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Product title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Limited drop tee"
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Price</label>
              <input
                type="number"
                min="21"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="1299"
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800">Category</label>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Apparel"
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">
                Inventory quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={inventoryQuantity}
                onChange={(event) => setInventoryQuantity(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short product details"
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Product image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
                setImageFileName(file?.name || "");
              }}
              className="mt-2 w-full rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            {imagePreviewUrl ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                <img
                  src={imagePreviewUrl}
                  alt="Selected product preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}
            <p className="mt-2 text-xs text-gray-500">
              {imageFileName ? `${imageFileName} selected.` : "JPEG, PNG, WebP, or GIF up to 5MB."}
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => finishOnboarding(false)}
              disabled={loading}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Skip product for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && imageFile ? "Uploading image..." : loading ? "Saving product..." : "Save product and continue"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
