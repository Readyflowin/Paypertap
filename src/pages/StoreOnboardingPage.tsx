import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { completeStoreOnboarding } from "../services/sellerService";
import { uploadImageToR2 } from "../services/uploadService";

export default function StoreOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError("");
      let uploadedLogo: { url: string; key: string } | null = null;

      if (logoFile) {
        setSubmitStatus("Uploading logo...");
        uploadedLogo = await uploadImageToR2(logoFile, "stores");
      }

      setSubmitStatus("Saving store...");

      const result = await completeStoreOnboarding(user, {
        phone,
        storeName,
        logoUrl: uploadedLogo?.url,
        logoKey: uploadedLogo?.key,
      });

      navigate(result.nextRoute);
    } catch (err) {
      console.error("Store onboarding failed:", err);
      setError(err instanceof Error ? err.message : "Could not save your store.");
    } finally {
      setLoading(false);
      setSubmitStatus("");
    }
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
      <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-gray-500">Step 1 of 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set up your store</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Add the basics customers will recognize. Your logo can be added now or later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-800">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 98765 43210"
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Store name</label>
            <input
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="I Thrift Sell"
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Store logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setLogoFile(file);
                setLogoFileName(file?.name || "");
              }}
              className="mt-2 w-full rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            {logoPreviewUrl ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-200 p-3">
                <img
                  src={logoPreviewUrl}
                  alt="Selected store logo preview"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <p className="text-xs font-medium text-gray-600">
                  {logoFileName || "Logo preview"}
                </p>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-gray-500">
              {logoFileName ? `${logoFileName} selected.` : "JPEG, PNG, WebP, or GIF up to 5MB."}
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? submitStatus || "Saving store..." : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
