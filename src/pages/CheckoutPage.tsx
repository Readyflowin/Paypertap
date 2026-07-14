import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, PackageCheck, ShieldCheck } from "lucide-react";

import {
  PptBadge,
  PptButton,
  PptEmptyState,
  PptField,
  PptNotice,
  PptTapLoader,
  type PptTone,
} from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatINR } from "@/lib/money";
import { normalizeIndianMobileInput } from "@/lib/phone";
import { getAvailableQuantity, isProductBookable } from "@/lib/productAvailability";
import {
  getProductVariants,
  getVariantDetailsText,
  isVariantAvailable,
  productHasVariants,
  validateSelectedVariant,
} from "@/lib/productVariants";
import { getProductById, getPublicProductById } from "@/services/productService";
import { getPublicStoreShellData } from "@/services/publicStoreService";
import { createOrderWithReservation } from "@/services/checkoutService";
import { storePendingPaymentOrder } from "@/services/paymentReturnService";
import { getProductGridImageUrl } from "@/storefront/imageMedia";
import type { CheckoutSession, Product, Store } from "@/types/firestore";

const BUYER_ADDRESS_MIN_LENGTH = 12;
const BUYER_ADDRESS_MAX_LENGTH = 160;

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
    throw new Error("Please complete all customer details before creating the order.");
  }

  const normalizedPhone = normalizeIndianMobileInput(input.buyerPhone);

  if (!normalizedPhone.ok || !normalizedPhone.localNumber) {
    throw new Error(
      normalizedPhone.error || "Please enter a valid 10-digit WhatsApp mobile number."
    );
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

  return { normalizedPhone: normalizedPhone.localNumber };
}

function getProductImage(product: Product): string {
  return getProductGridImageUrl(product);
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
    return "Order could not be recorded. Please try again.";
  }

  if (error instanceof Error && error.message) return error.message;

  return "Could not create this order.";
}

function getPaymentMode(store: Store): "cod" | "partial_advance" {
  return store.paymentMode === "partial_advance" ? "partial_advance" : "cod";
}

function getAdvanceAmount(store: Store): number {
  return Math.max(1, Math.round(Number(store.advanceAmount) || 0));
}

