import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Heart,
  ImageIcon,
  PackageCheck,
  Search,
  Store as StoreIcon,
  X,
} from "lucide-react";

import { PptBadge, PptBrandIcon, PptButton } from "@/components/ui";
import { getDisplayImageUrl } from "@/lib/imageUrls";
import { BOOKING_ADVANCE_AMOUNT, formatINR } from "@/lib/money";
import {
  getAvailableQuantity as getSharedAvailableQuantity,
  getProductUnavailableLabel,
  isProductBookable,
} from "@/lib/productAvailability";
import { PaymentTrustStrip } from "../../PaymentTrustStrip";
import {
  getStoreConfirmationAdvanceBreakdown,
  getStorefrontConfirmationPolicyText,
  getStorefrontPaymentSubtext,
  StorefrontPaymentBreakdown,
} from "../../StorefrontPaymentBreakdown";
import {
  getProductDetailImageUrls,
  getProductGridImageUrl,
  getStorefrontImageFetchPriority,
  getStorefrontImageLoading,
} from "../../imageMedia";
import {
  getStoreFooterCollectionNames,
  getStoreFooterSubheading,
  getStoreContactInfo,
  getStorePolicyLinks,
} from "../../storePolicies";
import { useStorefrontWishlist } from "../../useStorefrontWishlist";
import { useVisibleProductBatch } from "../../useVisibleProductBatch";
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
  price?: unknown;
  slug?: unknown;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getStoreTagline(store: StorefrontThemeProps["store"]) {
  return store.tagline || store.bio || "Fresh drops, limited pieces.";
}

function getStoreLogoUrl(store: StorefrontThemeProps["store"]) {
  return getDisplayImageUrl(store.logoUrl || store.storeLogoUrl);
}

function getProductId(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;

  return product.productId || product.id || toText(flexibleProduct.slug);
}

