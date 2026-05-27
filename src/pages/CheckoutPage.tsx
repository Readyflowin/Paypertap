import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, ShieldCheck, WalletCards } from "lucide-react";

import {
  PptBadge,
  PptButton,
  PptEmptyState,
  PptField,
  PptNotice,
  PptPriceBreakdown,
  PptTapLoader,
  type PptTone,
} from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatINR } from "@/lib/money";
import { getAvailableQuantity, isProductBookable } from "@/lib/productAvailability";
import { getProductById, getPublicProductById } from "@/services/productService";
import { getPublicStoreData } from "@/services/publicStoreService";
import { startMockBookingPayment } from "@/services/mockPaymentService";
import { startRazorpayBookingPayment } from "@/services/razorpayPaymentService";
import { getSellerByUid } from "@/services/sellerService";
import {
  sendBookingCreatedEmail,
  sendBuyerBookingConfirmationEmail,
} from "@/services/emailEventService";
import { markCheckoutEmailEventSent } from "@/services/checkoutService";
import type { CheckoutSession, Product, Store } from "@/types/firestore";

type CheckoutStep = "details" | "payment";

const BUYER_ADDRESS_MIN_LENGTH = 12;
const BUYER_ADDRESS_MAX_LENGTH = 160;
const PAYMENT_MODE = import.meta.env.VITE_PAYMENT_MODE === "razorpay" ? "razorpay" : "mock";

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function getTenDigitIndianMobile(phone: string): string {
  const digits = digitsOnly(phone);

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

function validateBuyerDetails(input: {
  buyerAddress: string;
  buyerCity: string;
  buyerName: string;
  buyerPhone: string;
  buyerPincode: string;
}): { normalizedPhone: string } {
  if (
    !input.buyerName.trim() ||
    !input.buyerPhone.trim() ||
    !input.buyerAddress.trim() ||
    !input.buyerCity.trim() ||
    !input.buyerPincode.trim()
  ) {
    throw new Error("Please complete all buyer details before continuing.");
  }

  const normalizedPhone = getTenDigitIndianMobile(input.buyerPhone);

  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    throw new Error("Please enter a valid 10-digit WhatsApp mobile number.");
  }

  if (!/^\d{6}$/.test(input.buyerPincode.trim())) {
    throw new Error("Please enter a valid 6-digit pincode.");
  }

  const addressLength = input.buyerAddress.trim().length;

  if (addressLength < BUYER_ADDRESS_MIN_LENGTH) {
    throw new Error("Please add a little more detail to the delivery address.");
  }

  if (addressLength > BUYER_ADDRESS_MAX_LENGTH) {
    throw new Error("Please keep the delivery address under 160 characters.");
  }

  return { normalizedPhone };
}

function getProductImage(product: Product): string {
  const image = product.images?.find((item) => item.thumbUrl || item.url || item.mediumUrl);
  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
}

function getProductBadge(
  product: Product,
  availableQuantity: number
): { label: string; tone: PptTone } {
  if (product.status === "sold") return { label: "Sold", tone: "sold" };
  if (product.status === "hold") return { label: "Reserved", tone: "reserved" };
  if (product.status !== "open") return { label: "Unavailable", tone: "neutral" };
  if (availableQuantity <= 0) return { label: "Unavailable", tone: "neutral" };
  if (availableQuantity === 1) return { label: "1 left", tone: "hot" };
  return { label: "Open", tone: "success" };
}

function getCheckoutErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "permission-denied") {
    return "Booking could not be recorded. Please try again.";
  }

  if (error instanceof Error && error.message) return error.message;

  return "Could not start booking payment.";
}

