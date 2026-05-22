import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatINR } from "../lib/money";
import { getProductById } from "../services/productService";
import { getStoreById } from "../services/storeService";
import {
  buildBuyerBookingMessage,
  buildBuyerBookingWhatsAppUrl,
  getStoreWhatsAppPhone,
} from "../services/whatsappService";
import type { CheckoutSession, Product, Store } from "../types/firestore";

type SuccessState = {
  checkout: CheckoutSession | null;
  product: Product | null;
  store: Store | null;
  loading: boolean;
  error: string;
};

export default function BookingSuccessPage() {
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

        const storedCheckout = sessionStorage.getItem(
          `paypertap:checkout:${checkoutId}`
        );
        const checkout = storedCheckout
          ? (JSON.parse(storedCheckout) as CheckoutSession)
          : null;

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
        console.error("Booking success load failed:", error);

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
  }, [state.checkout, state.store, storeSlug]);

  const whatsappMessage = whatsappInput ? buildBuyerBookingMessage(whatsappInput) : "";
  const sellerWhatsAppPhone = getStoreWhatsAppPhone(state.store);
  const whatsappUrl = whatsappInput
    ? buildBuyerBookingWhatsAppUrl(state.store, whatsappMessage)
    : "#";
  const hasSellerPhone = Boolean(sellerWhatsAppPhone);

  async function handleCopyMessage() {
    if (!whatsappMessage) return;

    await navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
  }

  if (state.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <p className="text-sm font-medium text-gray-600">Loading booking...</p>
      </main>
    );
  }

  if (state.error || !state.checkout) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <section className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-950">Booking not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            We could not find this booking session.
          </p>
        </section>
      </main>
    );
  }

  const checkout = state.checkout;
  const productImage = state.product?.images?.find(
    (image) => image.thumbUrl || image.url || image.mediumUrl
  );
  const productImageUrl =
    productImage?.thumbUrl || productImage?.url || productImage?.mediumUrl || "";

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-8 text-gray-950">
      <section className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-green-700">Booking ready</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Your item is reserved.
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Message the seller on WhatsApp to complete remaining payment and
          delivery confirmation.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Mock payment completed for development. Real Razorpay verification
          will be connected later.
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-gray-200 p-4 text-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {productImageUrl ? (
                <img
                  src={productImageUrl}
                  alt={productImage?.alt || checkout.productTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-gray-400">
                  No image
                </div>
              )}
            </div>
            <p className="font-semibold text-gray-950">{checkout.productTitle}</p>
          </div>
          <SummaryRow label="Product" value={checkout.productTitle} />
          <SummaryRow
            label="Advance paid"
            value={formatINR(checkout.bookingAdvanceAmount)}
          />
          <SummaryRow
            label="Remaining amount"
            value={formatINR(checkout.sellerCollectAmount)}
          />
        </div>

        <div className="mt-6 grid gap-3">
          {hasSellerPhone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-black"
            >
              Confirm on WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={handleCopyMessage}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-gray-50"
            >
              {copied ? "Message copied" : "Copy message"}
            </button>
          )}
        </div>

        {!hasSellerPhone ? (
          <>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Seller WhatsApp number is not available yet.
            </p>
            <textarea
              readOnly
              value={whatsappMessage}
              className="mt-5 h-44 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-700"
            />
          </>
        ) : null}

        <Link
          to={`/${storeSlug}`}
          className="mt-5 inline-flex text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          Back to store
        </Link>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-bold text-gray-950">{value}</span>
    </div>
  );
}