function getProductTitle(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;

  return product.title || toText(flexibleProduct.name) || "Untitled drop";
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

function getProductStatus(product: StorefrontProduct) {
  return toText(product.status).toLowerCase();
}

function getAvailableQuantity(product: StorefrontProduct) {
  return getSharedAvailableQuantity(product);
}

function hasExplicitAvailability(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;
  return (
    Boolean(getProductStatus(product)) ||
    product.inventoryQuantity !== undefined ||
    flexibleProduct.inventory !== undefined ||
    product.reservedQuantity !== undefined ||
    product.soldQuantity !== undefined
  );
}

function isBookable(product: StorefrontProduct) {
  return isProductBookable(product);
}

function isVisibleProduct(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (!status) return true;
  return ["open", "hold", "reserved", "sold"].includes(status);
}

function getProductBadge(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (status === "sold") return { label: "Sold", tone: "neutral" as const };
  if (status === "hold" || status === "reserved") {
    return { label: "Reserved", tone: "reserved" as const };
  }
  if (!isBookable(product)) return { label: "Unavailable", tone: "neutral" as const };
  return { label: "Available", tone: "success" as const };
}

function getUnavailableCtaLabel(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (status === "hold" || status === "reserved") return "Currently reserved";
  return getProductUnavailableLabel(product);
}

function Theme3DropHero({ store }: { store: StorefrontThemeProps["store"] }) {
  const storeName = store.storeName || "PayPerTap Store";
  const initials = getInitials(storeName);
  const contact = getStoreContactInfo(store);
  const logoUrl = getStoreLogoUrl(store);
  const confirmationPolicyText = getStorefrontConfirmationPolicyText(store);

  return (
    <header className="overflow-hidden rounded-[30px] border border-white/10 bg-[#050507] text-white shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
      <div className="grid min-w-0 gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:items-end">
        <div className="min-w-0">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                decoding="async"
                fetchPriority="high"
                loading="eager"
                className="h-14 w-14 shrink-0 rounded-2xl border border-white/16 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/14 bg-white text-sm font-semibold text-neutral-950">
                {initials || <StoreIcon size={20} aria-hidden="true" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-medium text-white/82">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Latest drop
                </p>
                {contact.instagramUrl ? (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-2.5 py-1 text-xs font-medium text-white/64 hover:text-white"
                  >
                    <PptBrandIcon type="instagram" size={14} />
                    <span className="truncate">{contact.instagramLabel}</span>
                  </a>
                ) : null}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Continue on WhatsApp
              </p>
            </div>
          </div>

          <h1 className="max-w-4xl break-words text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            {storeName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
            {getStoreTagline(store)}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/54">
            {confirmationPolicyText}
          </p>
          <a
            href="#products"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] !text-neutral-950 transition hover:bg-white/90 min-[420px]:w-fit"
          >
            Shop live drops
          </a>
        </div>

        <div className="min-w-0 rounded-[24px] border border-white/10 bg-neutral-900 p-4 text-sm text-white/64">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex min-w-0 items-start gap-3 rounded-[18px] border border-white/10 bg-white/7 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-neutral-950">
                <BadgeCheck size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {formatINR(BOOKING_ADVANCE_AMOUNT)} booking via PayPerTap
                </p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Your item is held after successful booking.
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-[18px] border border-white/10 bg-white/7 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950">
                <PptBrandIcon type="whatsapp" size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  Continue on WhatsApp
                </p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Product and contact details are ready to send.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Theme3Hero({ store }: { store: StorefrontThemeProps["store"] }) {
  const storeName = store.storeName || "PayPerTap Store";
  const initials = getInitials(storeName);
  const logoUrl = getStoreLogoUrl(store);

  return (
    <header className="overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950 text-white shadow-[0_24px_70px_rgba(10,10,12,0.22)]">
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                decoding="async"
                fetchPriority="high"
                loading="eager"
                className="h-14 w-14 shrink-0 rounded-2xl border border-white/16 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/14 bg-white text-sm font-semibold text-neutral-950">
                {initials || <StoreIcon size={20} aria-hidden="true" />}
              </div>
            )}
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-medium text-white/82">
                <BadgeCheck size={14} aria-hidden="true" />
                Verified ₹{BOOKING_ADVANCE_AMOUNT} booking via PayPerTap
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Book now. Continue with the seller.
              </p>
            </div>
          </div>

          <h1 className="max-w-4xl break-words text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            {storeName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
            {getStoreTagline(store)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
          <div className="rounded-2xl border border-white/12 bg-white/7 p-3">
            <p className="text-2xl font-semibold tracking-[-0.04em]">
              ₹{BOOKING_ADVANCE_AMOUNT}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/58">booking</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/7 p-3">
            <p className="text-2xl font-semibold tracking-[-0.04em]">WA</p>
            <p className="mt-1 text-xs leading-5 text-white/58">WhatsApp</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white/46 sm:px-7">
        Limited drop storefront
      </div>
    </header>
  );
}

function Theme3ProductCard({
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
  const showBadge = hasExplicitAvailability(product);
  const badge = getProductBadge(product);
  const bookable = isBookable(product);
  const ctaLabel = bookable
    ? `Book for ${formatINR(BOOKING_ADVANCE_AMOUNT)}`
    : "View details";

  return (
    <article className="relative min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-white/18 hover:shadow-[0_24px_56px_rgba(0,0,0,0.38)]">
      <button
        type="button"
        aria-label={isSaved ? "Remove saved item" : "Save item"}
        onClick={() => onToggleSaved(product, fallbackIndex)}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition ${
          isSaved
            ? "border-emerald-300 bg-emerald-300 text-neutral-950"
            : "border-white/12 bg-neutral-950/72 text-white/76 hover:text-white"
        }`}
      >
        <Heart size={15} aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="block h-full w-full text-left"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-800">
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/34">
              <ImageIcon size={24} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                Product image
              </span>
            </div>
          )}
          {showBadge ? (
            <div className="absolute left-2 top-2">
              <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 p-3">
          <h2 className="line-clamp-2 min-h-[40px] whitespace-normal break-words text-sm font-semibold leading-5 tracking-[-0.02em] text-white">
            {title}
          </h2>
          <div className="mt-3 grid min-w-0 gap-2">
            <p className="min-w-0 text-base font-bold tracking-[-0.04em] text-white">
              {formatINR(price)}
            </p>
            <span className="w-fit max-w-full rounded-full border border-emerald-300/20 bg-emerald-300/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-emerald-200">
              Limited Drop
            </span>
          </div>
          <span
            className={`mt-3 flex min-h-9 w-full items-center justify-center rounded-2xl px-2 text-center text-[11px] font-bold uppercase tracking-[0.05em] ${
              bookable
                ? "bg-white text-neutral-950"
                : "border border-white/10 bg-white/8 text-white/62"
            }`}
          >
            {ctaLabel}
          </span>
        </div>
      </button>
    </article>
  );
}

function Theme3ProductGrid({
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
  const {
    canLoadMore,
    loadMore,
    totalCount,
    visibleCount,
    visibleProducts: renderedProducts,
  } = useVisibleProductBatch(products);

  useEffect(() => {
    setSuggestionsDismissed(false);
  }, [searchQuery, selectedCollection, showSavedOnly]);

  if (totalProductCount === 0) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-neutral-900 p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-950">
          <PackageCheck size={22} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white">
          No drops listed yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/54">
          This seller is preparing their next release.
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
      ? "Clear search or switch to All to see more saved drops."
      : "Tap the heart on a drop to save it for this browsing session."
    : hasSearch
    ? "Try another search or switch the drop filter."
    : "Switch back to All to browse every drop.";

  return (
    <section id="products">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">
            Drop list
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.06em] text-white">
            Live items
          </h2>
        </div>
        <p className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/58">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-3 flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.22)] focus-within:border-white/28 focus-within:ring-2 focus-within:ring-white/10">
        <Search size={16} aria-hidden="true" className="shrink-0 text-white/45" />
        <label className="sr-only" htmlFor="theme3-product-search">
          Search drops
        </label>
        <input
          id="theme3-product-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search drops"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:font-medium placeholder:text-white/34"
        />
        {hasSearch ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-white/24 hover:text-white"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {showSearchPanel ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-[0_18px_44px_rgba(0,0,0,0.26)]">
          <div className="border-b border-white/10 bg-neutral-950 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
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
                    className="flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left transition hover:bg-white/6 focus:bg-white/6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/18"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        decoding="async"
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/40">
                        <ImageIcon size={17} aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 whitespace-normal break-words text-sm font-bold leading-5 text-white">
                        {title}
                      </p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
                        {price > 0 ? <span>{formatINR(price)}</span> : null}
                        {collectionName ? (
                          <span className="max-w-full truncate">{collectionName}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-950">
                      View
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm font-medium text-white/54">
              {selectedCollection === ALL_COLLECTIONS
                ? "No results found"
                : "No results found in this collection"}
            </div>
          )}
          {hasMoreSearchResults ? (
            <p className="border-t border-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
              Showing top results
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-3 flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSavedView}
          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition ${
            showSavedOnly
              ? "border-white bg-white text-neutral-950"
              : "border-white/10 bg-neutral-900 text-white/70 hover:border-white/24 hover:text-white"
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
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-white/45">
          Saved uses current search and collection
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
                className={`max-w-[180px] shrink-0 truncate rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] ${
                  isActive
                    ? "border-white bg-white text-neutral-950"
                    : "border-white/10 bg-neutral-900 text-white/70"
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
        <section className="rounded-[28px] border border-white/10 bg-neutral-900 p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-950">
            <PackageCheck size={22} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white">
            {emptyTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/54">
            {emptyDescription}
          </p>
        </section>
        )
      ) : hasSearch && showSearchPanel ? (
        <p className="px-1 text-xs font-bold uppercase tracking-[0.08em] text-white/45">
          Showing search matches above. Clear search to browse the grid.
        </p>
      ) : (
      <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {renderedProducts.map((product) => {
            const fallbackIndex = getProductFallbackIndex(product);

            return (
              <Theme3ProductCard
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
        {totalCount > 4 ? (
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/45">
              Showing {visibleCount} of {totalCount} one-off pieces
            </p>
            {canLoadMore ? (
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-5 text-sm font-bold text-neutral-950 shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition hover:bg-white/88 sm:w-auto"
              >
                <span>Load more pieces</span>
                <span aria-hidden="true">-&gt;</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </>
      )}
    </section>
  );
}

function Theme3ProductDetail({
  fallbackIndex,
  isSaved,
  onClose,
  onToggleSaved,
  product,
  store,
  storeSlug,
}: {
  fallbackIndex: number;
  isSaved: boolean;
  onClose: () => void;
  onToggleSaved: (product: StorefrontProduct, fallbackIndex?: number) => void;
  product: StorefrontProduct;
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const images = getProductDetailImageUrls(product);
  const imageSlots = images.length ? images : [""];
  const title = getProductTitle(product);
  const price = getProductPrice(product);
  const description = getProductDescription(product);
  const productId = getProductId(product);
  const bookable = Boolean(productId && isBookable(product));
  const unavailableCtaLabel = getUnavailableCtaLabel(product);
  const checkoutHref = `/${storeSlug}/checkout/${productId}`;
  const paymentBreakdown = getStoreConfirmationAdvanceBreakdown({
    productPrice: price,
    store,
  });
  const stickyPaymentSubtext = getStorefrontPaymentSubtext(paymentBreakdown);
  const showBadge = hasExplicitAvailability(product);
  const badge = getProductBadge(product);

  return (
    <div className="fixed inset-0 z-50 box-border overflow-x-hidden overflow-y-auto bg-neutral-950/64 px-3 py-4 backdrop-blur-sm sm:py-6">
      <div
        aria-modal="true"
        role="dialog"
        aria-label={`${title} details`}
        className="mx-auto max-h-[calc(100vh-32px)] w-full max-w-4xl overflow-x-hidden overflow-y-auto rounded-[28px] border border-neutral-800 bg-neutral-950 text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
      >
        <div className="sticky top-0 z-10 flex min-w-0 items-center justify-between gap-3 border-b border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur">
          <p className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Drop details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/14 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-950"
          >
            Close
          </button>
        </div>

        <div className="grid min-w-0 max-w-full gap-4 overflow-x-hidden p-4 pb-28 sm:pb-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div className="grid min-w-0 max-w-full gap-2">
            <div className="aspect-square min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8">
              {imageSlots[0] ? (
                <img
                  src={imageSlots[0]}
                  alt={`${title} image 1`}
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  className="h-full w-full max-w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/34">
                  <ImageIcon size={28} aria-hidden="true" />
                </div>
              )}
            </div>

            {imageSlots.length > 1 ? (
              <div className="grid min-w-0 max-w-full grid-cols-2 gap-2">
                {imageSlots.slice(1, 3).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="aspect-square min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${title} image ${index + 2}`}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full max-w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/34">
                        <ImageIcon size={22} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <section className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/10 bg-neutral-900 p-5 text-white">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-[1_1_13rem]">
                <h2 className="break-words text-4xl font-semibold leading-[0.95] tracking-[-0.065em]">
                  {title}
                </h2>
                <p className="mt-3 text-2xl font-bold tracking-[-0.045em]">
                  {formatINR(price)}
                </p>
              </div>
              {showBadge ? (
                <div className="max-w-full shrink-0">
                  <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
                </div>
              ) : null}
              <button
                type="button"
                aria-label={isSaved ? "Remove saved item" : "Save item"}
                onClick={() => onToggleSaved(product, fallbackIndex)}
                className={`inline-flex min-h-9 max-w-full shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold uppercase tracking-[0.08em] ${
                  isSaved
                    ? "border-emerald-300 bg-emerald-300 text-neutral-950"
                    : "border-white/12 bg-neutral-950 text-white/70"
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

            {hasExplicitAvailability(product) ? (
              <p className="mt-4 max-w-full break-words rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium text-white/62">
                {bookable
                  ? "This item is available for verified booking."
                  : "This item is not currently bookable."}
              </p>
            ) : null}

            {description ? (
              <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-white/64">
                {description}
              </p>
            ) : null}

            <StorefrontPaymentBreakdown
              classes={{
                shell: "mt-6 min-w-0 max-w-full rounded-[20px] border border-white/10 bg-white/7 p-4 text-sm leading-6 text-white/64",
                icon: "grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-neutral-950",
                title: "text-base font-semibold leading-6 text-white",
                text: "mt-1 text-sm leading-6",
                panel: "mt-3 rounded-2xl border border-white/10 bg-neutral-950/55 p-3",
                eyebrow: "mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/34",
                rowLabel: "min-w-0 truncate text-xs",
                rowValue: "shrink-0 text-sm text-white",
                featuredValue: "shrink-0 text-base text-white",
                note: "mt-3 text-xs leading-5",
              }}
              productPrice={price}
              store={store}
            />

            <div className="mt-4">
              <PaymentTrustStrip compact variant="theme3" />
            </div>

            <div className="mt-5 hidden gap-3 sm:grid">
              {bookable ? (
                <Link
                  to={checkoutHref}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] !text-neutral-950 shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition hover:bg-white/90"
                >
                  <span>Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white/40"
                >
                  {unavailableCtaLabel}
                </button>
              )}
              <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white/48">
                <PptBrandIcon type="whatsapp" size={14} />
                Chat with seller after booking
              </p>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 w-full max-w-full overflow-hidden border-t border-white/10 bg-neutral-950/96 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                Product price
              </p>
              <p className="truncate text-lg font-bold tracking-[-0.04em] text-white">
                {formatINR(price)}
              </p>
            </div>
            {bookable ? (
              <Link
                to={checkoutHref}
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl bg-white px-3 text-xs font-bold uppercase tracking-[0.08em] !text-neutral-950 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
              >
                Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl border border-white/10 bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-white/40"
              >
                {unavailableCtaLabel}
              </button>
            )}
          </div>
          <p className="mt-2 break-words text-center text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
            {stickyPaymentSubtext}
          </p>
        </div>
      </div>
    </div>
  );
}

function Theme3DarkFooter({
  collections: managedCollections,
  store,
  storeSlug,
}: {
  collections?: StorefrontThemeProps["collections"];
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const contact = getStoreContactInfo(store);
  const currentYear = new Date().getFullYear();
  const policyLinks = getStorePolicyLinks(store);
  const aboutText = getStoreFooterSubheading(store);
  const collectionNames = getStoreFooterCollectionNames(managedCollections);
  const logoUrl = getStoreLogoUrl(store);
  const initials = getInitials(contact.displayName);

  return (
    <footer className="w-full overflow-hidden border-t border-white/10 bg-[#050507] text-sm leading-6 text-white/58">
      <div className="mx-auto w-full max-w-6xl border-b border-white/10 px-4 py-7 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/14 bg-white/8 text-base font-black text-white shadow-[0_18px_42px_rgba(255,255,255,0.06)]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${contact.displayName} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                initials || <StoreIcon size={20} aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/34">
                Seller Storefront
              </p>
              <h2 className="mt-1 break-words text-4xl font-black tracking-[-0.06em] text-white">
                {contact.displayName}
              </h2>
              <p className="mt-3 max-w-sm break-words font-medium text-white/58">
                {aboutText}
              </p>
            </div>
          </div>
          <Link
            to="/auth"
            className="w-fit rounded-full border border-white/12 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white/38 hover:border-white/24 hover:text-white"
          >
            Get your own store here
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-9 sm:px-5 lg:grid-cols-[1.05fr_0.9fr_1fr]">
        <section className="min-w-0">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/34">
            Collections
          </h3>
          <nav className="mt-3 flex flex-wrap gap-2">
            {collectionNames.length ? (
              collectionNames.map((collectionName) => (
                <a
                  key={collectionName}
                  href="#products"
                  className="max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-white/64 hover:border-white/20 hover:text-white"
                >
                  {collectionName}
                </a>
              ))
            ) : (
              <a href="#products" className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-white/64 hover:border-white/20 hover:text-white">
                All products
              </a>
            )}
          </nav>
        </section>

        <section className="min-w-0">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/34">
            Connect
          </h3>
          <div className="mt-3 grid gap-2 text-[0.95rem]">
            {contact.supportEmail ? (
              contact.supportEmailHref ? (
                <a href={contact.supportEmailHref} className="break-words text-white/58 hover:text-white">
                  {contact.supportEmail}
                </a>
              ) : (
                <span className="break-words text-white/58">{contact.supportEmail}</span>
              )
            ) : null}
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit max-w-full truncate text-white/58 hover:text-white"
              >
                {contact.instagramLabel}
              </a>
            ) : null}
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/34">
            Policies
          </h3>
          <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs font-black uppercase tracking-[0.08em]">
            {policyLinks.map((policy) => (
              <Link
                key={policy.type}
                to={`/${storeSlug}/policies/${policy.type}`}
                className="w-fit max-w-full break-words text-white/56 hover:text-white"
              >
                {policy.label}
              </Link>
            ))}
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-white/34">
            (c) {currentYear} {contact.displayName}. Powered by PayPerTap.
          </p>
        </section>
      </div>
    </footer>
  );
}

function Theme3Footer({
  collections: managedCollections,
  store,
  storeSlug,
}: {
  collections?: StorefrontThemeProps["collections"];
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const contact = getStoreContactInfo(store);
  const currentYear = new Date().getFullYear();
  const policyLinks = getStorePolicyLinks(store);
  const aboutText = getStoreFooterSubheading(store);
  const collectionNames = getStoreFooterCollectionNames(managedCollections);

  return (
    <footer className="w-full overflow-hidden border-t border-neutral-200 bg-white text-sm leading-6 text-neutral-600">
      <div className="mx-auto w-full max-w-6xl border-b border-neutral-200 px-4 py-5 sm:px-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
          About
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-4xl font-black tracking-[-0.06em] text-neutral-950">
              {contact.displayName}
            </h2>
            <p className="mt-3 max-w-sm break-words font-medium text-neutral-600">
              {aboutText}
            </p>
            <Link to="/auth" className="mt-3 block w-fit text-xs font-black uppercase tracking-[0.12em] text-neutral-400 hover:text-neutral-950">
              Get your own store here
            </Link>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
            © {currentYear} {contact.displayName}. Powered by PayPerTap.
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-9 sm:px-5 lg:grid-cols-[1.1fr_0.9fr_1fr]">
        <section className="min-w-0 text-sm leading-6 text-neutral-600">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
            Collections
          </h3>
          <nav className="mt-3 grid gap-2">
            {collectionNames.length ? (
              collectionNames.map((collectionName) => (
                <a
                  key={collectionName}
                  href="#products"
                  className="w-fit max-w-full break-words font-bold text-neutral-700 hover:text-neutral-950"
                >
                  {collectionName}
                </a>
              ))
            ) : (
              <a href="#products" className="w-fit max-w-full break-words font-bold text-neutral-700 hover:text-neutral-950">
                All products
              </a>
            )}
          </nav>
        </section>

        <section className="min-w-0 text-sm leading-6 text-neutral-600">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
            Connect
          </h3>
          <div className="mt-3 grid gap-2">
            {contact.supportEmail ? (
              contact.supportEmailHref ? (
                <a
                  href={contact.supportEmailHref}
                  className="break-words text-neutral-600"
                >
                  {contact.supportEmail}
                </a>
              ) : (
                <span className="break-words text-neutral-600">
                  {contact.supportEmail}
                </span>
              )
            ) : null}
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit max-w-full truncate text-neutral-600 hover:text-neutral-950"
              >
                {contact.instagramLabel}
              </a>
            ) : null}
          </div>
        </section>

        <section className="min-w-0 text-sm leading-6 text-neutral-600">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
            Policies
          </h3>
          <nav className="mt-3 grid gap-2">
            {policyLinks.map((policy) => (
              <Link
                key={policy.type}
                to={`/${storeSlug}/policies/${policy.type}`}
                className="w-fit max-w-full break-words font-bold text-neutral-700 hover:text-neutral-950"
              >
                {policy.label}
              </Link>
            ))}
          </nav>
        </section>

      </div>
    </footer>
  );
}

export default function Theme3({
  collections: managedCollections = [],
  isOwnerPreview,
  products,
  store,
  storeSlug,
}: StorefrontThemeProps) {
  const navigate = useNavigate();
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
    () => products.filter((product) => isVisibleProduct(product)),
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
  const handleProductSelect = (product: StorefrontProduct) => {
    if (isOwnerPreview) {
      setSelectedProduct(product);
      return;
    }

    const productId = getProductId(product);
    if (productId) {
      navigate(`/${storeSlug}/product/${productId}`);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-4 sm:px-5 sm:py-6">
        <Theme3DropHero store={store} />
        <PaymentTrustStrip showTrustRows={false} variant="theme3" />
        <Theme3ProductGrid
          collections={collections}
          getProductFallbackIndex={getProductFallbackIndex}
          isProductSaved={wishlist.isWishlisted}
          onCollectionChange={setActiveCollection}
          onSearchChange={setSearchQuery}
          onSelect={handleProductSelect}
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
      <Theme3DarkFooter collections={managedCollections} store={store} storeSlug={storeSlug} />

      {isOwnerPreview && selectedProduct ? (
        <Theme3ProductDetail
          fallbackIndex={selectedProductFallbackIndex}
          isSaved={wishlist.isWishlisted(selectedProduct, selectedProductFallbackIndex)}
          onToggleSaved={wishlist.toggleWishlistItem}
          product={selectedProduct}
          store={store}
          storeSlug={storeSlug}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </main>
  );
}
