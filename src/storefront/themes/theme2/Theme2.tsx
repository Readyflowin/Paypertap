import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ImageIcon,
  Search,
  ShieldCheck,
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

  return product.title || toText(flexibleProduct.name) || "Untitled item";
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
  if (getAvailableQuantity(product) === 1) return { label: "1 left", tone: "warning" as const };

  return { label: "Available", tone: "success" as const };
}

function getUnavailableCtaLabel(product: StorefrontProduct) {
  const status = getProductStatus(product);
  if (status === "hold" || status === "reserved") return "Currently reserved";
  return getProductUnavailableLabel(product);
}

function Theme2EditorialHero({ store }: { store: StorefrontThemeProps["store"] }) {
  const storeName = store.storeName || "PayPerTap Store";
  const initials = getInitials(storeName);
  const contact = getStoreContactInfo(store);
  const logoUrl = getStoreLogoUrl(store);
  const confirmationPolicyText = getStorefrontConfirmationPolicyText(store);

  return (
    <header className="relative overflow-hidden rounded-[34px] border border-[#e7ded4] bg-[#fffaf4] shadow-[0_22px_64px_rgba(78,61,43,0.09)]">
      <div className="grid min-w-0 gap-6 px-5 py-7 sm:px-8 sm:py-9 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)] md:items-end">
        <div className="min-w-0">
          <div className="mb-6 flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                decoding="async"
                fetchPriority="high"
                loading="eager"
                className="h-14 w-14 shrink-0 rounded-full border border-[#e4d9cd] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#171411] text-sm font-medium text-[#fffaf4]">
                {initials || <StoreIcon size={20} aria-hidden="true" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-[#d9cbbb] bg-white/80 px-3 py-1 text-xs font-medium text-[#443a32]">
                  Verified booking
                </span>
                {contact.instagramUrl ? (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#d9cbbb] bg-white/70 px-2.5 py-1 text-xs font-medium text-[#6f6257] hover:text-[#171411]"
                  >
                    <PptBrandIcon type="instagram" size={14} />
                    <span className="truncate">{contact.instagramLabel}</span>
                  </a>
                ) : null}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f7f6f]">
                Curated storefront
              </p>
            </div>
          </div>

          <h1 className="max-w-3xl break-words text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#171411] sm:text-6xl">
            {storeName}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#6f6257]">
            {getStoreTagline(store)}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#75695f]">
            {confirmationPolicyText}
          </p>
          <a
            href="#products"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#171411] px-5 text-sm font-medium !text-[#fffaf4] transition hover:bg-[#2a241f] min-[420px]:w-fit"
          >
            Browse the edit
          </a>
        </div>

        <div className="min-w-0 rounded-[24px] border border-[#e3d6c8] bg-[#f7efe6] p-4 text-sm text-[#6f6257]">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="flex min-w-0 items-start gap-3 rounded-[18px] border border-[#e7ded4] bg-[#fffaf4] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171411] text-[#fffaf4]">
                <ShieldCheck size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-medium text-[#171411]">
                  {formatINR(BOOKING_ADVANCE_AMOUNT)} booking via PayPerTap
                </p>
                <p className="mt-1 text-xs leading-5 text-[#8f7f6f]">
                  Your item is held after successful booking.
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-[18px] border border-[#e7ded4] bg-[#fffaf4] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171411] text-[#fffaf4]">
                <PptBrandIcon type="whatsapp" size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-medium text-[#171411]">
                  Continue on WhatsApp
                </p>
                <p className="mt-1 text-xs leading-5 text-[#8f7f6f]">
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

function Theme2Hero({ store }: { store: StorefrontThemeProps["store"] }) {
  const storeName = store.storeName || "PayPerTap Store";
  const initials = getInitials(storeName);
  const logoUrl = getStoreLogoUrl(store);
  const confirmationPolicyText = getStorefrontConfirmationPolicyText(store);

  return (
    <header className="relative overflow-hidden rounded-[34px] border border-[#e7ded4] bg-[#fffaf4] px-5 py-7 shadow-[0_20px_60px_rgba(78,61,43,0.08)] sm:px-8 sm:py-9">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                decoding="async"
                fetchPriority="high"
                loading="eager"
                className="h-14 w-14 shrink-0 rounded-full border border-[#e4d9cd] object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#171411] text-sm font-medium text-[#fffaf4]">
                {initials || <StoreIcon size={20} aria-hidden="true" />}
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-[#d9cbbb] bg-white/80 px-3 py-1 text-xs font-medium text-[#443a32]">
                Verified booking
              </span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f7f6f]">
                Powered by PayPerTap
              </p>
            </div>
          </div>

          <h1 className="max-w-3xl break-words text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#171411] sm:text-6xl">
            {storeName}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#6f6257]">
            {getStoreTagline(store)}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#e8ded2] bg-white/70 p-4 text-sm leading-6 text-[#6b5f55] sm:max-w-xs">
          <div className="mb-3 flex items-center gap-2 font-medium text-[#171411]">
            <ShieldCheck size={17} aria-hidden="true" />
            Verified booking via PayPerTap
          </div>
          {confirmationPolicyText}
        </div>
      </div>
    </header>
  );
}

function Theme2ProductCard({
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
  const bookable = isBookable(product);
  const ctaLabel = bookable
    ? `Book for ${formatINR(BOOKING_ADVANCE_AMOUNT)}`
    : "View details";

  return (
    <article className="relative min-w-0 overflow-hidden rounded-[24px] border border-[#e5dbcf] bg-[#fffdf9] shadow-[0_14px_38px_rgba(78,61,43,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(78,61,43,0.11)]">
      <button
        type="button"
        aria-label={isSaved ? "Remove saved item" : "Save item"}
        onClick={() => onToggleSaved(product, fallbackIndex)}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition ${
          isSaved
            ? "border-[#171411] bg-[#171411] text-[#fffaf4]"
            : "border-[#f6eadc]/80 bg-[#fffaf4]/90 text-[#6f6257] hover:text-[#171411]"
        }`}
      >
        <Heart size={15} aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="block h-full w-full text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eee5da]">
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#9a8c7f]">
              <ImageIcon size={24} aria-hidden="true" />
              <span className="text-xs font-medium">Product image</span>
            </div>
          )}
          <div className="absolute left-2 top-2">
            <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
          </div>
        </div>

        <div className="min-w-0 p-3">
          <h2 className="line-clamp-2 min-h-[40px] whitespace-normal break-words text-sm font-medium leading-5 tracking-[-0.015em] text-[#171411]">
            {title}
          </h2>
          <div className="mt-3 grid min-w-0 gap-2">
            <p className="min-w-0 text-base font-semibold tracking-[-0.035em] text-[#171411]">
              {formatINR(price)}
            </p>
            <span className="w-fit max-w-full rounded-full border border-[#d9cbbb] bg-[#fff4df] px-2 py-1 text-[10px] font-semibold text-[#6a4b26]">
              Limited Drop
            </span>
          </div>
          <span
            className={`mt-3 flex min-h-9 w-full items-center justify-center rounded-2xl px-2 text-center text-xs font-semibold ${
              bookable
                ? "bg-[#171411] text-[#fffaf4]"
                : "border border-[#dfd3c6] bg-[#f7efe6] text-[#6f6257]"
            }`}
          >
            {ctaLabel}
          </span>
        </div>
      </button>
    </article>
  );
}

function Theme2ProductGrid({
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
      <section className="rounded-[30px] border border-[#e7ded4] bg-[#fffaf4] p-8 text-center shadow-[0_18px_48px_rgba(78,61,43,0.06)]">
        <h2 className="text-2xl font-medium tracking-[-0.045em] text-[#171411]">
          No pieces listed yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#75695f]">
          This seller is getting their next drop ready.
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
      ? "Clear search or choose All to see more saved pieces."
      : "Tap the heart on a piece to save it for this browsing session."
    : hasSearch
    ? "Try another search or choose a different collection."
    : "Select All to view the full edit.";

  return (
    <section id="products">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f7f6f]">
            Current edit
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-[-0.05em] text-[#171411]">
            Available pieces
          </h2>
        </div>
        <p className="shrink-0 text-sm text-[#75695f]">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-3 flex min-w-0 items-center gap-2 rounded-[22px] border border-[#e7ded4] bg-[#fffaf4]/90 px-3 py-2 shadow-[0_12px_30px_rgba(78,61,43,0.04)] focus-within:border-[#bcae9f] focus-within:ring-2 focus-within:ring-[#eadfd3]">
        <Search size={16} aria-hidden="true" className="shrink-0 text-[#9a8b7c]" />
        <label className="sr-only" htmlFor="theme2-product-search">
          Search pieces
        </label>
        <input
          id="theme2-product-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search pieces"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#171411] outline-none placeholder:text-[#9a8b7c]"
        />
        {hasSearch ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfd3c6] text-[#6f6257] hover:border-[#171411] hover:text-[#171411]"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {showSearchPanel ? (
        <div className="mb-4 overflow-hidden rounded-[24px] border border-[#e7ded4] bg-[#fffaf4] shadow-[0_18px_44px_rgba(78,61,43,0.08)]">
          <div className="border-b border-[#eadfd3] px-3 py-2 text-xs font-medium text-[#8f7f6f]">
            Matching pieces
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
                    className="flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left transition hover:bg-[#f7efe6] focus:bg-[#f7efe6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#d8caba]"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        decoding="async"
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-2xl border border-[#eadfd3] object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadfd3] bg-white/70 text-[#9a8b7c]">
                        <ImageIcon size={17} aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 whitespace-normal break-words text-sm font-medium leading-5 text-[#171411]">
                        {title}
                      </p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8f7f6f]">
                        {price > 0 ? <span>{formatINR(price)}</span> : null}
                        {collectionName ? (
                          <span className="max-w-full truncate">{collectionName}</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[#171411]">Open</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-[#75695f]">
              {selectedCollection === ALL_COLLECTIONS
                ? "No results found"
                : "No results found in this collection"}
            </div>
          )}
          {hasMoreSearchResults ? (
            <p className="border-t border-[#eadfd3] px-3 py-2 text-xs text-[#8f7f6f]">
              Showing top results
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-3 flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSavedView}
          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
            showSavedOnly
              ? "border-[#171411] bg-[#171411] text-[#fffaf4]"
              : "border-[#dfd3c6] bg-[#fffaf4] text-[#6f6257] hover:border-[#cdbfac] hover:text-[#171411]"
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
        <p className="mb-3 text-xs font-medium text-[#8f7f6f]">
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
                className={`max-w-[190px] shrink-0 truncate rounded-full border px-3.5 py-2 text-xs font-medium ${
                  isActive
                    ? "border-[#171411] bg-[#171411] text-[#fffaf4]"
                    : "border-[#dfd3c6] bg-[#fffaf4] text-[#6f6257]"
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
        <section className="rounded-[30px] border border-[#e7ded4] bg-[#fffaf4] p-8 text-center shadow-[0_18px_48px_rgba(78,61,43,0.06)]">
          <h2 className="text-2xl font-medium tracking-[-0.045em] text-[#171411]">
            {emptyTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#75695f]">
            {emptyDescription}
          </p>
        </section>
        )
      ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const fallbackIndex = getProductFallbackIndex(product);

          return (
            <Theme2ProductCard
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

function Theme2ProductDetail({
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

  return (
    <div className="fixed inset-0 z-50 box-border overflow-x-hidden overflow-y-auto bg-[#171411]/50 px-3 py-4 backdrop-blur-sm sm:py-6">
      <div
        aria-modal="true"
        role="dialog"
        aria-label={`${title} details`}
        className="mx-auto max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-x-hidden overflow-y-auto rounded-[30px] border border-[#e7ded4] bg-[#fffaf4] shadow-[0_28px_90px_rgba(23,20,17,0.28)]"
      >
        <div className="sticky top-0 z-10 flex min-w-0 items-center justify-between gap-3 border-b border-[#eadfd3] bg-[#fffaf4]/96 px-4 py-3 backdrop-blur">
          <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#8f7f6f]">
            Item details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-[#dfd3c6] bg-white px-3 py-1.5 text-sm font-medium text-[#443a32]"
          >
            Close
          </button>
        </div>

        <div className="grid min-w-0 max-w-full gap-4 overflow-x-hidden p-4 pb-28 sm:pb-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start">
          <div className="grid min-w-0 max-w-full gap-2">
            <div className="aspect-[4/5] min-w-0 overflow-hidden rounded-[24px] bg-[#eee5da]">
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
                <div className="flex h-full w-full items-center justify-center text-[#9a8c7f]">
                  <ImageIcon size={24} aria-hidden="true" />
                </div>
              )}
            </div>
            {imageSlots.length > 1 ? (
              <div className="grid min-w-0 max-w-full grid-cols-2 gap-2">
                {imageSlots.slice(1, 3).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="aspect-square min-w-0 overflow-hidden rounded-2xl bg-[#eee5da]"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${title} detail ${index + 2}`}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full max-w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#9a8c7f]">
                        <ImageIcon size={20} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <section className="min-w-0 max-w-full overflow-hidden rounded-[26px] border border-[#e7ded4] bg-white/78 p-5">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-[1_1_12rem]">
                <h2 className="break-words text-3xl font-medium leading-none tracking-[-0.055em] text-[#171411]">
                  {title}
                </h2>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#171411]">
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
                    ? "border-[#171411] bg-[#171411] text-[#fffaf4]"
                    : "border-[#dfd3c6] bg-[#fffaf4] text-[#443a32]"
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
              <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-[#6f6257]">
                {description}
              </p>
            ) : null}

            <StorefrontPaymentBreakdown
              classes={{
                shell: "mt-6 min-w-0 max-w-full rounded-[22px] border border-[#e7ded4] bg-[#fffaf4] p-4 text-sm leading-6 text-[#6f6257]",
                icon: "grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-[#171411]",
                title: "text-base font-medium leading-6 text-[#171411]",
                text: "mt-1 text-sm leading-6",
                panel: "mt-3 rounded-2xl border border-[#e7ded4] bg-white/70 p-3",
                eyebrow: "mb-2 text-[11px] font-semibold uppercase text-[#8f7f6f]",
                rowLabel: "min-w-0 truncate text-xs",
                rowValue: "shrink-0 text-sm text-[#171411]",
                featuredValue: "shrink-0 text-base text-[#171411]",
                note: "mt-3 text-xs leading-5",
              }}
              productPrice={price}
              store={store}
            />

            <div className="mt-4">
              <PaymentTrustStrip compact variant="theme2" />
            </div>

            <div className="mt-5 hidden gap-3 sm:grid">
              {bookable ? (
                <Link
                  to={checkoutHref}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#171411] px-5 py-3 text-center text-sm font-medium !text-[#fffaf4] shadow-[0_14px_34px_rgba(23,20,17,0.18)] transition hover:bg-[#2a241f]"
                >
                  <span>Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}</span>
                </Link>
              ) : (
                <PptButton fullWidth size="lg" variant="secondary" disabled>
                  {unavailableCtaLabel}
                </PptButton>
              )}
              <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-[#8f7f6f]">
                <PptBrandIcon type="whatsapp" size={14} />
                Chat with seller after booking.
              </p>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 w-full max-w-full overflow-hidden border-t border-[#eadfd3] bg-[#fffaf4]/96 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <div className="flex min-w-0 max-w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#8f7f6f]">
                Product price
              </p>
              <p className="truncate text-lg font-semibold tracking-[-0.035em] text-[#171411]">
                {formatINR(price)}
              </p>
            </div>
            {bookable ? (
              <Link
                to={checkoutHref}
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl bg-[#171411] px-3 text-sm font-medium !text-[#fffaf4] shadow-[0_12px_28px_rgba(23,20,17,0.18)]"
              >
                Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl border border-[#dfd3c6] bg-[#f4eadf] px-3 text-sm font-medium text-[#9a8b7c]"
              >
                {unavailableCtaLabel}
              </button>
            )}
          </div>
          <p className="mt-2 break-words text-center text-xs font-medium text-[#8f7f6f]">
            {stickyPaymentSubtext}
          </p>
        </div>
      </div>
    </div>
  );
}

function Theme2Footer({
  collections: managedCollections,
  store,
}: {
  collections?: StorefrontThemeProps["collections"];
  store: StorefrontThemeProps["store"];
}) {
  const contact = getStoreContactInfo(store);
  const currentYear = new Date().getFullYear();
  const policyLinks = getStorePolicyLinks(store);
  const collectionNames = getStoreFooterCollectionNames(managedCollections);
  const footerLine = getStoreFooterSubheading(store);
  const logoUrl = getStoreLogoUrl(store);
  const initials = getInitials(contact.displayName);

  return (
    <footer className="overflow-hidden rounded-[30px] border border-[#e7ded4] bg-[#fffaf4] text-sm leading-7 text-[#6f6257] shadow-[0_18px_48px_rgba(78,61,43,0.06)]">
      <div className="flex flex-col gap-4 border-b border-[#eadfd3] px-5 py-6 sm:px-7 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#e4d6c7] bg-white text-base font-semibold text-[#171411] shadow-[0_10px_28px_rgba(78,61,43,0.08)]">
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a28d78]">
              Seller Storefront
            </p>
            <h2 className="mt-1 break-words text-3xl font-medium tracking-[-0.055em] text-[#171411]">
              {contact.displayName}
            </h2>
            <p className="mt-2 max-w-xl break-words text-[#8f7f6f]">{footerLine}</p>
          </div>
        </div>
        <Link
          to="/auth"
          className="w-fit rounded-full border border-[#dfd0bf] bg-white/70 px-3 py-1 text-xs font-semibold text-[#8f7f6f] hover:border-[#bfa98f] hover:text-[#171411]"
        >
          Get your own store here
        </Link>
        <p className="hidden text-xs font-medium text-[#8f7f6f]">
          © {currentYear} {contact.displayName}. Powered by PayPerTap.
        </p>
      </div>

      <div className="grid gap-0 divide-y divide-[#eadfd3] px-5 py-5 sm:px-7 md:grid-cols-[1fr_0.9fr_1.05fr] md:divide-x md:divide-y-0">
        <section className="min-w-0 pb-5 md:pb-0 md:pr-6">
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a28d78]">
            Collections
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {collectionNames.length ? (
              collectionNames.map((collectionName) => (
                <a key={collectionName} href="#products" className="max-w-full rounded-full border border-[#eadfd3] bg-white/70 px-3 py-1 text-xs font-semibold text-[#5f5044] hover:border-[#cdbba7] hover:text-[#171411]">
                  {collectionName}
                </a>
              ))
            ) : (
              <a href="#products" className="w-fit rounded-full border border-[#eadfd3] bg-white/70 px-3 py-1 text-xs font-semibold text-[#5f5044] hover:border-[#cdbba7] hover:text-[#171411]">
                All products
              </a>
            )}
          </div>
        </section>

        <section className="min-w-0 py-5 md:px-6 md:py-0">
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a28d78]">
            Connect
          </h3>
          <div className="mt-3 grid gap-2 text-[0.95rem]">
            {contact.supportEmail ? (
              contact.supportEmailHref ? (
                <a href={contact.supportEmailHref} className="break-words text-[#5f5044] hover:text-[#171411]">
                  {contact.supportEmail}
                </a>
              ) : (
                <span className="break-words text-[#5f5044]">{contact.supportEmail}</span>
              )
            ) : null}
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit max-w-full truncate text-[#5f5044] hover:text-[#171411]"
              >
                {contact.instagramLabel}
              </a>
            ) : null}
          </div>
        </section>

        <section className="min-w-0 pt-5 md:pl-6 md:pt-0">
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#a28d78]">
            Store policies
          </h3>
          <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold">
            {policyLinks.map((policy) => (
              <Link
                key={policy.type}
                to={`/${store.storeSlug || store.storeId}/policies/${policy.type}`}
                className="w-fit max-w-full break-words text-[#6f6257] hover:text-[#171411]"
              >
                {policy.label}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-xs font-medium text-[#a28d78]">
            (c) {currentYear} {contact.displayName}. Powered by PayPerTap.
          </p>
        </section>
      </div>
    </footer>
  );
}

export default function Theme2({
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5eee6] px-3 py-4 text-[#171411] sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <Theme2EditorialHero store={store} />
        <PaymentTrustStrip showTrustRows={false} variant="theme2" />
        <Theme2ProductGrid
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
        <Theme2Footer collections={managedCollections} store={store} />
      </div>

      {isOwnerPreview && selectedProduct ? (
        <Theme2ProductDetail
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
