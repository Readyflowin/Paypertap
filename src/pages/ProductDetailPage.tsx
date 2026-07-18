import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  ImageIcon,
  Info,
  LockKeyhole,
  Maximize2,
  MessageCircle,
  Package,
  RotateCcw,
  Ruler,
  Share2,
  Sparkles,
  Store as StoreIcon,
  Truck,
  X,
} from "lucide-react";

import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptTapLoader,
  type PptTone,
} from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatINR } from "@/lib/money";
import {
  getAvailableQuantity,
  getProductUnavailableLabel,
  isProductBookable,
} from "@/lib/productAvailability";
import {
  getProductById,
  getPublicProductById,
  getPublicProductsByStoreId,
  getSellerProductsForStore,
} from "@/services/productService";
import { getPublicStoreShellData } from "@/services/publicStoreService";
import { Theme1EditorialFooter } from "@/storefront/themes/theme1/Theme1Footer";
import { Theme1Header } from "@/storefront/themes/theme1/Theme1Header";
import {
  Theme1ProductCard,
  getTheme1ProductCardKey,
} from "@/storefront/themes/theme1/Theme1ProductCard";
import {
  getProductDetailImageUrls,
} from "@/storefront/imageMedia";
import { useStorefrontWishlist } from "@/storefront/useStorefrontWishlist";
import { getDisplayImageUrl } from "@/lib/imageUrls";
import { generateReturnsPolicy } from "@/storefront/storePolicies";
import {
  getAvailableOptions,
  getSelectedVariant,
  isVariantAvailable,
  normalizeVariantOptions,
  productHasVariants,
  validateSelectedVariant,
} from "@/lib/productVariants";
import type { Product, Store } from "@/types/firestore";

type PageThemeId = "theme1";

type PageState = {
  store: Store | null;
  product: Product | null;
  products: Product[];
  isOwnerPreview: boolean;
  loading: boolean;
  error: string;
};

type ThemeClasses = {
  main: string;
  back: string;
  mediaPanel: string;
  imageSurface: string;
  emptyImage: string;
  thumb: string;
  infoPanel: string;
  eyebrow: string;
  title: string;
  price: string;
  muted: string;
  OrderBox: string;
  Orderstrong: string;
  primaryCta: string;
  disabledCta: string;
  sticky: string;
  storePanel: string;
  storeLogo: string;
};

const themeClasses: Record<PageThemeId, ThemeClasses> = {
  theme1: {
    main: "bg-[#fffdfa] text-[#111111]",
    back: "text-[#60646c] hover:text-[#111111]",
    mediaPanel: "bg-[#f3f1ed]",
    imageSurface: "bg-[#f3f1ed]",
    emptyImage: "text-[#60646c]",
    thumb: "border-[#e5e7eb] bg-[#f1f2f4]",
    infoPanel: "bg-[#fffdfa]",
    eyebrow: "text-[#8d867d]",
    title: "text-[#111111]",
    price: "text-[#111111]",
    muted: "text-[#60646c]",
    OrderBox: "border-[#e5e7eb] bg-[#f7f7f8] text-[#60646c]",
    Orderstrong: "text-[#111111]",
    primaryCta: "bg-[#111111] !text-white hover:bg-[#2b2926]",
    disabledCta: "border-[#e5e7eb] bg-[#f1f2f4] text-[#8b9099]",
    sticky: "border-[#e5e7eb] bg-white/96 text-[#111111]",
    storePanel: "border-[#e5e7eb] bg-white text-[#60646c]",
    storeLogo: "border-[#e5e7eb] bg-[#111111] text-white",
  },
};

function getSelectedThemeId(store: Store): PageThemeId {
  void store;
  return "theme1";
}

