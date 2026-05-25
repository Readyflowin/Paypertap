import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ImageIcon,
  MessageCircle,
  Search,
  ShieldCheck,
  Store as StoreIcon,
  X,
} from "lucide-react";

import { PptBadge, PptBrandIcon, PptButton } from "@/components/ui";
import { BOOKING_ADVANCE_AMOUNT, formatINR } from "@/lib/money";
import { PaymentTrustStrip } from "../../PaymentTrustStrip";
import {
  getProductDetailImageUrls,
  getProductGridImageUrl,
  getStorefrontImageFetchPriority,
  getStorefrontImageLoading,
} from "../../imageMedia";
import {
  getStoreContactInfo,
  getStorePolicyLinks,
} from "../../storePolicies";
import { useStorefrontWishlist } from "../../useStorefrontWishlist";
import {
  ALL_COLLECTIONS,
  filterProductsByCollectionAndSearch,
  getProductCollection,
  getUniqueCollections,
} from "../../collectionFilters";
import type { StorefrontProduct, StorefrontThemeProps } from "../types";

type FlexibleProduct = StorefrontProduct & {
  inventory?: unknown;
  name?: unknown;
  slug?: unknown;
};

function getStoreTagline(store: StorefrontThemeProps["store"]) {
  return store.tagline || store.bio || "Fresh drops, limited pieces.";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getProductId(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;

  return product.productId || product.id || toText(flexibleProduct.slug);
}

function getProductTitle(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;

  return product.title || toText(flexibleProduct.name) || "Untitled product";
}

function getProductPrice(product: StorefrontProduct) {
  const rawPrice = (product as { price?: unknown }).price;
  const price =
    typeof rawPrice === "string"
      ? Number(rawPrice.replace(/[^\d.]/g, ""))
      : Number(rawPrice || 0);

  return Number.isFinite(price) ? price : 0;
}

function getProductDescription(product: StorefrontProduct) {
  return product.description || "";
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getProductStatus(product: StorefrontProduct) {
  return toText(product.status).toLowerCase();
}

function getAvailableQuantitySafe(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;
  const inventory = Number(product.inventoryQuantity ?? flexibleProduct.inventory ?? 1);
  const reserved = Number(product.reservedQuantity ?? 0);
  const sold = Number(product.soldQuantity ?? 0);

  if (!Number.isFinite(inventory)) return 0;
  return Math.max(0, inventory - reserved - sold);
}

function isBookable(product: StorefrontProduct) {
  return getProductStatus(product) === "open" && getAvailableQuantitySafe(product) > 0;
}

function isVisibleProduct(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (!status) return true;
  return ["open", "hold", "sold", "reserved"].includes(status);
}

function getProductBadge(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (status === "sold") return { label: "Sold out", tone: "sold" as const };
  if (status === "hold" || status === "reserved") return { label: "Reserved", tone: "reserved" as const };
  if (!isBookable(product)) return { label: "Unavailable", tone: "neutral" as const };

  const available = getAvailableQuantitySafe(product);
  if (available === 1) return { label: "1 left", tone: "warning" as const };

  return { label: "Available", tone: "success" as const };
}

function getSellerCollectAmount(price: number) {
  return Number.isFinite(price) && price > BOOKING_ADVANCE_AMOUNT
    ? price - BOOKING_ADVANCE_AMOUNT
    : null;
}

function getUnavailableCtaLabel(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (status === "sold") return "Sold out";
  if (status === "hold" || status === "reserved") return "Reserved";
  return "Not bookable";
}

function Theme1Header({ store }: { store: StorefrontThemeProps["store"] }) {
  const initials = getInitials(store.storeName || "Store");

  return (
    <header className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_44px_rgba(17,18,23,0.06)] sm:p-6">
      <div className="flex items-start gap-4">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={`${store.storeName} logo`}
            decoding="async"
            fetchPriority="high"
            loading="eager"
            className="h-16 w-16 shrink-0 rounded-2xl border border-neutral-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-lg font-medium text-white">
            {initials || <StoreIcon size={22} aria-hidden="true" />}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 truncate text-2xl font-medium tracking-[-0.04em] text-neutral-950">
              {store.storeName || "PayPerTap Store"}
            </h1>
            <PptBadge tone="success">Verified</PptBadge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
            {getStoreTagline(store)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3">
          <ShieldCheck size={16} aria-hidden="true" className="mb-2 text-neutral-950" />
          Verified booking via PayPerTap
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3">
          ₹20 booking reserves this item
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3">
          Remaining amount is paid directly to seller
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-neutral-400">
        Powered by PayPerTap
      </p>
    </header>
  );
}

function Theme1ProductCard({
  fallbackIndex,
  isSaved,
  onSelect,
  onToggleSaved,
  product,
}: {
  fallbackIndex: number;
  isSaved: boolean;
  onSelect: (product: StorefrontProduct) => void;
  onToggleSaved: (product: StorefrontProduct, fallbackIndex: number) => void;
  product: StorefrontProduct;
}) {
  const imageUrl = getProductGridImageUrl(product);
  const title = getProductTitle(product);
  const price = getProductPrice(product);
  const badge = getProductBadge(product);
  const ctaLabel = isBookable(product) ? "Book ₹20" : "View";

  return (
    <article className="relative min-w-0 overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_12px_32px_rgba(17,18,23,0.05)]">
      <button
        type="button"
        aria-label={isSaved ? "Remove saved item" : "Save item"}
        onClick={() => onToggleSaved(product, fallbackIndex)}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition ${
          isSaved
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-white/80 bg-white/90 text-neutral-600 hover:text-neutral-950"
        }`}
      >
        <Heart size={15} aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              decoding="async"
              fetchPriority={getStorefrontImageFetchPriority(fallbackIndex)}
              loading={getStorefrontImageLoading(fallbackIndex)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-400">
              <ImageIcon size={24} aria-hidden="true" />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          <div className="absolute left-2 top-2">
            <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
          </div>
        </div>

        <div className="min-w-0 p-3">
          <h2 className="line-clamp-2 min-h-[38px] whitespace-normal break-words text-sm font-medium leading-5 tracking-[-0.01em] text-neutral-950">
            {title}
          </h2>
          <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-base font-semibold tracking-[-0.03em] text-neutral-950">
              {formatINR(price)}
            </p>
            <span className="max-w-[72px] shrink-0 truncate rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700 sm:max-w-none sm:px-3 sm:text-xs">
              {ctaLabel}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

function Theme1ProductGrid({
  collections,
  getProductFallbackIndex,
  isProductSaved,
  onCollectionChange,
  onSearchChange,
  onSelect,
  onToggleProductSaved,
  onToggleSavedView,
  products,
  searchQuery,
  savedCount,
  selectedCollection,
  showSavedOnly,
  totalProductCount,
}: {
  collections: string[];
  getProductFallbackIndex: (product: StorefrontProduct) => number;
  isProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => boolean;
  onCollectionChange: (collection: string) => void;
  onSearchChange: (query: string) => void;
  onSelect: (product: StorefrontProduct) => void;
  onToggleProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => void;
  onToggleSavedView: () => void;
  products: StorefrontProduct[];
  searchQuery: string;
  savedCount: number;
  selectedCollection: string;
  showSavedOnly: boolean;
  totalProductCount: number;
}) {
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const hasSearch = searchQuery.trim().length > 0;
  const searchResults = hasSearch ? products.slice(0, 6) : [];
  const showSearchPanel = hasSearch && !suggestionsDismissed;
  const hasMoreSearchResults = hasSearch && products.length > searchResults.length;

  useEffect(() => {
    setSuggestionsDismissed(false);
  }, [searchQuery, selectedCollection, showSavedOnly]);

  if (totalProductCount === 0) {
    return (
      <section className="rounded-[26px] border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_32px_rgba(17,18,23,0.04)]">
        <h2 className="text-xl font-medium tracking-[-0.03em] text-neutral-950">
          No products listed yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          This seller has not added products to this storefront yet.
        </p>
      </section>
    );
  }

  const filterOptions = [ALL_COLLECTIONS, ...collections];
  const emptyTitle = showSavedOnly
    ? savedCount > 0
      ? "No saved items match these filters"
      : "No saved items yet"
    : hasSearch
    ? selectedCollection === ALL_COLLECTIONS
      ? "No products found"
      : "No products found in this collection"
    : "No products in this collection yet";
  const emptyDescription = showSavedOnly
    ? savedCount > 0
      ? "Clear search or choose All to see more saved products."
      : "Tap the heart on a product to save it for this browsing session."
    : hasSearch
    ? "Try a different search or switch collections."
    : "Choose All to keep browsing this store.";

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Latest drops
          </p>
          <h2 className="mt-1 text-xl font-medium tracking-[-0.035em] text-neutral-950">
            Products
          </h2>
        </div>
        <p className="text-sm text-neutral-500">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-3 flex min-w-0 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_10px_26px_rgba(17,18,23,0.04)] focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200">
        <Search size={16} aria-hidden="true" className="shrink-0 text-neutral-400" />
        <label className="sr-only" htmlFor="theme1-product-search">
          Search products
        </label>
        <input
          id="theme1-product-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products"
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
        />
        {hasSearch ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-950"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {showSearchPanel ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_36px_rgba(17,18,23,0.08)]">
          <div className="border-b border-neutral-100 px-3 py-2 text-xs font-medium text-neutral-500">
            Search results
          </div>
          {searchResults.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((product, index) => {
                const imageUrl = getProductGridImageUrl(product);
                const title = getProductTitle(product);
                const price = getProductPrice(product);
                const collectionName = getProductCollection(product);

                return (
                  <button
                    key={`${getProductId(product) || title}-${index}`}
                    type="button"
                    onClick={() => {
                      onSelect(product);
                      setSuggestionsDismissed(true);
                    }}
                    className="flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left transition hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-300"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        decoding="async"
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-xl border border-neutral-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-400">
                        <ImageIcon size={17} aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 whitespace-normal break-words text-sm font-medium leading-5 text-neutral-950">
                        {title}
                      </p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                        {price > 0 ? <span>{formatINR(price)}</span> : null}
                        {collectionName ? (
                          <span className="max-w-full truncate">{collectionName}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-neutral-950">View</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-neutral-500">
              {selectedCollection === ALL_COLLECTIONS
                ? "No results found"
                : "No results found in this collection"}
            </div>
          )}
          {hasMoreSearchResults ? (
            <p className="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-400">
              Showing top results
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-3 flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSavedView}
          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            showSavedOnly
              ? "border-neutral-950 bg-neutral-950 text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-950"
          }`}
        >
          <Heart
            size={14}
            aria-hidden="true"
            fill={showSavedOnly ? "currentColor" : "none"}
          />
          <span className="truncate">Saved</span>
          <span>{savedCount}</span>
        </button>
      </div>
      {showSavedOnly ? (
        <p className="mb-3 text-xs font-medium text-neutral-500">
          Saved view uses the current search and collection.
        </p>
      ) : null}

      {filterOptions.length > 1 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map((collection) => {
            const isActive = collection === selectedCollection;

            return (
              <button
                key={collection}
                type="button"
                onClick={() => onCollectionChange(collection)}
                className={`max-w-[180px] shrink-0 truncate rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-600"
                }`}
              >
                {collection}
              </button>
            );
          })}
        </div>
      ) : null}

      {products.length === 0 ? (
        hasSearch && showSearchPanel ? null : (
        <section className="rounded-[26px] border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_32px_rgba(17,18,23,0.04)]">
          <h2 className="text-xl font-medium tracking-[-0.03em] text-neutral-950">
            {emptyTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {emptyDescription}
          </p>
        </section>
        )
      ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const fallbackIndex = getProductFallbackIndex(product);

          return (
            <Theme1ProductCard
              key={getProductId(product) || getProductTitle(product)}
              fallbackIndex={fallbackIndex}
              isSaved={isProductSaved(product, fallbackIndex)}
              product={product}
              onSelect={onSelect}
              onToggleSaved={onToggleProductSaved}
            />
          );
        })}
      </div>
      )}
    </section>
  );
}