function CheckoutLoading() {
  return (
    <main className="pds-page grid place-items-center">
      <PptTapLoader
        title="Preparing checkout..."
        description="Loading your product and reservation details."
      />
    </main>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { storeSlug = "", productId = "" } = useParams();
  const { user, loading: authLoading } = useAuthUser();

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isOwnerPreview, setIsOwnerPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("details");
  const [error, setError] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerPincode, setBuyerPincode] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadCheckout() {
      try {
        setLoading(true);
        setError("");

        const storeData = await getPublicStoreData(storeSlug, user?.uid);
        const productData = storeData?.isOwnerPreview
          ? await getProductById(productId)
          : await getPublicProductById(productId);

        if (!storeData || !productData || productData.storeId !== storeData.store.storeId) {
          throw new Error("This product is unavailable.");
        }

        if (!cancelled) {
          setStore(storeData.store);
          setProduct(productData);
          setIsOwnerPreview(storeData.isOwnerPreview);
        }
      } catch (err) {
        console.error("Checkout load failed:", err);
        if (!cancelled) {
          setError("This product is unavailable.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [authLoading, productId, storeSlug, user?.uid]);

  const availableQuantity = product ? getAvailableQuantity(product) : 0;
  const canCheckout =
    Boolean(store?.isPublished) &&
    Boolean(product && isProductBookable(product)) &&
    !isOwnerPreview;

  function validateDetails(): { normalizedPhone: string } {
    return validateBuyerDetails({
      buyerAddress,
      buyerCity,
      buyerName,
      buyerPhone,
      buyerPincode,
    });
  }

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      const { normalizedPhone } = validateDetails();
      setBuyerPhone(normalizedPhone);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check your details.");
    }
  }

  async function handleBookingPayment() {
    if (!store || !product || !canCheckout) return;

    try {
      setSaving(true);
      setError("");
      const { normalizedPhone } = validateDetails();

      const latestProduct = await getPublicProductById(product.productId || product.id);

      if (!latestProduct || !isProductBookable(latestProduct)) {
        setProduct(latestProduct);
        throw new Error("This item was just reserved. Please choose another product.");
      }

      const paymentInput = {
        sellerId: latestProduct.sellerId,
        storeId: store.storeId,
        productId: latestProduct.productId || latestProduct.id,
        productTitle: latestProduct.title,
        productPrice: latestProduct.price,
        buyerName,
        buyerPhone: normalizedPhone,
        buyerAddress: buyerAddress.trim(),
        buyerCity: buyerCity.trim(),
        buyerPincode: buyerPincode.trim(),
      };
      const result =
        PAYMENT_MODE === "razorpay"
          ? await startRazorpayBookingPayment(paymentInput)
          : await startMockBookingPayment(paymentInput);

      sessionStorage.setItem(
        `paypertap:checkout:${result.checkoutId}`,
        JSON.stringify(result.checkoutSession)
      );

      void sendBookingEmails(result.checkoutSession);
      navigate(`/${storeSlug}/booking-success/${result.checkoutId}`);
    } catch (err) {
      console.error("Booking payment failed:", err);
      setError(getCheckoutErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function sendBookingEmails(checkoutSession: CheckoutSession) {
    try {
      const seller = await getSellerByUid(checkoutSession.sellerId);

      if (seller?.email && !checkoutSession.emailEvents?.sellerBookingSentAt) {
        const sent = await sendBookingCreatedEmail({
          sellerEmail: seller.email,
          checkoutSession,
        });

        if (sent) {
          await markCheckoutEmailEventSent(checkoutSession.checkoutId, "sellerBookingSentAt");
        }
      }
    } catch (error) {
      console.warn("Could not send seller booking email:", error);
    }

    // TODO: buyer confirmation email requires buyer email field.
    if (checkoutSession.buyerEmail && !checkoutSession.emailEvents?.buyerBookingSentAt) {
      const sent = await sendBuyerBookingConfirmationEmail({
        buyerEmail: checkoutSession.buyerEmail,
        checkoutSession,
        store,
      });

      if (sent) {
        try {
          await markCheckoutEmailEventSent(checkoutSession.checkoutId, "buyerBookingSentAt");
        } catch (error) {
          console.warn("Could not mark buyer booking email as sent:", error);
        }
      }
    }
  }

  if (loading || authLoading) {
    return <CheckoutLoading />;
  }

  if (error && (!store || !product)) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptEmptyState
          title="Checkout unavailable"
          description={error}
          icon={<ShieldCheck size={28} aria-hidden="true" />}
          action={
            <PptButton
              type="button"
              variant="primary"
              rounded="pill"
              onClick={() => navigate(`/${storeSlug}`)}
            >
              Back to store
            </PptButton>
          }
          className="max-w-sm"
        />
      </main>
    );
  }

  if (!store || !product) return null;

  const productImageUrl = getProductImage(product);

  return (
    <main className="pds-page">
      <section className="pds-container">
        <Link
          to={`/${storeSlug}/product/${product.productId || product.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--pds-muted)] transition hover:text-[var(--pds-primary)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to product
        </Link>

        <header className="mt-6 max-w-3xl">
          <PptBadge tone="primary" icon={<WalletCards size={14} aria-hidden="true" />}>
            Reservation checkout
          </PptBadge>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-[var(--pds-text)] sm:text-5xl">
            Reserve your item
          </h1>
          <p className="mt-3 max-w-2xl text-base font-light leading-7 text-[var(--pds-muted)]">
            Pay ₹20 now. Pay the remaining amount directly to the seller on WhatsApp.
          </p>
        </header>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="order-2 lg:order-1">
            <div className="pds-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-light text-[var(--pds-muted)]">Buyer details</p>
                  <h2 className="mt-1 text-2xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
                    Where should the seller contact you?
                  </h2>
                </div>
                <PptBadge tone={step === "payment" ? "warning" : "info"}>
                  {step === "payment" ? "Payment pending" : "Details"}
                </PptBadge>
              </div>

              {!canCheckout ? (
                <PptNotice
                  tone={isOwnerPreview ? "warning" : "danger"}
                  title={
                    isOwnerPreview
                      ? "Owner preview only"
                      : "This item is no longer available for booking."
                  }
                  className="mt-5"
                >
                  {isOwnerPreview
                    ? "Publish the store before accepting buyer reservations."
                    : "Please go back to the store and choose another available product."}
                </PptNotice>
              ) : null}

              {step === "details" ? (
                <form onSubmit={handleDetailsSubmit} className="mt-6 space-y-4">
                  <BuyerFields
                    buyerAddress={buyerAddress}
                    buyerCity={buyerCity}
                    buyerName={buyerName}
                    buyerPhone={buyerPhone}
                    buyerPincode={buyerPincode}
                    setBuyerAddress={setBuyerAddress}
                    setBuyerCity={setBuyerCity}
                    setBuyerName={setBuyerName}
                    setBuyerPhone={setBuyerPhone}
                    setBuyerPincode={setBuyerPincode}
                  />

                  {error ? <ErrorNotice message={error} /> : null}

                  <PptButton type="submit" fullWidth size="lg" disabled={!canCheckout}>
                    Continue to ₹20 booking
                  </PptButton>
                </form>
              ) : (
                <div className="mt-6 space-y-4">
                  <PptNotice tone="success" title="Details saved">
                    Your item is reserved after the ₹20 booking is recorded.
                  </PptNotice>

                  {error ? <ErrorNotice message={error} /> : null}

                  <PptButton
                    type="button"
                    onClick={handleBookingPayment}
                    disabled={saving || !canCheckout}
                    loading={saving}
                    fullWidth
                    size="lg"
                  >
                    {saving ? "Reserving item..." : "Pay ₹20 & reserve"}
                  </PptButton>
                </div>
              )}

              <PptNotice
                tone="info"
                title="After payment, we’ll open WhatsApp with a ready message to the seller."
                icon={<ShieldCheck size={18} aria-hidden="true" />}
                className="mt-5"
              >
                The seller confirms the remaining payment and delivery details directly on WhatsApp.
              </PptNotice>
            </div>
          </section>

          <aside className="order-1 space-y-4 lg:sticky lg:top-6 lg:order-2">
            <ProductSummaryCard
              product={product}
              storeName={store.storeName}
              imageUrl={productImageUrl}
              availableQuantity={availableQuantity}
            />
            <PptPriceBreakdown
              productPrice={product.price}
              advanceAmount={product.bookingAdvanceAmount || 20}
              currency="₹"
              note="PayPerTap keeps the ₹20 booking fee. Pay the remaining amount directly to the seller."
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function ProductSummaryCard({
  product,
  storeName,
  imageUrl,
  availableQuantity,
}: {
  product: Product;
  storeName: string;
  imageUrl: string;
  availableQuantity: number;
}) {
  const badge = getProductBadge(product, availableQuantity);

  return (
    <div className="pds-panel">
      <h2 className="text-xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
        Product summary
      </h2>
      <div className="mt-4 flex gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-[var(--pds-border)] bg-[var(--pds-surface-soft)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <ImageIcon size={24} className="text-[var(--pds-muted)]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--pds-muted)]">
            {storeName}
          </p>
          <p className="mt-1 line-clamp-2 text-base font-medium text-[var(--pds-text)]">
            {product.title}
          </p>
          <p className="mt-2 text-xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
            {formatINR(product.price)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
            <PptBadge tone="primary">Reserve with ₹20</PptBadge>
          </div>
          <p className="mt-2 text-xs font-light text-[var(--pds-muted)]">
            {availableQuantity > 0 ? `${availableQuantity} available` : "Unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
}

function BuyerFields({
  buyerAddress,
  buyerCity,
  buyerName,
  buyerPhone,
  buyerPincode,
  setBuyerAddress,
  setBuyerCity,
  setBuyerName,
  setBuyerPhone,
  setBuyerPincode,
}: {
  buyerAddress: string;
  buyerCity: string;
  buyerName: string;
  buyerPhone: string;
  buyerPincode: string;
  setBuyerAddress: (value: string) => void;
  setBuyerCity: (value: string) => void;
  setBuyerName: (value: string) => void;
  setBuyerPhone: (value: string) => void;
  setBuyerPincode: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <PptField
          label="Name"
          placeholder="Your full name"
          name="name"
          autoComplete="name"
          value={buyerName}
          onChange={(event) => setBuyerName(event.target.value)}
          required
        />
        <PptField
          label="WhatsApp number"
          placeholder="10 digit mobile number"
          type="tel"
          name="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          maxLength={14}
          pattern="[0-9]{10,14}"
          helper="Enter the 10-digit number the seller can message on WhatsApp."
          value={buyerPhone}
          onChange={(event) => setBuyerPhone(digitsOnly(event.target.value).slice(0, 14))}
          required
        />
      </div>
      <PptField
        label="Address"
        placeholder="House number, street, area"
        name="street-address"
        autoComplete="street-address"
        minLength={BUYER_ADDRESS_MIN_LENGTH}
        maxLength={BUYER_ADDRESS_MAX_LENGTH}
        helper="Enter your delivery address."
        value={buyerAddress}
        onChange={(event) => setBuyerAddress(event.target.value)}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PptField
          label="City"
          placeholder="City"
          name="address-level2"
          autoComplete="address-level2"
          value={buyerCity}
          onChange={(event) => setBuyerCity(event.target.value)}
          required
        />
        <PptField
          label="Pincode"
          placeholder="Pincode"
          name="postal-code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          value={buyerPincode}
          onChange={(event) => setBuyerPincode(digitsOnly(event.target.value).slice(0, 6))}
          required
        />
      </div>
    </>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <PptNotice tone="danger" title="Please check your details">
      {message}
    </PptNotice>
  );
}