function getStoreInstagramUrl(store: Store): string {
  const maybeStore = store as Store & {
    instagramUrl?: string;
    instagramHandle?: string;
    instagram?: string;
    socialLinks?: { instagram?: string };
  };

  if (maybeStore.instagramUrl) return maybeStore.instagramUrl;
  if (maybeStore.instagramHandle) {
    return `https://instagram.com/${maybeStore.instagramHandle.replace(/^@+/, "")}`;
  }

  return maybeStore.instagram || maybeStore.socialLinks?.instagram || "";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getStatusBadge(product: Product, isReserved: boolean): { label: string; tone: PptTone } {
  if (product.status === "sold") return { label: "Sold out", tone: "sold" };
  if (isReserved) return { label: "Reserved", tone: "reserved" };
  if (product.status === "open" && getAvailableQuantity(product) <= 0) {
    return { label: "Unavailable", tone: "neutral" };
  }
  if (product.status === "open") return { label: "Available", tone: "success" };
  return { label: "Unavailable", tone: "neutral" };
}

function getProductKey(product: Product) {
  return product.productId || product.id || product.title;
}

function getStableExploreScore(product: Product, seed: string) {
  const source = `${seed}:${getProductKey(product)}:${product.title}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 1000003;
  }

  return hash;
}

function getExploreProducts(products: Product[], currentProduct: Product, storeSlug: string) {
  const currentProductKey = getProductKey(currentProduct);

  return products
    .filter((product) => getProductKey(product) !== currentProductKey)
    .sort(
      (left, right) =>
        getStableExploreScore(left, storeSlug) - getStableExploreScore(right, storeSlug)
    )
    .slice(0, 4);
}

function toOptionalText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSizeChartImageUrl(product: Product, store: Store) {
  const productWithSizeChart = product as Product & {
    sizeChart?: { imageUrl?: unknown; url?: unknown };
    sizeChartImage?: unknown;
    sizeChartImageUrl?: unknown;
    sizeChartUrl?: unknown;
  };
  const storeWithSizeChart = store as Store & {
    sizeChart?: { imageUrl?: unknown; url?: unknown };
    sizeChartImage?: unknown;
    sizeChartImageUrl?: unknown;
    sizeChartUrl?: unknown;
  };

  return (
    getDisplayImageUrl(productWithSizeChart.sizeChartImageUrl) ||
    getDisplayImageUrl(productWithSizeChart.sizeChartImage) ||
    getDisplayImageUrl(productWithSizeChart.sizeChartUrl) ||
    getDisplayImageUrl(productWithSizeChart.sizeChart?.imageUrl) ||
    getDisplayImageUrl(productWithSizeChart.sizeChart?.url) ||
    getDisplayImageUrl(storeWithSizeChart.sizeChartImageUrl) ||
    getDisplayImageUrl(storeWithSizeChart.sizeChartImage) ||
    getDisplayImageUrl(storeWithSizeChart.sizeChartUrl) ||
    getDisplayImageUrl(storeWithSizeChart.sizeChart?.imageUrl) ||
    getDisplayImageUrl(storeWithSizeChart.sizeChart?.url)
  );
}

function getProductCareInstructions(product: Product) {
  const productWithCare = product as Product & {
    careInstructions?: unknown;
    careNotes?: unknown;
    washingInstructions?: unknown;
  };

  return (
    toOptionalText(productWithCare.careInstructions) ||
    toOptionalText(productWithCare.careNotes) ||
    toOptionalText(productWithCare.washingInstructions) ||
    "Handle gently and follow the seller's care guidance after confirmation."
  );
}

function getProductSellerNotes(product: Product) {
  const productWithNotes = product as Product & {
    publicNotes?: unknown;
    sellerNotes?: unknown;
    notes?: unknown;
  };

  return (
    toOptionalText(productWithNotes.publicNotes) ||
    toOptionalText(productWithNotes.sellerNotes) ||
    toOptionalText(productWithNotes.notes) ||
    "The seller will confirm final availability, payment, and delivery details after you place the order."
  );
}

function getCssColor(value: string): string | null {
  const color = value.trim().toLocaleLowerCase();
  const knownColors: Record<string, string> = {
    black: "#111827",
    white: "#ffffff",
    blue: "#2563eb",
    navy: "#1e3a8a",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#facc15",
    pink: "#ec4899",
    purple: "#7c3aed",
    grey: "#6b7280",
    gray: "#6b7280",
    brown: "#92400e",
    beige: "#d6c7a1",
    cream: "#f5f5dc",
    orange: "#f97316",
  };

  return knownColors[color] || null;
}

function ProductVariantSelector({
  classes,
  hasError,
  onChange,
  product,
  selectedOptions,
}: {
  classes: ThemeClasses;
  hasError: boolean;
  onChange: (options: Record<string, string>) => void;
  product: Product;
  selectedOptions: Record<string, string>;
}) {
  const optionGroups = normalizeVariantOptions(product.variantOptions);
  const availableOptions = getAvailableOptions(product, selectedOptions);
  const selectedVariant = getSelectedVariant(product, selectedOptions);
  const validation = validateSelectedVariant(product, selectedOptions);
  const hasCompleteSelection = optionGroups.every((option) => selectedOptions[option.name]);
  const showUnavailableMessage =
    hasCompleteSelection && (!selectedVariant || !isVariantAvailable(selectedVariant));

  if (!productHasVariants(product)) return null;

  return (
    <section
      className={`mt-8 grid min-w-0 gap-6 transition ${
        hasError ? "ring-2 ring-amber-400/70 ring-offset-2" : ""
      }`}
    >
      {optionGroups.map((option) => {
        const isColor = option.name.toLocaleLowerCase() === "color";

        return (
          <div key={option.name} className="min-w-0">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <p className={`text-xs font-semibold ${classes.title}`}>
                {option.name}
              </p>
              {selectedOptions[option.name] ? (
                <span className={`truncate text-xs ${classes.muted}`}>
                  {selectedOptions[option.name]}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-wrap gap-2.5">
              {option.values.map((value) => {
                const cssColor = isColor ? getCssColor(value) : null;
                const isSelected = selectedOptions[option.name] === value;
                const isAvailable = availableOptions[option.name]?.has(value) ?? false;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable}
                    title={value}
                    aria-label={`${option.name}: ${value}`}
                    aria-pressed={isSelected}
                    onClick={() =>
                      onChange({
                        ...selectedOptions,
                        [option.name]: value,
                      })
                    }
                    className={
                      isColor
                        ? `grid h-11 w-11 place-items-center rounded-full border bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] ${
                            isSelected
                              ? "border-[#111111] ring-2 ring-[#111111] ring-offset-2"
                              : "border-[#dfd8cf] hover:border-[#111111]"
                          } ${!isAvailable ? "cursor-not-allowed opacity-35" : ""}`
                        : `inline-flex min-h-12 min-w-12 max-w-full items-center justify-center rounded-full border px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] ${
                            isSelected
                              ? classes.primaryCta
                              : "border-[#e5ded4] bg-white text-[#2f2b27] hover:border-[#111111]"
                          } ${!isAvailable ? "cursor-not-allowed opacity-45 line-through" : ""}`
                    }
                  >
                    {isColor ? (
                      <span
                        className="h-8 w-8 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: cssColor || "#f3f1ed" }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="truncate">{value}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {showUnavailableMessage || (!validation.isValid && hasCompleteSelection) ? (
        <p className={`rounded-2xl border px-4 py-3 text-sm ${classes.OrderBox}`}>
          This option is not available
        </p>
      ) : null}
    </section>
  );
}

function ProductImageGallery({
  classes,
  imageUrls,
  product,
}: {
  classes: ThemeClasses;
  imageUrls: string[];
  product: Product;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const galleryImages = (imageUrls.length ? imageUrls : [""]).slice(0, 3);
  const activeImage = galleryImages[activeIndex] || "";

  function goToImage(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(nextIndex, galleryImages.length - 1));
    setActiveIndex(safeIndex);
    scrollerRef.current?.scrollTo({
      left: scrollerRef.current.clientWidth * safeIndex,
      behavior: "smooth",
    });
  }

  return (
    <>
      <section className={`min-w-0 ${classes.mediaPanel}`}>
        <div
          ref={scrollerRef}
          className={`relative flex aspect-[4/5] min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth ${classes.imageSurface} [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          onScroll={(event) => {
            const target = event.currentTarget;
            const nextIndex = Math.round(target.scrollLeft / Math.max(target.clientWidth, 1));
            setActiveIndex(Math.max(0, Math.min(nextIndex, galleryImages.length - 1)));
          }}
          style={{
            touchAction: "pan-x pan-y pinch-zoom",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          {galleryImages.map((imageUrl, index) => (
            <div
              key={`${imageUrl || "empty"}-${index}`}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {imageUrl ? (
                <button
                  type="button"
                  aria-label={`Open ${product.title} image ${index + 1} fullscreen`}
                  onClick={() => {
                    setActiveIndex(index);
                    setZoomOpen(true);
                  }}
                  className="group block h-full w-full bg-[#f3f1ed]"
                >
                  <img
                    src={imageUrl}
                    alt={product.images?.[index]?.alt || `${product.title} image ${index + 1}`}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                </button>
              ) : (
                <div className={`flex h-full flex-col items-center justify-center gap-2 ${classes.emptyImage}`}>
                  <ImageIcon size={32} />
                  <span className="text-sm font-medium">Product image</span>
                </div>
              )}
              {imageUrl && index === activeIndex ? (
                <button
                  type="button"
                  aria-label="Zoom product image"
                  onClick={() => setZoomOpen(true)}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/86 text-[#111111] shadow-lg backdrop-blur transition hover:bg-white"
                >
                  <Maximize2 size={17} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {galleryImages.length > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Product image pagination">
            {galleryImages.map((imageUrl, index) => (
              <button
                key={`${imageUrl || "dot"}-${index}`}
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goToImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-[#111111]" : "w-1.5 bg-[#c9c1b5]"
                }`}
              />
            ))}
          </div>
        ) : null}

        {galleryImages.length > 1 ? (
          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#8d867d]">
            Swipe to view
          </p>
        ) : null}
      </section>

      {zoomOpen && activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.title} image preview`}
          className="fixed inset-0 z-[80] grid place-items-center bg-[#111111]/92 p-3"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            onClick={() => setZoomOpen(false)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#111111] shadow-xl"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <img
            src={activeImage}
            alt={product.images?.[activeIndex]?.alt || `${product.title} image ${activeIndex + 1}`}
            decoding="async"
            className="max-h-[88vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
            style={{ touchAction: "pinch-zoom" }}
          />
        </div>
      ) : null}
    </>
  );
}
function SizeChartPanel({
  imageUrl,
  productTitle,
}: {
  imageUrl: string;
  productTitle: string;
}) {
  const [open, setOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <section className="border-t border-[#ece7df]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-16 w-full items-center justify-between gap-3 py-1 text-left"
      >
        <span className="inline-flex items-center gap-2 text-base font-medium text-[#111111]">
          <Ruler size={17} aria-hidden="true" />
          Size Guide
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5">
            <img
              src={imageUrl}
              alt={`${productTitle} size chart`}
              loading="lazy"
              decoding="async"
              className="max-h-[420px] w-full bg-[#f7f4ef] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type ProductInfoSectionKey =
  | "description"
  | "details"
  | "shippingReturns"
  | "orderProcess"
  | "policies";

function ProductInfoAccordions({
  product,
  store,
}: {
  product: Product;
  store: Store;
}) {
  const [openSection, setOpenSection] = useState<ProductInfoSectionKey | null>(null);
  const sections: Array<{
    body: string;
    icon: typeof Info;
    key: ProductInfoSectionKey;
    title: string;
  }> = [
    {
      key: "description",
      title: "Description",
      icon: Info,
      body: product.description || "Product details will be confirmed by the seller.",
    },
    {
      key: "details",
      title: "Product Details",
      icon: Sparkles,
      body: [
        product.category ? `Category: ${product.category}` : "",
        `Availability: ${getAvailableQuantity(product)} available`,
        `Care: ${getProductCareInstructions(product)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      key: "shippingReturns",
      title: "Shipping & Returns",
      icon: Truck,
      body: [
        "Delivery, pickup, or courier details are confirmed directly by the seller after you place the order.",
        generateReturnsPolicy(store),
      ].join("\n\n"),
    },
    {
      key: "orderProcess",
      title: "Order Process",
      icon: BadgeCheck,
      body: getProductSellerNotes(product),
    },
    {
      key: "policies",
      title: "Store Policies",
      icon: StoreIcon,
      body: "The seller confirms payment, delivery, and product availability directly. PayPerTap records the order details so both sides have a clean handoff.",
    },
  ];

  return (
    <section className="mt-8 border-b border-[#ece7df]">
      {sections.map((section) => {
        const isOpen = openSection === section.key;
        const Icon = section.icon;

        return (
          <div key={section.key} className="border-t border-[#ece7df]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenSection(isOpen ? null : section.key)}
              className="flex min-h-16 w-full items-center justify-between gap-3 py-1 text-left"
            >
              <span className="inline-flex items-center gap-2 text-base font-medium text-[#111111]">
                <Icon size={17} aria-hidden="true" />
                {section.title}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`transition ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-all duration-200 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl whitespace-pre-line pb-5 text-sm leading-7 text-[#60646c]">
                  {section.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ProductTrustSection() {
  const items = [
    { label: "Verified Order", icon: BadgeCheck },
    { label: "WhatsApp Confirmation", icon: MessageCircle },
    { label: "Easy Checkout", icon: LockKeyhole },
    { label: "Seller Support", icon: StoreIcon },
    { label: "Secure Ordering", icon: LockKeyhole },
    { label: "Returns Policy", icon: RotateCcw },
  ];

  return (
    <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#ece7df] py-5 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f1ed] text-[#111111]">
              <Icon size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 text-xs font-semibold leading-4 text-[#3d3934]">
              {item.label}
            </span>
          </div>
        );
      })}
    </section>
  );
}

function ProductDetailLoading() {
  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#f7f7f8] px-4 py-8">
      <PptTapLoader
        title="Loading product..."
        description="Checking availability and order details."
      />
    </main>
  );
}

function StoreMiniBlock({
  classes,
  store,
  storeSlug,
}: {
  classes: ThemeClasses;
  store: Store;
  storeSlug: string;
}) {
  const instagramUrl = getStoreInstagramUrl(store);
  const logoUrl = getDisplayImageUrl(store.logoUrl || store.storeLogoUrl);
  const [shared, setShared] = useState(false);

  async function shareStore() {
    const shareUrl = `${window.location.origin}/${storeSlug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: store.storeName,
          text: store.tagline || store.bio || "Explore this PayPerTap store.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard?.writeText(shareUrl);
      }

      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Store sharing is a convenience action.
    }
  }

  return (
    <section className={`min-w-0 py-8 ${classes.storePanel}`}>
      <div className="flex min-w-0 items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${store.storeName} logo`}
            decoding="async"
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${classes.storeLogo}`}
          >
            {getInitials(store.storeName) || <StoreIcon size={18} />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <strong className={`block truncate text-sm font-semibold ${classes.title}`}>
            {store.storeName}
          </strong>
          <span className={`mt-1 block line-clamp-1 text-xs ${classes.muted}`}>
            {store.tagline || store.bio || "Fresh drops, limited pieces."}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/${storeSlug}`}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#e5ded4] px-4 text-sm font-semibold !text-[#111111]"
        >
          Back to store
        </Link>
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e5ded4] px-4 text-sm font-semibold !text-[#111111]"
          >
            <PptBrandIcon type="instagram" size={16} />
            Instagram
          </a>
        ) : null}
        <button
          type="button"
          onClick={shareStore}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e5ded4] px-4 text-sm font-semibold text-[#111111]"
        >
          <Share2 size={15} aria-hidden="true" />
          {shared ? "Copied" : "Share Store"}
        </button>
      </div>
    </section>
  );
}

function ExploreMoreProducts({
  getProductFallbackIndex,
  isProductSaved,
  onProductSelect,
  onToggleProductSaved,
  products,
}: {
  getProductFallbackIndex: (product: Product) => number;
  isProductSaved: (product: Product, fallbackIndex?: number) => boolean;
  onProductSelect: (product: Product) => void;
  onToggleProductSaved: (product: Product, fallbackIndex?: number) => void;
  products: Product[];
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-0">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
            Keep browsing
          </p>
          <h2
            className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            Explore More Products
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
        {products.map((product) => {
          const fallbackIndex = getProductFallbackIndex(product);

          return (
            <Theme1ProductCard
              key={getTheme1ProductCardKey(product)}
              fallbackIndex={fallbackIndex}
              isSaved={isProductSaved(product, fallbackIndex)}
              onSelect={onProductSelect}
              onToggleSaved={onToggleProductSaved}
              product={product}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { storeSlug = "", productId = "" } = useParams();
  const { user } = useAuthUser();
  const [state, setState] = useState<PageState>({
    store: null,
    product: null,
    products: [],
    isOwnerPreview: false,
    loading: true,
    error: "",
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [variantError, setVariantError] = useState("");
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);
  const mobileCtaAnchorRef = useRef<HTMLDivElement | null>(null);
  const variantSelectorRef = useRef<HTMLDivElement | null>(null);
  const wishlist = useStorefrontWishlist({
    isPreview: state.isOwnerPreview,
    storeId: state.store?.storeId || "",
    storeSlug,
  });
  const exploreProducts = useMemo(
    () =>
      state.product
        ? getExploreProducts(state.products, state.product, storeSlug)
        : [],
    [state.product, state.products, storeSlug]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setState((current) => ({ ...current, loading: true, error: "" }));

        const [storeData, publicProduct] = await Promise.all([
          getPublicStoreShellData(storeSlug, user?.uid),
          getPublicProductById(productId),
        ]);

        if (!storeData) {
          throw new Error("Product not found");
        }

        const product =
          storeData.isOwnerPreview && !publicProduct
            ? await getProductById(productId)
            : publicProduct;

        if (!product || product.storeId !== storeData.store.storeId) {
          throw new Error("Product not found");
        }

        const products = await (
          storeData.isOwnerPreview && user?.uid
            ? getSellerProductsForStore(user.uid, storeData.store.storeId)
            : getPublicProductsByStoreId(storeData.store.storeId)
        ).catch((error) => {
          console.warn("Product detail related products failed:", error);
          return [product];
        });

        if (!cancelled) {
          setSelectedOptions({});
          setVariantError("");
          setState({
            store: storeData.store,
            product,
            products,
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
            products: [],
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
  }, [productId, storeSlug, user?.uid]);

  useEffect(() => {
    setShowMobileStickyCta(false);
  }, [productId]);

  useEffect(() => {
    const node = mobileCtaAnchorRef.current;

    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileStickyCta(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [productId, state.loading]);

  if (state.loading) {
    return <ProductDetailLoading />;
  }

  if (state.error || !state.store || !state.product) {
    return (
      <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#f7f7f8] px-4 py-8">
        <PptEmptyState
          title="Product not available"
          description="This product may be sold out or unpublished."
          icon={<Package size={22} />}
          action={
            <PptButton
              variant="secondary"
              icon={<ArrowLeft size={17} />}
              onClick={() => navigate(`/${storeSlug}`)}
            >
              Back to store
            </PptButton>
          }
        />
      </main>
    );
  }

  const { store, product, isOwnerPreview } = state;
  const themeId = getSelectedThemeId(store);
  const classes = themeClasses[themeId];
  const imageUrls = getProductDetailImageUrls(product);
  const sizeChartImageUrl = getSizeChartImageUrl(product, store);
  const availableQuantity = getAvailableQuantity(product);
  const isAvailable = store.isPublished && isProductBookable(product) && !isOwnerPreview;
  const isSoldOut = product.status === "sold";
  const isReserved =
    product.status === "hold" || (availableQuantity <= 0 && product.reservedQuantity > 0);
  const checkoutHref = `/${storeSlug}/checkout/${product.productId || product.id}`;
  const statusBadge = getStatusBadge(product, isReserved);
  const unavailableLabel = isOwnerPreview
    ? "Preview only"
    : isSoldOut
      ? "Sold out"
      : isReserved
        ? "Currently reserved"
      : getProductUnavailableLabel(product);
  const orderCtaLabel = "Buy now";

  function handleTheme1ChromeProductSelect(nextProduct: Product) {
    const nextProductId = nextProduct.productId || nextProduct.id;
    if (nextProductId) {
      navigate(`/${storeSlug}/product/${nextProductId}`);
    }
  }

  function handleBook() {
    if (!isAvailable) return;

    const validation = validateSelectedVariant(product, selectedOptions);

    if (!validation.isValid) {
      const message = productHasVariants(product)
        ? "Please select size and color first."
        : validation.message || "Please select an available option.";
      setVariantError(message);
      window.requestAnimationFrame(() => {
        variantSelectorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    const nextHref =
      validation.variant
        ? `${checkoutHref}?variantId=${encodeURIComponent(validation.variant.variantId)}`
        : checkoutHref;

    navigate(nextHref);
  }

  function getProductFallbackIndex(nextProduct: Product) {
    return Math.max(0, state.products.indexOf(nextProduct));
  }

  return (
    <>
      <Theme1Header
        onProductSelect={handleTheme1ChromeProductSelect}
        products={state.products.length ? state.products : [product]}
        store={store}
        storeSlug={storeSlug}
      />
      <main className={`min-h-screen overflow-x-hidden pb-28 sm:pb-10 ${classes.main}`}>
        <section className="mx-auto w-full max-w-6xl">
          <div className="px-4 py-4 sm:px-0">
            <Link
              to={`/${storeSlug}`}
              className={`inline-flex items-center gap-2 text-sm font-medium transition ${classes.back}`}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to store
            </Link>
          </div>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start lg:gap-12">
            <ProductImageGallery
              classes={classes}
              imageUrls={imageUrls}
              product={product}
            />

            <section className={`min-w-0 px-4 sm:px-0 lg:sticky lg:top-6 ${classes.infoPanel}`}>
              {isOwnerPreview ? (
                <div className={`mb-5 rounded-2xl border p-3 text-sm ${classes.OrderBox}`}>
                  Owner preview. Checkout is disabled until this store is published.
                </div>
              ) : null}

              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {product.category ? <PptBadge tone="primary">{product.category}</PptBadge> : null}
                <PptBadge tone={statusBadge.tone}>{statusBadge.label}</PptBadge>
              </div>

              <h1 className={`mt-5 break-words text-4xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-5xl ${classes.title}`}>
                {product.title}
              </h1>
              <p className={`mt-4 text-3xl font-semibold tracking-[-0.04em] ${classes.price}`}>
                {formatINR(product.price)}
              </p>
              <p className={`mt-2 text-sm leading-6 ${classes.muted}`}>
                {availableQuantity > 0
                  ? `${availableQuantity} available`
                  : isReserved
                    ? "Currently reserved"
                    : "Unavailable"}
              </p>
              {product.description ? (
                <p className={`mt-5 max-w-xl text-base leading-7 ${classes.muted}`}>
                  {product.description}
                </p>
              ) : null}

              <div ref={variantSelectorRef}>
                <ProductVariantSelector
                  classes={classes}
                  hasError={Boolean(variantError)}
                  product={product}
                  selectedOptions={selectedOptions}
                  onChange={(nextOptions) => {
                    setSelectedOptions(nextOptions);
                    setVariantError("");
                  }}
                />
              </div>

              {variantError ? (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  {variantError}
                </p>
              ) : null}

              {!isAvailable ? (
                <p className="mt-4 rounded-2xl bg-[#f3f1ed] px-4 py-3 text-sm leading-6 text-[#6f6b64]">
                  {isReserved
                    ? "This item is currently reserved."
                    : "This item is not currently available for ordering."}
                </p>
              ) : null}

              <div ref={mobileCtaAnchorRef} className="mt-8 sm:hidden">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={handleBook}
                    className={`inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 py-4 text-center text-base font-semibold shadow-[0_16px_34px_rgba(17,17,17,0.16)] transition active:scale-[0.99] ${classes.primaryCta}`}
                  >
                    {orderCtaLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`inline-flex min-h-14 w-full items-center justify-center rounded-full border px-6 py-4 text-center text-base font-semibold ${classes.disabledCta}`}
                  >
                    {unavailableLabel}
                  </button>
                )}
              </div>

              <div className="mt-8 hidden sm:block">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={handleBook}
                    className={`inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 py-4 text-center text-base font-semibold transition active:scale-[0.99] ${classes.primaryCta}`}
                  >
                    {orderCtaLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`inline-flex min-h-14 w-full items-center justify-center rounded-full border px-6 py-4 text-center text-base font-semibold ${classes.disabledCta}`}
                  >
                    {unavailableLabel}
                  </button>
                )}
              </div>

              <ProductTrustSection />

              <SizeChartPanel
                imageUrl={sizeChartImageUrl}
                productTitle={product.title}
              />

              <ProductInfoAccordions product={product} store={store} />
            </section>
          </div>

          <ExploreMoreProducts
            getProductFallbackIndex={getProductFallbackIndex}
            isProductSaved={wishlist.isWishlisted}
            onProductSelect={handleTheme1ChromeProductSelect}
            onToggleProductSaved={wishlist.toggleWishlistItem}
            products={exploreProducts}
          />

          <div className="px-4 sm:px-0">
            <StoreMiniBlock classes={classes} store={store} storeSlug={storeSlug} />
          </div>
        </section>

        <div
          className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#ece7df] bg-white/96 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] text-[#111111] shadow-[0_-18px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl transition duration-300 sm:hidden ${
            showMobileStickyCta
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#8d867d]">Product price</p>
              <p className="truncate text-lg font-semibold tracking-[-0.035em]">
                {formatINR(product.price)}
              </p>
            </div>
            {isAvailable ? (
              <button
                type="button"
                onClick={handleBook}
                className={`inline-flex min-h-12 max-w-[64%] shrink-0 items-center justify-center truncate rounded-full px-5 text-sm font-semibold shadow-[0_14px_28px_rgba(17,17,17,0.18)] ${classes.primaryCta}`}
              >
                {orderCtaLabel}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 max-w-[64%] shrink-0 items-center justify-center truncate rounded-full border border-[#e5ded4] bg-[#f3f1ed] px-5 text-sm font-semibold text-[#8d867d]"
              >
                {unavailableLabel}
              </button>
            )}
          </div>
        </div>
      </main>
      <Theme1EditorialFooter reserveStickySpace store={store} storeSlug={storeSlug} />
    </>
  );
}
