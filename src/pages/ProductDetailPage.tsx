import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { formatINR } from "../lib/money";
import { getProductById, getPublicProductById } from "../services/productService";
import { getPublicStoreData } from "../services/publicStoreService";
import type { Product, Store } from "../types/firestore";

type PageState = {
  store: Store | null;
  product: Product | null;
  isOwnerPreview: boolean;
  loading: boolean;
  error: string;
};

function getProductImage(product: Product): string {
  const image = product.images?.find(
    (item) => item.thumbUrl || item.url || item.mediumUrl
  );

  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
}

function getAvailableQuantity(product: Product): number {
  return Math.max(
    product.inventoryQuantity - product.reservedQuantity - product.soldQuantity,
    0
  );
}

export default function ProductDetailPage() {
  const { storeSlug = "", productId = "" } = useParams();
  const { user, loading: authLoading } = useAuthUser();
  const [state, setState] = useState<PageState>({
    store: null,
    product: null,
    isOwnerPreview: false,
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadProduct() {
      try {
        setState((current) => ({ ...current, loading: true, error: "" }));

        const storeData = await getPublicStoreData(storeSlug, user?.uid);

        if (!storeData) {
          throw new Error("Product not found");
        }

        const product = storeData.isOwnerPreview
          ? await getProductById(productId)
          : await getPublicProductById(productId);

        if (!product || product.storeId !== storeData.store.storeId) {
          throw new Error("Product not found");
        }

        if (!cancelled) {
          setState({
            store: storeData.store,
            product,
            isOwnerPreview: storeData.isOwnerPreview,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        console.error("Product detail load failed:", error);

        if (!cancelled) {
          setState({
            store: null,
            product: null,
            isOwnerPreview: false,
            loading: false,
            error: "Product not found",
          });
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [authLoading, productId, storeSlug, user?.uid]);

  if (state.loading || authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <p className="text-sm font-medium text-gray-600">Loading product...</p>
      </main>
    );
  }

  if (state.error || !state.store || !state.product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <section className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-950">Product not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This item may be unavailable or the store may be unpublished.
          </p>
        </section>
      </main>
    );
  }

  const { store, product, isOwnerPreview } = state;
  const imageUrl = getProductImage(product);
  const availableQuantity = getAvailableQuantity(product);
  const isAvailable =
    store.isPublished &&
    product.status === "open" &&
    availableQuantity > 0 &&
    !isOwnerPreview;
  const isSoldOut = product.status === "sold" || availableQuantity <= 0;

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-950">
      <section className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Link
          to={`/${storeSlug}`}
          className="text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          Back to {store.storeName}
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <div className="aspect-[4/5] bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.images?.[0]?.alt || product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-400">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {isOwnerPreview ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Owner preview. Checkout is disabled until this store is published.
              </div>
            ) : null}

            <p className="text-sm font-medium text-gray-500">
              {product.category || "General"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">
                {product.title}
              </h1>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold capitalize text-gray-600">
                {product.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {product.description || "No description added yet."}
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl border border-gray-200 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Product price</span>
                <span className="font-bold">{formatINR(product.price)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Pay now</span>
                <span className="font-bold">
                  {formatINR(product.bookingAdvanceAmount)} advance
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Pay seller later</span>
                <span className="font-bold">
                  {formatINR(product.sellerCollectAmount)}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Pay ₹20 advance to reserve this item. The remaining amount is paid
              directly to the seller on WhatsApp/UPI/COD.
            </p>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
              <span className="font-medium text-gray-600">Availability</span>
              <span className="font-bold text-gray-950">
                {product.status === "open" && availableQuantity > 0
                  ? `${availableQuantity} available`
                  : isSoldOut
                    ? "Sold out"
                    : "Reserved"}
              </span>
            </div>

            {isAvailable ? (
              <Link
                to={`/${storeSlug}/checkout/${product.productId || product.id}`}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-black"
              >
                Book for ₹20
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 w-full rounded-2xl bg-gray-200 px-4 py-3 text-sm font-bold text-gray-500"
              >
                {isOwnerPreview ? "Preview only" : isSoldOut ? "Sold out" : "Reserved"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
