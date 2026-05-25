import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Copy, ImageIcon, MessageCircle } from "lucide-react";

import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptNotice,
  PptPriceBreakdown,
  PptTapLoader,
} from "@/components/ui";
import { formatINR } from "@/lib/money";
import { getProductById } from "@/services/productService";
import { getStoreById } from "@/services/storeService";
import {
  buildBuyerBookingMessage,
  buildBuyerBookingWhatsAppUrl,
  getStoreWhatsAppPhone,
} from "@/services/whatsappService";
import type { CheckoutSession, Product, Store } from "@/types/firestore";

type SuccessState = {
  checkout: CheckoutSession | null;
  product: Product | null;
  store: Store | null;
  loading: boolean;
  error: string;
};

export default function BookingSuccessPage() {
  const navigate = useNavigate();
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

        const storedCheckout = sessionStorage.getItem(`paypertap:checkout:${checkoutId}`);
        const checkout = storedCheckout ? (JSON.parse(storedCheckout) as CheckoutSession) : null;

        if (!checkout) {
          throw new Error("Booking details are not available on this device.");
        }

        const [store, product] = await Promise.all([
          getStoreById(checkout.storeId),
          getProductById(checkout.productId).catch(() => null),
        ]);

        if (!store || (store.storeSlug || store.storeId) !== storeSlug) {
          throw new Error("Booking not found.");
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
        console.warn("Booking success load failed:", error);

        if (!cancelled) {
          setState({
            checkout: null,
            product: null,
            store: null,
            loading: false,
            error: "Booking not found.",
          });
        }
      }
    }

    loadSuccess();

    return () => {
      cancelled = true;
    };
  }, [checkoutId, storeSlug]);

  const whatsappInput = useMemo(() => {
    if (!state.checkout) return null;

    return {
      storeSlug,
      productId: state.checkout.productId,
      productTitle: state.checkout.productTitle,
      productPrice: state.checkout.productPrice,
      bookingAdvanceAmount: state.checkout.bookingAdvanceAmount,
      sellerCollectAmount: state.checkout.sellerCollectAmount,
      buyerName: state.checkout.buyerName,
      buyerPhone: state.checkout.buyerPhone,
      buyerAddress: state.checkout.buyerAddress,
      buyerCity: state.checkout.buyerCity,
      buyerPincode: state.checkout.buyerPincode,
    };
  }, [state.checkout, storeSlug]);

  const whatsappMessage = whatsappInput ? buildBuyerBookingMessage(whatsappInput) : "";
  const sellerWhatsAppPhone = getStoreWhatsAppPhone(state.store);
  const whatsappUrl = whatsappInput ? buildBuyerBookingWhatsAppUrl(state.store, whatsappMessage) : "#";
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
          title="Loading booking..."
          description="Preparing your WhatsApp handoff."
        />
      </main>
    );
  }

  if (state.error || !state.checkout) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptEmptyState
          title="Booking not found"
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
  const productImage = state.product?.images?.find(
    (image) => image.thumbUrl || image.url || image.mediumUrl
  );
  const productImageUrl = productImage?.thumbUrl || productImage?.url || productImage?.mediumUrl || "";

  return (
    <main className="pds-page">
      <section className="pds-container max-w-3xl">
        <div className="pds-success-card text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--pds-success-soft)] text-[var(--pds-success)]">
            <CheckCircle2 size={34} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <PptBadge tone="success" className="mt-5">
            Booking confirmed
          </PptBadge>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-[var(--pds-text)] sm:text-5xl">
            Booking confirmed
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base font-light leading-7 text-[var(--pds-muted)]">
            Your ₹20 booking via PayPerTap has been recorded.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            {hasSellerPhone ? (
              <PptButton
                type="button"
                variant="whatsapp"
                size="lg"
                rounded="pill"
                icon={<PptBrandIcon type="whatsapp" size={18} />}
                onClick={openWhatsApp}
              >
                Message seller on WhatsApp
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
                    alt={productImage?.alt || checkout.productTitle}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon size={24} className="text-[var(--pds-muted)]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <PptBadge tone="success">₹20 paid</PptBadge>
                <h2 className="mt-3 line-clamp-2 text-xl font-medium tracking-[-0.03em] text-[var(--pds-text)]">
                  {checkout.productTitle}
                </h2>
                <p className="mt-1 text-sm font-light text-[var(--pds-muted)]">
                  {state.store?.storeName || "Seller store"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PptBadge tone="neutral">Price {formatINR(checkout.productPrice)}</PptBadge>
                  <PptBadge tone="primary">
                    Remaining {formatINR(checkout.sellerCollectAmount)}
                  </PptBadge>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <PptPriceBreakdown
              productPrice={checkout.productPrice}
              advanceAmount={checkout.bookingAdvanceAmount}
              currency="₹"
              note="Remaining amount is paid directly to the seller."
            />
          </aside>
        </div>

        <div className="mt-5 grid gap-5">
          <PptNotice
            tone="info"
            title="After booking, message the seller on WhatsApp."
            icon={<PptBrandIcon type="whatsapp" size={18} />}
          >
            We prepared a message with your booking details so the seller can confirm the remaining
            amount directly.
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