function Theme1ProductDetail({
  fallbackIndex,
  isSaved,
  onClose,
  onToggleSaved,
  product,
  storeSlug,
}: {
  fallbackIndex: number;
  isSaved: boolean;
  onClose: () => void;
  onToggleSaved: (product: StorefrontProduct, fallbackIndex?: number) => void;
  product: StorefrontProduct;
  storeSlug: string;
}) {
  const images = getProductDetailImageUrls(product);
  const title = getProductTitle(product);
  const price = getProductPrice(product);
  const sellerCollectAmount = getSellerCollectAmount(price);
  const description = getProductDescription(product);
  const productId = getProductId(product);
  const bookable = Boolean(productId && isBookable(product));
  const unavailableCtaLabel = getUnavailableCtaLabel(product);
  const checkoutHref = `/${storeSlug}/checkout/${productId}`;
  const imageSlots = images.length ? images : [""];
  const imageGridClass =
    imageSlots.length === 1
      ? "grid-cols-1"
      : imageSlots.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 box-border overflow-x-hidden overflow-y-auto bg-neutral-950/42 px-3 py-4 backdrop-blur-sm sm:py-6">
      <div
        aria-modal="true"
        role="dialog"
        aria-label={`${title} details`}
        className="mx-auto max-h-[calc(100vh-32px)] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_80px_rgba(17,18,23,0.24)]"
      >
        <div className="sticky top-0 z-10 flex min-w-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <p className="min-w-0 truncate text-sm font-medium text-neutral-700">
            Product details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700"
          >
            Close
          </button>
        </div>

        <div className="grid min-w-0 max-w-full gap-3 overflow-x-hidden p-4 pb-28 sm:pb-4">
          <div className={`grid min-w-0 max-w-full ${imageGridClass} gap-2`}>
            {imageSlots.slice(0, 3).map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="aspect-[4/5] min-w-0 overflow-hidden rounded-2xl bg-neutral-100"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${title} image ${index + 1}`}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full max-w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400">
                    <ImageIcon size={22} aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <section className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-neutral-200 p-4">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-[1_1_12rem]">
                <h2 className="break-words text-2xl font-medium leading-tight tracking-[-0.04em] text-neutral-950">
                  {title}
                </h2>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                  {formatINR(price)}
                </p>
              </div>
              <div className="max-w-full shrink-0">
                <PptBadge tone={bookable ? "success" : "neutral"}>
                  {bookable ? "Available" : "Not bookable"}
                </PptBadge>
              </div>
              <button
                type="button"
                aria-label={isSaved ? "Remove saved item" : "Save item"}
                onClick={() => onToggleSaved(product, fallbackIndex)}
                className={`inline-flex min-h-9 max-w-full shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium ${
                  isSaved
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                <Heart
                  size={15}
                  aria-hidden="true"
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>

            {description ? (
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-neutral-600">
                {description}
              </p>
            ) : null}

            <div className="mt-5 min-w-0 max-w-full rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
              <strong className="block font-medium text-neutral-950">
                Pay ₹{BOOKING_ADVANCE_AMOUNT} to reserve this item.
              </strong>
              {sellerCollectAmount !== null
                ? `Pay ${formatINR(sellerCollectAmount)} directly to the seller.`
                : "Pay the remaining amount directly to the seller."}
              <span className="block">Seller confirms on WhatsApp after booking.</span>
            </div>

            <div className="mt-4">
              <PaymentTrustStrip compact variant="theme1" />
            </div>

            <div className="mt-5 hidden gap-3 sm:grid">
              {bookable ? (
                <Link
                  to={checkoutHref}
                  className="pds-button pds-button-primary pds-button-lg pds-button-rounded-lg is-full"
                >
                  <span>Book now for ₹20</span>
                </Link>
              ) : (
                <PptButton fullWidth size="lg" variant="secondary" disabled>
                  {unavailableCtaLabel}
                </PptButton>
              )}
              <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-neutral-500">
                <MessageCircle size={14} aria-hidden="true" />
                Chat with seller after booking.
              </p>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 w-full max-w-full overflow-hidden border-t border-neutral-200 bg-white/96 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-neutral-500">
                Product price
              </p>
              <p className="truncate text-lg font-semibold tracking-[-0.035em] text-neutral-950">
                {formatINR(price)}
              </p>
            </div>
            {bookable ? (
              <Link
                to={checkoutHref}
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl bg-neutral-950 px-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,18,23,0.18)]"
              >
                Book now for ₹{BOOKING_ADVANCE_AMOUNT}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl border border-neutral-200 bg-neutral-100 px-3 text-sm font-medium text-neutral-400"
              >
                {unavailableCtaLabel}
              </button>
            )}
          </div>
          <p className="mt-2 break-words text-center text-xs font-medium text-neutral-500">
            {sellerCollectAmount !== null
              ? `${formatINR(sellerCollectAmount)} remaining paid directly to seller`
              : "Pay remaining directly to seller"}
            <span className="block">Seller confirms on WhatsApp</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Theme1Footer({
  store,
  storeSlug,
}: {
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const contact = getStoreContactInfo(store);
  const currentYear = new Date().getFullYear();
  const policyLinks = getStorePolicyLinks(store);
  const aboutText = getStoreTagline(store);

  return (
    <footer className="w-full overflow-hidden bg-neutral-950 text-sm leading-6 text-white/68">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-9 sm:px-5 md:grid-cols-[1.15fr_0.85fr_1fr]">
        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            About us
          </p>
          <h2 className="mt-3 break-words text-2xl font-semibold tracking-[-0.04em] text-white">
            {contact.displayName}
          </h2>
          <p className="mt-3 max-w-sm break-words text-white/62">{aboutText}</p>
          <p className="mt-6 text-xs font-medium text-white/36">
            © {currentYear} {contact.displayName}. Powered by PayPerTap.
          </p>
        </section>

        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            Shop
          </p>
          <nav className="mt-3 grid gap-2">
            {policyLinks.map((policy) => (
              <Link
                key={policy.type}
                to={`/${storeSlug}/policies/${policy.type}`}
                className="w-fit max-w-full break-words text-white/72 hover:text-white"
              >
                {policy.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            Contact
          </p>
          <div className="mt-3 grid gap-2">
            {contact.ownerName ? (
              <p className="break-words text-white/72">{contact.ownerName}</p>
            ) : null}
            {contact.whatsappUrl ? (
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 w-fit max-w-full items-center gap-2 font-medium text-white"
              >
                <PptBrandIcon type="whatsapp" size={16} />
                <span className="truncate">WhatsApp</span>
              </a>
            ) : null}
            {contact.supportPhone ? (
              contact.supportPhoneHref ? (
                <a href={contact.supportPhoneHref} className="break-words text-white/68">
                  {contact.supportPhone}
                </a>
              ) : (
                <span className="break-words text-white/68">{contact.supportPhone}</span>
              )
            ) : null}
            {contact.supportEmail ? (
              contact.supportEmailHref ? (
                <a href={contact.supportEmailHref} className="break-words text-white/68">
                  {contact.supportEmail}
                </a>
              ) : (
                <span className="break-words text-white/68">{contact.supportEmail}</span>
              )
            ) : null}
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 w-fit max-w-full items-center gap-2 text-white/68 hover:text-white"
              >
                <PptBrandIcon type="instagram" size={16} />
                <span className="truncate">{contact.instagramLabel}</span>
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </footer>
  );
}

export default function Theme1({
  collections: managedCollections = [],
  isOwnerPreview,
  products,
  store,
  storeSlug,
}: StorefrontThemeProps) {
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [activeCollection, setActiveCollection] = useState(ALL_COLLECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const wishlist = useStorefrontWishlist({
    isPreview: isOwnerPreview,
    storeId: store.storeId,
    storeSlug,
  });
  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        isVisibleProduct(product)
      ),
    [products]
  );
  const collections = useMemo(
    () => getUniqueCollections(visibleProducts, managedCollections),
    [managedCollections, visibleProducts]
  );
  const selectedCollection =
    activeCollection === ALL_COLLECTIONS || collections.includes(activeCollection)
      ? activeCollection
      : ALL_COLLECTIONS;
  const filteredProducts = useMemo(
    () =>
      filterProductsByCollectionAndSearch(
        visibleProducts,
        selectedCollection,
        searchQuery,
        managedCollections
    ),
    [managedCollections, searchQuery, selectedCollection, visibleProducts]
  );
  const getProductFallbackIndex = (product: StorefrontProduct) =>
    Math.max(0, visibleProducts.indexOf(product));
  const savedProductCount = useMemo(
    () =>
      visibleProducts.filter((product) =>
        wishlist.isWishlisted(product, getProductFallbackIndex(product))
      ).length,
    [visibleProducts, wishlist]
  );
  const displayedProducts = useMemo(
    () =>
      showSavedOnly
        ? filteredProducts.filter((product) =>
            wishlist.isWishlisted(product, getProductFallbackIndex(product))
          )
        : filteredProducts,
    [filteredProducts, showSavedOnly, wishlist]
  );
  const selectedProductFallbackIndex = selectedProduct
    ? getProductFallbackIndex(selectedProduct)
    : 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f8] text-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-4 sm:px-5 sm:py-6">
        <Theme1Header store={store} />
        <PaymentTrustStrip variant="theme1" />

        <section className="rounded-[28px] border border-neutral-200 bg-white px-5 py-5 shadow-[0_14px_40px_rgba(17,18,23,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-medium tracking-[-0.045em] text-neutral-950">
                Reserve your pick with ₹20
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Browse available pieces, book your favourite item, then confirm delivery and the remaining payment on WhatsApp.
              </p>
            </div>
            <PptBadge tone="primary">₹{BOOKING_ADVANCE_AMOUNT} booking</PptBadge>
          </div>
        </section>

        <Theme1ProductGrid
          collections={collections}
          getProductFallbackIndex={getProductFallbackIndex}
          isProductSaved={wishlist.isWishlisted}
          onCollectionChange={setActiveCollection}
          onSearchChange={setSearchQuery}
          onSelect={setSelectedProduct}
          onToggleProductSaved={wishlist.toggleWishlistItem}
          onToggleSavedView={() => setShowSavedOnly((current) => !current)}
          products={displayedProducts}
          searchQuery={searchQuery}
          savedCount={savedProductCount}
          selectedCollection={selectedCollection}
          showSavedOnly={showSavedOnly}
          totalProductCount={visibleProducts.length}
        />
      </div>
      <Theme1Footer store={store} storeSlug={storeSlug} />

      {selectedProduct ? (
        <Theme1ProductDetail
          fallbackIndex={selectedProductFallbackIndex}
          isSaved={wishlist.isWishlisted(selectedProduct, selectedProductFallbackIndex)}
          onToggleSaved={wishlist.toggleWishlistItem}
          product={selectedProduct}
          storeSlug={storeSlug}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </main>
  );
}
