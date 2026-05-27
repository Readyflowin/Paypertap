import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, ImageIcon, Phone, Store, UploadCloud } from "lucide-react";

import { PptBadge, PptButton, PptField, PptNotice, PptTapLoader } from "../components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import { assertValidImageFile } from "../lib/imageCompression";
import {
  completeStoreOnboarding,
  getStoreOnboardingDebugInfo,
} from "../services/sellerService";
import { uploadImageToR2 } from "../services/uploadService";

export default function StoreOnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [instagramProfile, setInstagramProfile] = useState("");
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
        instagramProfile,
        logoUrl: uploadedLogo?.url,
        logoKey: uploadedLogo?.key,
      });

      navigate(result.nextRoute);
    } catch (err) {
      console.error("Store onboarding failed:", err);
      const debugInfo = getStoreOnboardingDebugInfo(err);
      if (debugInfo) {
        console.error("Store onboarding write context:", debugInfo);
      }
      setError(err instanceof Error ? err.message : "Could not save your store.");
    } finally {
      setLoading(false);
      setSubmitStatus("");
    }
  }

  if (authLoading) {
    return (
      <main className="pds-page grid min-h-screen place-items-center px-4">
        <PptTapLoader title="Checking your account..." description="Preparing your seller setup." />
      </main>
    );
  }

  return (
    <main className="pds-page flex min-h-screen items-center justify-center px-4 py-10">
      <section className="pds-panel w-full max-w-xl">
        <PptBadge tone="primary">Step 1 of 2</PptBadge>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--pds-text)]">
          Set up your store
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--pds-muted)]">
          Add the basics customers will recognize. Your logo can be added now or later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <PptField
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98765 43210"
            icon={<Phone size={17} />}
            required
          />

          <PptField
            label="Store name"
            type="text"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="I Thrift Sell"
            icon={<Store size={17} />}
            required
          />

          <div className="pds-upload-card text-left">
            <div className="pds-upload-icon">
              <UploadCloud size={22} />
            </div>
            <strong>Store logo</strong>
            <p>
              {logoFileName ? `${logoFileName} selected.` : "JPEG, PNG, or WebP. We'll optimize your image automatically."}
            </p>
            <label className="inline-flex">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  try {
                    const file = event.target.files?.[0] || null;
                    if (file) assertValidImageFile(file);
                    setLogoFile(file);
                    setLogoFileName(file?.name || "");
                    setError("");
                  } catch (err) {
                    event.target.value = "";
                    setLogoFile(null);
                    setLogoFileName("");
                    setError(err instanceof Error ? err.message : "Please choose a valid logo image.");
                  }
                }}
                className="sr-only"
              />
              <span className="pds-button pds-button-secondary pds-button-md pds-button-rounded-lg">
                <ImageIcon size={16} />
                <span>Choose logo</span>
              </span>
            </label>
            {logoPreviewUrl ? (
              <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-[var(--pds-border)] bg-white p-3">
                <img
                  src={logoPreviewUrl}
                  alt="Selected store logo preview"
                  decoding="async"
                  loading="lazy"
                  className="h-16 w-16 rounded-[18px] object-cover"
                />
                <p className="m-0 text-xs font-medium text-[var(--pds-muted)]">
                  {logoFileName || "Logo preview"}
                </p>
              </div>
            ) : null}
          </div>

          <PptField
            label="Instagram profile"
            type="text"
            value={instagramProfile}
            onChange={(event) => setInstagramProfile(event.target.value)}
            placeholder="https://instagram.com/yourstore or @yourstore"
            icon={<AtSign size={17} />}
            helper="Stores with a visible Instagram presence build trust faster. Add your profile so buyers can verify your brand before booking."
          />

          {error ? (
            <PptNotice tone="danger" title="Could not save store">
              {error}
            </PptNotice>
          ) : null}

          <PptButton type="submit" fullWidth loading={loading} disabled={loading}>
            {loading ? submitStatus || "Saving store..." : "Continue"}
          </PptButton>
        </form>
      </section>
    </main>
  );
}
