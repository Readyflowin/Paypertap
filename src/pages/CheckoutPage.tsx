import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { formatINR } from "../lib/money";
import {
  getProductById,
  getPublicProductById,
} from "../services/productService";
import { getPublicStoreData } from "../services/publicStoreService";
import { startMockBookingPayment } from "../services/mockPaymentService";
import { getSellerByUid } from "../services/sellerService";
import {
  sendBookingCreatedEmail,
  sendBuyerBookingConfirmationEmail,
} from "../services/emailEventService";
import { markCheckoutEmailEventSent } from "../services/checkoutService";
import type { CheckoutSession, Product, Store } from "../types/firestore";

type CheckoutStep = "details" | "payment";

function getAvailableQuantity(product: Product): number {
  return Math.max(
    product.inventoryQuantity - product.reservedQuantity - product.soldQuantity,
    0
  );
}

function getProductImage(product: Product): string {
  const image = product.images?.find(
    (item) => item.thumbUrl || item.url || item.mediumUrl
  );

  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
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
    product?.status === "open" &&
    availableQuantity > 0 &&
    !isOwnerPreview;

  function validateDetails() {
    if (
      !buyerName.trim() ||
      !buyerPhone.trim() ||
      !buyerAddress.trim() ||
      !buyerCity.trim() ||
      !buyerPincode.trim()
    ) {
      throw new Error("Please fill all buyer details.");
    }
  }

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      validateDetails();
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check your details.");
    }
  }

  async function handleMockPayment() {
    if (!store || !product || !canCheckout) return;

    try {
      setSaving(true);
      setError("");
      validateDetails();

      // TODO: Inventory hold will move to backend/Admin SDK after real payment verification.
      const result = await startMockBookingPayment({
        sellerId: product.sellerId,
        storeId: store.storeId,
        productId: product.productId || product.id,
        productTitle: product.title,
        productPrice: product.price,
        buyerName,
        buyerPhone,
        buyerAddress,
        buyerCity,
        buyerPincode,
      });

      sessionStorage.setItem(
        `paypertap:checkout:${result.checkoutId}`,
        JSON.stringify(result.checkoutSession)
      );

      void sendBookingEmails(result.checkoutSession);
      navigate(`/${storeSlug}/booking-success/${result.checkoutId}`);
    } catch (err) {
      console.error("Mock payment failed:", err);
      setError(err instanceof Error ? err.message : "Could not start mock payment.");
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
          await markCheckoutEmailEventSent(
            checkoutSession.checkoutId,
            "sellerBookingSentAt"
          );
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
          await markCheckoutEmailEventSent(
            checkoutSession.checkoutId,
            "buyerBookingSentAt"
          );
        } catch (error) {
          console.warn("Could not mark buyer booking email as sent:", error);
        }
      }
    }
  }

  if (loading || authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <p className="text-sm font-medium text-gray-600">Loading checkout...</p>
      </main>
    );
  }

  if (error && (!store || !product)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <section className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-950">Checkout unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </section>
      </main>
    );
  }

  if (!store || !product) return null;

  const productImageUrl = getProductImage(product);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-950">
      <section className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <Link
          to={`/${storeSlug}/product/${product.productId || product.id}`}
          className="text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          Back to product
        </Link>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Checkout</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Book for ₹20
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Pay ₹20 advance to reserve this item. The remaining amount is paid
              directly to the seller on WhatsApp/UPI/COD.
            </p>

            {!canCheckout ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {isOwnerPreview
                  ? "Owner preview only. Publish the store before checkout."
                  : "This product is not available for booking."}
              </div>
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

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canCheckout}
                  className="w-full rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  Continue
                </button>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
                  Buyer details saved locally for this mock payment step.
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleMockPayment}
                  disabled={saving || !canCheckout}
                  className="w-full rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {saving ? "Processing mock payment..." : "Pay ₹20 Advance (Mock)"}
                </button>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Order summary</h2>
            <div className="mt-4 flex gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-700">{product.title}</p>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Product price" value={formatINR(product.price)} />
              <SummaryRow
                label="Pay now"
                value={`${formatINR(product.bookingAdvanceAmount)} advance`}
              />
              <SummaryRow
                label="Remaining amount"
                value={formatINR(product.sellerCollectAmount)}
              />
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Remaining payment and delivery confirmation happen directly with
              the seller after booking.
            </p>
          </aside>
        </div>
      </section>
    </main>
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
        <Field label="Name" value={buyerName} onChange={setBuyerName} />
        <Field
          label="Phone"
          type="tel"
          value={buyerPhone}
          onChange={setBuyerPhone}
        />
      </div>
      <Field label="Address" value={buyerAddress} onChange={setBuyerAddress} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" value={buyerCity} onChange={setBuyerCity} />
        <Field
          label="Pincode"
          value={buyerPincode}
          onChange={setBuyerPincode}
        />
      </div>
    </>
  );
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-950">{value}</span>
    </div>
  );
}
