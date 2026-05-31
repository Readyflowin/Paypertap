import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, ImageIcon, Phone, Store, UploadCloud } from "lucide-react";

import { PptBadge, PptButton, PptField, PptNotice, PptTapLoader } from "../components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import { assertValidImageFile } from "../lib/imageCompression";
import type { SellerConfirmationAdvanceType } from "../lib/confirmationAdvance";
import { normalizeIndianMobileInput } from "../lib/phone";
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
  const [confirmationAdvanceType, setConfirmationAdvanceType] =
    useState<SellerConfirmationAdvanceType>("paypertap_only");
  const [confirmationFixedAmount, setConfirmationFixedAmount] = useState("");
  const [confirmationPercent, setConfirmationPercent] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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
      setPhoneError("");

      const normalizedPhone = normalizeIndianMobileInput(phone);

      if (!normalizedPhone.ok || !normalizedPhone.localNumber) {
        const message =
          normalizedPhone.error || "Please enter a valid 10-digit Indian WhatsApp number.";
        setPhoneError(message);
        throw new Error(message);
      }

      const fixedAmount = Math.round(Number(confirmationFixedAmount) || 0);
      const percent = Math.round(Number(confirmationPercent) || 0);

      if (confirmationAdvanceType === "fixed" && fixedAmount < 20) {
        throw new Error("Fixed confirmation amount must be at least ₹20.");
      }

      if (confirmationAdvanceType === "percentage" && percent <= 0) {
        throw new Error("Confirmation percentage must be greater than 0.");
      }

      setPhone(normalizedPhone.localNumber);
      let uploadedLogo: { url: string; key: string } | null = null;

      if (logoFile) {
        setSubmitStatus("Uploading logo...");
        uploadedLogo = await uploadImageToR2(logoFile, "stores");
      }

      setSubmitStatus("Saving store...");

      const result = await completeStoreOnboarding(user, {
        phone: normalizedPhone.localNumber,
        storeName,
        instagramProfile,
        logoUrl: uploadedLogo?.url,
        sellerConfirmationAdvanceType: confirmationAdvanceType,
        sellerConfirmationAdvanceFixedAmount: fixedAmount,
        sellerConfirmationAdvancePercent: percent,
      });

      navigate(result.nextRoute);
    } catch (err) {
      console.error("Store onboarding failed:", err);
      console.error("Store onboarding auth context:", {
        hasUser: Boolean(user),
        uid: user.uid,
      });
      const debugInfo = getStoreOnboardingDebugInfo(err);
      if (debugInfo) {
        console.error("Store onboarding write context:", debugInfo);
      }
      const message = err instanceof Error ? err.message : "Could not save your store.";
      setError(
        debugInfo && import.meta.env.DEV
          ? `${message} (${debugInfo.operation})`
          : message
      );
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
            onChange={(event) => {
              setPhone(event.target.value);
              setPhoneError("");
            }}
            onBlur={() => {
              if (!phone.trim()) return;
              const normalizedPhone = normalizeIndianMobileInput(phone);
              if (normalizedPhone.ok && normalizedPhone.localNumber) {
                setPhone(normalizedPhone.localNumber);
                setPhoneError("");
              } else {
                setPhoneError(
                  normalizedPhone.error || "Please enter a valid 10-digit Indian WhatsApp number."
                );
              }
            }}
            placeholder="Enter 10-digit WhatsApp number"
            icon={<Phone size={17} />}
            helper="Only enter your 10-digit Indian WhatsApp number. Example: 7067508872"
            error={phoneError}
            inputMode="numeric"
            maxLength={16}
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

          <ConfirmationAdvanceSettings
            type={confirmationAdvanceType}
            fixedAmount={confirmationFixedAmount}
            percent={confirmationPercent}
            onTypeChange={setConfirmationAdvanceType}
            onFixedAmountChange={setConfirmationFixedAmount}
            onPercentChange={setConfirmationPercent}
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

function sanitizeNumberInput(value: string): string {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function ConfirmationAdvanceSettings({
  fixedAmount,
  onFixedAmountChange,
  onPercentChange,
  onTypeChange,
  percent,
  type,
}: {
  fixedAmount: string;
  onFixedAmountChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  onTypeChange: (value: SellerConfirmationAdvanceType) => void;
  percent: string;
  type: SellerConfirmationAdvanceType;
}) {
  const fixedValue = Number(fixedAmount) || 0;
  const percentValue = Number(percent) || 0;
  const showFixedWarning = type === "fixed" && fixedValue >= 1000;
  const showPercentWarning = type === "percentage" && percentValue > 50;

  return (
    <section className="rounded-[24px] border border-[var(--pds-border)] bg-[var(--pds-surface-soft)] p-4">
      <h2 className="text-base font-semibold text-[var(--pds-text)]">
        How much advance do you usually collect before confirming an order?
      </h2>
      <div className="mt-4 grid gap-3">
        <AdvanceOption
          checked={type === "paypertap_only"}
          label="Only ₹20 PayPerTap booking"
          description="Buyer pays ₹20 to reserve the product. You collect the rest directly on WhatsApp."
          onChange={() => onTypeChange("paypertap_only")}
        />
        <AdvanceOption
          checked={type === "fixed"}
          label="Fixed confirmation amount"
          description="Example: ₹100, ₹150, ₹200 total advance before final confirmation."
          onChange={() => onTypeChange("fixed")}
        />
        {type === "fixed" ? (
          <PptField
            label="Total confirmation advance"
            type="number"
            min={20}
            step={1}
            inputMode="numeric"
            value={fixedAmount}
            onChange={(event) => onFixedAmountChange(sanitizeNumberInput(event.target.value))}
            placeholder="150"
            helper="This is the total advance. PayPerTap still collects only ₹20 online."
          />
        ) : null}
        <AdvanceOption
          checked={type === "percentage"}
          label="Percentage of product price"
          description="Example: 10%, 20%, 30% of product price as total advance."
          onChange={() => onTypeChange("percentage")}
        />
        {type === "percentage" ? (
          <PptField
            label="Total confirmation advance percentage"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={percent}
            onChange={(event) => onPercentChange(sanitizeNumberInput(event.target.value))}
            placeholder="10"
            helper="Percentage is rounded to the nearest rupee during checkout."
          />
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--pds-muted)]">
        Higher advance can improve buyer commitment, but it may also reduce bookings. We recommend keeping it reasonable for faster confirmations.
      </p>
      {showFixedWarning || showPercentWarning ? (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
          High advance may reduce buyer conversions.
        </p>
      ) : null}
    </section>
  );
}

function AdvanceOption({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-[var(--pds-border)] bg-white p-3 text-left">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--pds-primary)]"
      />
      <span>
        <strong className="block text-sm text-[var(--pds-text)]">{label}</strong>
        <span className="mt-1 block text-xs leading-5 text-[var(--pds-muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}