function CheckoutLoading() {
  return (
    <main className="pds-page grid place-items-center">
      <PptTapLoader
        title="Preparing order..."
        description="Loading product availability and seller settings."
      />
    </main>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { storeSlug = "", productId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuthUser();

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isOwnerPreview, setIsOwnerPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [error, setError] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerPincode, setBuyerPincode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      try {
        setLoading(true);
        setError("");

        const [storeData, publicProductData] = await Promise.all([
          getPublicStoreShellData(storeSlug, user?.uid),
          getPublicProductById(productId),
        ]);
        const productData =
          storeData?.isOwnerPreview && !publicProductData
            ? await getProductById(productId)
            : publicProductData;

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
  }, [productId, storeSlug, user?.uid]);

  const availableQuantity = product ? getAvailableQuantity(product) : 0;
  const selectedVariantId = searchParams.get("variantId") || "";
  const selectedVariant =
    product && selectedVariantId
      ? getProductVariants(product).find(
          (variant) => variant.variantId === selectedVariantId
        ) || null
      : null;
  const variantSelectionRequired = Boolean(product && productHasVariants(product));
  const variantSelectionValid =
    !variantSelectionRequired ||
    Boolean(
      selectedVariant &&
        validateSelectedVariant(product, selectedVariant.options).isValid &&
        isVariantAvailable(selectedVariant)
    );
  const canCheckout =
    Boolean(store?.isPublished) &&
    Boolean(product && isProductBookable(product)) &&
    !isOwnerPreview &&
    variantSelectionValid;

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store || !product || !canCheckout) return;

    try {
      setSaving(true);
      setOrderStatus("Creating order...");
      setError("");
      const { normalizedPhone } = validateBuyerDetails({
        buyerAddress,
        buyerCity,
        buyerName,
        buyerPhone,
        buyerPincode,
      });
      setBuyerPhone(normalizedPhone);

      const latestProduct = await getPublicProductById(product.productId || product.id);

      if (!latestProduct || !isProductBookable(latestProduct)) {
        setProduct(latestProduct);
        throw new Error("This item was just reserved. Please choose another product.");
      }

      const latestSelectedVariant = selectedVariantId
        ? getProductVariants(latestProduct).find(
            (variant) => variant.variantId === selectedVariantId
          ) || null
        : null;

      if (productHasVariants(latestProduct)) {
        const validation = latestSelectedVariant
          ? validateSelectedVariant(latestProduct, latestSelectedVariant.options)
          : { isValid: false, message: "Please select size/color before ordering." };

        if (!latestSelectedVariant || !validation.isValid) {
          throw new Error(validation.message || "Please select size/color before ordering.");
        }
      }

      const result = await createOrderWithReservation({
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
        ...(latestSelectedVariant
          ? {
              selectedVariantId: latestSelectedVariant.variantId,
              selectedVariantLabel: latestSelectedVariant.label,
              selectedVariantOptions: latestSelectedVariant.options,
            }
          : {}),
      });

      sessionStorage.setItem(
        `paypertap:checkout:${result.orderId}`,
        JSON.stringify(result.order)
      );

      if (result.paymentMode === "partial_advance") {
        storePendingPaymentOrder(result.orderId);
        setOrderStatus("Order created. Redirecting to payment link...");
        window.location.assign(result.paymentLink);
        return;
      }

      navigate(`/${storeSlug}/order-success/${result.orderId}`);
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(getCheckoutErrorMessage(err));
    } finally {
      setSaving(false);
      setOrderStatus("");
    }
  }

  if (loading) {
    return <CheckoutLoading />;
  }

  if (error && (!store || !product)) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptEmptyState
          title="Order unavailable"
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
  const paymentMode = getPaymentMode(store);
  const advanceAmount = getAdvanceAmount(store);
  const requiresAdvance = paymentMode === "partial_advance";
  const sellerAmountDue = requiresAdvance
    ? Math.max(product.price - advanceAmount, 0)
    : product.price;

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
          <PptBadge tone="primary" icon={<PackageCheck size={14} aria-hidden="true" />}>
            Place order
          </PptBadge>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-[var(--pds-text)] sm:text-5xl">
            Place your order
          </h1>
          <p className="mt-3 max-w-2xl text-base font-light leading-7 text-[var(--pds-muted)]">
            Share your delivery details with the seller. Your order is created immediately.
            {requiresAdvance
              ? " After that, you will continue to the seller's Razorpay payment link."
              : " The seller will confirm availability and delivery with you."}
          </p>
        </header>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="order-2 lg:order-1">
            <div className="pds-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-light text-[var(--pds-muted)]">
                    Customer details
                  </p>
                  <h2 className="mt-1 text-2xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
                    Where should the seller contact you?
                  </h2>
                </div>
                <PptBadge tone={requiresAdvance ? "warning" : "info"}>
                  {requiresAdvance ? "Partial advance" : "Cash on Delivery"}
                </PptBadge>
              </div>

              {!canCheckout ? (
                <PptNotice
                  tone={isOwnerPreview ? "warning" : "danger"}
                  title={
                    isOwnerPreview
                      ? "Owner preview only"
                      : variantSelectionRequired && !variantSelectionValid
                        ? "Choose size/color before ordering."
                        : "This item is no longer available."
                  }
                  className="mt-5"
                >
                  {isOwnerPreview
                    ? "Publish the store before accepting buyer orders."
                    : variantSelectionRequired && !variantSelectionValid
                      ? "Go back to the product page and select an available option."
                      : "Please go back to the store and choose another available product."}
                </PptNotice>
              ) : null}

              <form onSubmit={handleCreateOrder} className="mt-6 space-y-4">
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

                <PptButton
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={!canCheckout || saving}
                  loading={saving}
                >
                  {saving ? orderStatus || "Creating order..." : "Create order"}
                </PptButton>
              </form>

              <PptNotice
                tone="info"
                title="What happens next?"
                icon={<ShieldCheck size={18} aria-hidden="true" />}
                className="mt-5"
              >
                {requiresAdvance
                  ? `Your order will be created first, then you will pay ${formatINR(
                      advanceAmount
                    )} using the seller's Razorpay payment link.`
                  : "Your order will go directly to the seller for confirmation."}
              </PptNotice>
            </div>
          </section>

          <aside className="order-1 space-y-4 lg:sticky lg:top-6 lg:order-2">
            <ProductSummaryCard
              product={product}
              storeName={store.storeName}
              imageUrl={productImageUrl}
              availableQuantity={availableQuantity}
              selectedVariantLabel={selectedVariant?.label}
              selectedVariantOptions={selectedVariant?.options}
              paymentMode={paymentMode}
              advanceAmount={advanceAmount}
              sellerAmountDue={sellerAmountDue}
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
  selectedVariantLabel,
  selectedVariantOptions,
  paymentMode,
  advanceAmount,
  sellerAmountDue,
}: {
  product: Product;
  storeName: string;
  imageUrl: string;
  availableQuantity: number;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  paymentMode: "cod" | "partial_advance";
  advanceAmount: number;
  sellerAmountDue: number;
}) {
  const badge = getProductBadge(product, availableQuantity);
  const variantDetails = getVariantDetailsText({
    selectedVariantLabel,
    selectedVariantOptions,
  });
  const requiresAdvance = paymentMode === "partial_advance";

  return (
    <div className="pds-panel">
      <h2 className="text-xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
        Order summary
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
            <div className="flex flex-col items-center gap-1 text-[var(--pds-muted)]">
              <ImageIcon size={22} aria-hidden="true" />
              <span className="text-[10px] font-medium">Product image</span>
            </div>
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
          {variantDetails ? (
            <p className="mt-2 break-words text-sm font-medium text-[var(--pds-muted)]">
              {variantDetails}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
            <PptBadge tone={requiresAdvance ? "warning" : "success"}>
              {requiresAdvance ? "Partial advance" : "COD"}
            </PptBadge>
          </div>
          <p className="mt-2 text-xs font-light text-[var(--pds-muted)]">
            {availableQuantity > 0 ? `${availableQuantity} available` : "Unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-[var(--pds-surface-soft)] p-4 text-sm leading-6 text-[var(--pds-muted)]">
        {requiresAdvance ? (
          <>
            <div className="flex justify-between gap-3">
              <span>Advance to seller</span>
              <strong className="text-[var(--pds-text)]">{formatINR(advanceAmount)}</strong>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span>Remaining with seller</span>
              <strong className="text-[var(--pds-text)]">
                {formatINR(sellerAmountDue)}
              </strong>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-3">
            <span>Payment mode</span>
            <strong className="text-[var(--pds-text)]">Cash on Delivery</strong>
          </div>
        )}
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
          placeholder="Enter 10-digit WhatsApp number"
          type="tel"
          name="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          maxLength={16}
          helper="Only enter your 10-digit Indian WhatsApp number. Example: 7067508872"
          value={buyerPhone}
          onChange={(event) => setBuyerPhone(event.target.value)}
          onBlur={() => {
            const normalizedPhone = normalizeIndianMobileInput(buyerPhone);
            if (normalizedPhone.ok && normalizedPhone.localNumber) {
              setBuyerPhone(normalizedPhone.localNumber);
            }
          }}
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
          onChange={(event) =>
            setBuyerPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
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
