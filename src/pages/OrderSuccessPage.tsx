import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Copy, ImageIcon, MessageCircle } from "lucide-react";

import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptNotice,
  PptTapLoader,
} from "@/components/ui";
import { formatINR } from "@/lib/money";
import { buildWhatsAppUrl, normalizeIndianMobileInput } from "@/lib/phone";
import { getVariantDetailsText } from "@/lib/productVariants";
import { getProductById } from "@/services/productService";
import { getStoreById } from "@/services/storeService";
import { getOrderById } from "@/services/checkoutService";
import { buildBuyerOrderMessage } from "@/services/whatsappService";
import { getProductGridImageUrl } from "@/storefront/imageMedia";
import type { CheckoutSession, Product, Store } from "@/types/firestore";

type SuccessState = {
  checkout: CheckoutSession | null;
  product: Product | null;
  store: Store | null;
  loading: boolean;
  error: string;
};

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug = "", checkoutId = "" } = useParams();
  const [state, setState] = useState<SuccessState>({
    checkout: null,
    product: null,
    store: null,
    loading: true,
    error: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSuccess() {
      try {
        setState((current) => ({ ...current, loading: true, error: "" }));

        const navigationCheckout =
          location.state &&
          typeof location.state === "object" &&
          "checkout" in location.state
            ? (location.state as { checkout?: CheckoutSession }).checkout
            : null;
        const storedCheckout = sessionStorage.getItem(`paypertap:checkout:${checkoutId}`);
        const checkout =
          navigationCheckout ||
          (storedCheckout
            ? (JSON.parse(storedCheckout) as CheckoutSession)
            : await getOrderById(checkoutId));

        if (!checkout) {
          throw new Error("order details are not available.");
        }

        const [store, product] = await Promise.all([
          getStoreById(checkout.storeId),
          getProductById(checkout.productId).catch(() => null),
        ]);

        if (!store || (store.storeSlug || store.storeId) !== storeSlug) {
          throw new Error("Order not found.");
        }

        if (!cancelled) {
          setState({
            checkout,
            product,
            store,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        console.warn("Order success load failed:", error);

        if (!cancelled) {
          setState({
            checkout: null,
            product: null,
            store: null,
            loading: false,
            error: "Order not found.",
          });
        }
      }
    }

    loadSuccess();

    return () => {
      cancelled = true;
    };
  }, [checkoutId, location.state, storeSlug]);

  const whatsappInput = useMemo(() => {
    if (!state.checkout) return null;

    return {
      storeSlug,
      storeName: state.store?.storeName,
      productId: state.checkout.productId,
      productTitle: state.checkout.productTitle,
      productPrice: state.checkout.productPrice,
      advanceAmount: state.checkout.advanceAmount,
      sellerAmountDue: state.checkout.sellerAmountDue,
      paymentAmount: state.checkout.paymentAmount,
      paymentMode: state.checkout.paymentMode,
      buyerName: state.checkout.buyerName,
      buyerPhone: state.checkout.buyerPhone,
      buyerAddress: state.checkout.buyerAddress,
      buyerCity: state.checkout.buyerCity,
      buyerPincode: state.checkout.buyerPincode,
      selectedVariantId: state.checkout.selectedVariantId,
      selectedVariantLabel: state.checkout.selectedVariantLabel,
      selectedVariantOptions: state.checkout.selectedVariantOptions,
    };
  }, [state.checkout, state.store, storeSlug]);

  const whatsappMessage = whatsappInput ? buildBuyerOrderMessage(whatsappInput) : "";
  const sellerWhatsAppPhone = [
    state.checkout?.sellerWhatsAppPhone,
    state.checkout?.sellerWhatsAppE164,
    state.checkout?.sellerPhone,
    state.store?.whatsappPhone,
    state.store?.phone,
  ].find((phone) => normalizeIndianMobileInput(phone || "").ok);
  const whatsappUrl =
    whatsappInput && sellerWhatsAppPhone
      ? buildWhatsAppUrl(sellerWhatsAppPhone, whatsappMessage)
      : null;
  const hasSellerPhone = Boolean(sellerWhatsAppPhone);

  async function handleCopyMessage() {
    if (!whatsappMessage) return;

    await navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
  }

  function openWhatsApp() {
    if (!hasSellerPhone || !whatsappUrl) return;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (state.loading) {
    return (
      <main className="pds-page grid place-items-center">
        <PptTapLoader
          title="Loading order..."
          description="Preparing your WhatsApp message."
        />
      </main>
    );
  }

  if (state.error || !state.checkout) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptEmptyState
          title="Order not found"
          description="Please go back to the store and try again."
          icon={<MessageCircle size={28} aria-hidden="true" />}
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

  const checkout = state.checkout;
  const isPartialAdvance = checkout.paymentMode === "partial_advance";
  const productImageUrl = state.product ? getProductGridImageUrl(state.product) : "";
  const variantDetails = getVariantDetailsText(checkout);

  return (
    <main className="pds-page">
      <section className="pds-container max-w-3xl">
        <div className="pds-success-card text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--pds-success-soft)] text-[var(--pds-success)]">
            <CheckCircle2 size={34} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <PptBadge tone="success" className="mt-5">
            order submitted
          </PptBadge>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-[var(--pds-text)] sm:text-5xl">
            Order Submitted
          </h1>
          <p className="mx-auto mt-3 max-w-xl whitespace-pre-line text-base font-light leading-7 text-[var(--pds-muted)]">
            {isPartialAdvance
              ? [
                  "Your payment attempt has been completed.",
                  "",
                  "The seller will verify your payment and contact you shortly.",
                  "",
                  "Tap below to share your order and delivery details.",
                ].join("\n")
              : [
                  "Your order has been placed successfully.",
                  "",
                  "The seller will contact you shortly.",
                  "",
                  "Tap below to continue on WhatsApp.",
                ].join("\n")}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            {hasSellerPhone ? (
              <PptButton
                type="button"
                variant="whatsapp"
                size="lg"
                rounded="pill"
                icon={<PptBrandIcon type="whatsapp" size={18} />}
                className="pds-whatsapp-attention"
                onClick={openWhatsApp}
              >
                Continue to WhatsApp
              </PptButton>
            ) : (
              <PptButton type="button" variant="secondary" size="lg" rounded="pill" disabled>
                Seller WhatsApp unavailable
              </PptButton>
            )}

            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--pds-muted)] transition hover:text-[var(--pds-primary)]"
            >
              <Copy size={13} aria-hidden="true" />
              {copied ? "Message copied" : "WhatsApp not opening? Copy message"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div className="pds-panel">
            <div className="flex gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-[var(--pds-border)] bg-[var(--pds-surface-soft)]">
                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt={checkout.productTitle}
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
                <PptBadge tone={isPartialAdvance ? "warning" : "success"}>
                  {isPartialAdvance ? "Seller will verify payment" : "Pending confirmation"}
                </PptBadge>
                <h2 className="mt-3 line-clamp-2 text-xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
                  {checkout.productTitle}
                </h2>
                <p className="mt-1 text-sm font-light text-[var(--pds-muted)]">
                  {state.store?.storeName || "Seller store"}
                </p>
                {variantDetails ? (
                  <p className="mt-2 break-words text-sm font-medium text-[var(--pds-muted)]">
                    {variantDetails}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <PptBadge tone="neutral">Price {formatINR(checkout.productPrice)}</PptBadge>
                  {isPartialAdvance ? (
                    <PptBadge tone="primary">
                      Advance {formatINR(checkout.paymentAmount || checkout.advanceAmount || 0)}
                    </PptBadge>
                  ) : (
                    <PptBadge tone="primary">COD</PptBadge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="pds-panel">
              <h2 className="text-base font-semibold tracking-tight">Payment summary</h2>
              <div className="mt-4 grid gap-3 text-sm text-[var(--pds-muted)]">
                <div className="flex justify-between gap-3">
                  <span>Product price</span>
                  <strong className="text-[var(--pds-text)]">{formatINR(checkout.productPrice)}</strong>
                </div>
                {isPartialAdvance ? (
                  <>
                    <div className="flex justify-between gap-3">
                      <span>Advance to seller</span>
                      <strong className="text-[var(--pds-text)]">
                        {formatINR(checkout.paymentAmount || checkout.advanceAmount || 0)}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Remaining with seller</span>
                      <strong className="text-[var(--pds-text)]">
                        {formatINR(checkout.sellerAmountDue || 0)}
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
          </aside>
        </div>

        <div className="mt-5 grid gap-5">
          <PptNotice
            tone="info"
            title="Continue on WhatsApp"
            icon={<PptBrandIcon type="whatsapp" size={18} />}
          >
            Product and contact details are ready to send.
          </PptNotice>

          <details className="pds-panel group">
            <summary className="cursor-pointer text-sm font-medium text-[var(--pds-text)] transition hover:text-[var(--pds-primary)]">
              View message preview
            </summary>
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-[20px] bg-[var(--pds-surface-soft)] p-4 text-xs leading-6 text-[var(--pds-muted)]">
              {whatsappMessage}
            </pre>
          </details>

          <div className="flex justify-center">
            <PptButton
              type="button"
              variant="secondary"
              rounded="pill"
              onClick={() => navigate(`/${storeSlug}`)}
            >
              Back to store
            </PptButton>
          </div>
        </div>
      </section>
    </main>
  );
}
