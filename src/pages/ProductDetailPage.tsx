import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Info,
  Maximize2,
  Package,
  RotateCcw,
  Ruler,
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
import { getProductById, getPublicProductById } from "@/services/productService";
import { getPublicStoreShellData } from "@/services/publicStoreService";
import { PaymentTrustStrip } from "@/storefront/PaymentTrustStrip";
import { Theme1EditorialFooter } from "@/storefront/themes/theme1/Theme1Footer";
import { Theme1Header } from "@/storefront/themes/theme1/Theme1Header";
import {
  getStoreOrderPaymentBreakdown,
  getStorefrontPaymentSubtext,
  StorefrontPaymentBreakdown,
} from "@/storefront/StorefrontPaymentBreakdown";
import { getProductDetailImageUrls } from "@/storefront/imageMedia";
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
    mediaPanel: "border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
    imageSurface: "bg-[#f1f2f4]",
    emptyImage: "text-[#60646c]",
    thumb: "border-[#e5e7eb] bg-[#f1f2f4]",
    infoPanel: "border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
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
      className={`mt-5 grid min-w-0 gap-4 rounded-[22px] transition ${
        hasError ? "ring-2 ring-amber-400/70 ring-offset-2" : ""
      }`}
    >
      {optionGroups.map((option) => {
        const isColor = option.name.toLocaleLowerCase() === "color";

        return (
          <div key={option.name} className="min-w-0">
            <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
              <p className={`text-[10px] font-semibold uppercase ${classes.eyebrow}`}>
                {option.name}
              </p>
              {selectedOptions[option.name] ? (
                <span className={`truncate text-xs ${classes.muted}`}>
                  {selectedOptions[option.name]}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              {option.values.map((value) => {
                const cssColor = isColor ? getCssColor(value) : null;
                const isSelected = selectedOptions[option.name] === value;
                const isAvailable = availableOptions[option.name]?.has(value) ?? false;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() =>
                      onChange({
                        ...selectedOptions,
                        [option.name]: value,
                      })
                    }
                    className={`inline-flex min-h-11 min-w-11 max-w-full items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] ${
                      isSelected
                        ? classes.primaryCta
                        : `${classes.OrderBox} hover:opacity-90`
                    } ${!isAvailable ? "cursor-not-allowed opacity-45 line-through" : ""}`}
                  >
                    {isColor ? (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: cssColor || "#e5e7eb" }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="truncate">{value}</span>
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
  const touchStartX = useRef<number | null>(null);
  const galleryImages = imageUrls.length ? imageUrls : [""];
  const activeImage = galleryImages[activeIndex] || "";
  const canNavigate = galleryImages.length > 1;

  function goToImage(nextIndex: number) {
    setActiveIndex((nextIndex + galleryImages.length) % galleryImages.length);
  }

  function goPrevious() {
    goToImage(activeIndex - 1);
  }

  function goNext() {
    goToImage(activeIndex + 1);
  }

  return (
    <>
      <section className={`min-w-0 overflow-hidden rounded-[28px] border p-3 ${classes.mediaPanel}`}>
        <div
          className={`relative aspect-[4/5] min-w-0 overflow-hidden rounded-[24px] ${classes.imageSurface}`}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null || !canNavigate) return;
            const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
            const deltaX = touchStartX.current - endX;
            touchStartX.current = null;

            if (Math.abs(deltaX) < 42) return;
            if (deltaX > 0) goNext();
            else goPrevious();
          }}
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          {activeImage ? (
            <button
              type="button"
              aria-label={`Open ${product.title} image ${activeIndex + 1} fullscreen`}
              onClick={() => setZoomOpen(true)}
              className="group block h-full w-full bg-[#f7f7f8]"
            >
              <img
                key={activeImage}
                src={activeImage}
                alt={product.images?.[activeIndex]?.alt || `${product.title} image ${activeIndex + 1}`}
                decoding="async"
                fetchPriority={activeIndex === 0 ? "high" : "auto"}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.015]"
              />
              <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/86 text-[#111111] shadow-lg backdrop-blur">
                <Maximize2 size={17} aria-hidden="true" />
              </span>
            </button>
          ) : (
            <div className={`flex h-full flex-col items-center justify-center gap-2 ${classes.emptyImage}`}>
              <ImageIcon size={32} />
              <span className="text-sm font-medium">Product image</span>
            </div>
          )}

          {canNavigate ? (
            <>
              <button
                type="button"
                aria-label="Previous product image"
                onClick={goPrevious}
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111111] shadow-lg transition hover:bg-white sm:grid"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next product image"
                onClick={goNext}
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111111] shadow-lg transition hover:bg-white sm:grid"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#111111]/76 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {activeIndex + 1} / {galleryImages.length}
              </div>
            </>
          ) : null}
        </div>

        {galleryImages.length > 1 ? (
          <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {galleryImages.map((imageUrl, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`aspect-square w-16 shrink-0 snap-start overflow-hidden rounded-2xl border transition sm:w-20 ${
                    isActive
                      ? "border-[#111111] ring-2 ring-[#111111]/12"
                      : "border-[#e5e7eb] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    decoding="async"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
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
  const [modalOpen, setModalOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <section className="mt-5 rounded-[22px] border border-[#e5e7eb] bg-[#f7f7f8]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
          <Ruler size={17} aria-hidden="true" />
          Size chart
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-t border-[#e5e7eb] p-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="block w-full overflow-hidden rounded-2xl bg-white"
          >
            <img
              src={imageUrl}
              alt={`${productTitle} size chart`}
              loading="lazy"
              decoding="async"
              className="max-h-[360px] w-full object-contain"
            />
          </button>
        </div>
      ) : null}
      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle} size chart`}
          className="fixed inset-0 z-[85] grid place-items-center bg-[#111111]/92 p-3"
          onClick={() => setModalOpen(false)}
        >
          <button
            type="button"
            aria-label="Close size chart"
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#111111] shadow-xl"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <img
            src={imageUrl}
            alt={`${productTitle} size chart`}
            decoding="async"
            className="max-h-[88vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

type ProductInfoSectionKey =
  | "description"
  | "shipping"
  | "returns"
  | "care"
  | "notes";

function ProductInfoAccordions({
  product,
  store,
}: {
  product: Product;
  store: Store;
}) {
  const [openSection, setOpenSection] = useState<ProductInfoSectionKey>("description");
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
      key: "shipping",
      title: "Shipping",
      icon: Truck,
      body: "Delivery, pickup, or courier details are confirmed directly by the seller after you place the order.",
    },
    {
      key: "returns",
      title: "Return policy",
      icon: RotateCcw,
      body: generateReturnsPolicy(store),
    },
    {
      key: "care",
      title: "Care instructions",
      icon: Sparkles,
      body: getProductCareInstructions(product),
    },
    {
      key: "notes",
      title: "Seller notes",
      icon: StoreIcon,
      body: getProductSellerNotes(product),
    },
  ];

  return (
    <section className="mt-5 overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-[#ffffff]">
      {sections.map((section) => {
        const isOpen = openSection === section.key;
        const Icon = section.icon;

        return (
          <div key={section.key} className="border-b border-[#e5e7eb] last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenSection(isOpen ? "description" : section.key)}
              className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
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
                <p className="whitespace-pre-line px-4 pb-4 text-sm leading-7 text-[#60646c]">
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

  return (
    <section className={`min-w-0 rounded-[24px] border p-4 ${classes.storePanel}`}>
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
          className={`inline-flex min-h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium ${classes.primaryCta}`}
        >
          Back to store
        </Link>
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex min-h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium ${classes.OrderBox}`}
          >
            <PptBrandIcon type="instagram" size={16} />
            Instagram
          </a>
        ) : null}
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
    isOwnerPreview: false,
    loading: true,
    error: "",
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [variantError, setVariantError] = useState("");
  const variantSelectorRef = useRef<HTMLDivElement | null>(null);

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

        if (!cancelled) {
          setSelectedOptions({});
          setVariantError("");
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
  }, [productId, storeSlug, user?.uid]);

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
  const orderPaymentBreakdown = getStoreOrderPaymentBreakdown({
    productPrice: product.price,
    store,
  });
  const stickyPaymentSubtext = getStorefrontPaymentSubtext(orderPaymentBreakdown);
  const orderCtaLabel =
    orderPaymentBreakdown.paymentMode === "partial_advance"
      ? `Pay seller advance ${formatINR(orderPaymentBreakdown.advanceAmount)}`
      : "Place order";

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

  return (
    <>
      <Theme1Header
        onProductSelect={handleTheme1ChromeProductSelect}
        products={[product]}
        store={store}
      />
    <main className={`min-h-screen overflow-x-hidden px-3 py-4 pb-28 sm:px-5 sm:py-6 sm:pb-6 ${classes.main}`}>
      <section className="mx-auto w-full max-w-6xl">
        <Link
          to={`/${storeSlug}`}
          className={`inline-flex items-center gap-2 text-sm font-medium transition ${classes.back}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to store
        </Link>

        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <ProductImageGallery
            classes={classes}
            imageUrls={imageUrls}
            product={product}
          />

          <div className="min-w-0 space-y-4 lg:sticky lg:top-5">
            <section className={`min-w-0 rounded-[28px] border p-5 ${classes.infoPanel}`}>
              {isOwnerPreview ? (
                <div className={`mb-4 rounded-2xl border p-3 text-sm ${classes.OrderBox}`}>
                  Owner preview. Checkout is disabled until this store is published.
                </div>
              ) : null}

              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {product.category ? <PptBadge tone="primary">{product.category}</PptBadge> : null}
                <PptBadge tone={statusBadge.tone}>{statusBadge.label}</PptBadge>
              </div>

              <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.16em] ${classes.eyebrow}`}>
                Product details
              </p>
              <h1 className={`mt-2 break-words text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl ${classes.title}`}>
                {product.title}
              </h1>
              <p className={`mt-4 text-3xl font-semibold tracking-[-0.04em] ${classes.price}`}>
                {formatINR(product.price)}
              </p>

              <StorefrontPaymentBreakdown
                classes={{
                  shell: `mt-5 min-w-0 rounded-[22px] border p-4 ${classes.OrderBox}`,
                  icon: `grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${classes.Orderstrong} bg-white/65`,
                  title: `text-base font-semibold leading-6 ${classes.Orderstrong}`,
                  text: "mt-1 text-sm leading-6",
                  panel: "mt-3 rounded-2xl border border-current/10 bg-white/55 p-3",
                  eyebrow: `mb-2 text-[11px] font-semibold uppercase ${classes.eyebrow}`,
                  rowLabel: "min-w-0 truncate text-xs",
                  rowValue: `shrink-0 text-sm ${classes.Orderstrong}`,
                  featuredValue: `shrink-0 text-base ${classes.Orderstrong}`,
                  note: "mt-3 text-xs leading-5",
                }}
                productPrice={product.price}
                store={store}
              />

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
                <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${classes.OrderBox}`}>
                  {variantError}
                </p>
              ) : null}

              {!isAvailable ? (
                <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${classes.OrderBox}`}>
                  {isReserved
                    ? "This item is currently reserved."
                    : "This item is not currently available for ordering."}
                </p>
              ) : null}

              <SizeChartPanel
                imageUrl={sizeChartImageUrl}
                productTitle={product.title}
              />

              <ProductInfoAccordions product={product} store={store} />

              <div className="mt-5">
                <PaymentTrustStrip compact variant={themeId} />
              </div>

              <div className="mt-5 hidden gap-3 sm:grid">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={handleBook}
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-center text-sm font-semibold ${classes.primaryCta}`}
                  >
                    {orderCtaLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl border px-5 py-3 text-center text-sm font-semibold ${classes.disabledCta}`}
                  >
                    {unavailableLabel}
                  </button>
                )}
              </div>
            </section>

            <StoreMiniBlock classes={classes} store={store} storeSlug={storeSlug} />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#111111]/96 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] text-white shadow-[0_-18px_42px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/62">Product price</p>
            <p className="truncate text-lg font-semibold tracking-[-0.035em] text-white">
              {formatINR(product.price)}
            </p>
          </div>
          {isAvailable ? (
            <button
              type="button"
              onClick={handleBook}
              className={`inline-flex min-h-12 max-w-[60%] shrink-0 items-center justify-center truncate rounded-full px-5 text-sm font-semibold shadow-[0_16px_34px_rgba(17,17,17,0.2)] ${classes.primaryCta}`}
            >
              {orderCtaLabel}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-12 max-w-[60%] shrink-0 items-center justify-center truncate rounded-full border border-white/12 bg-white/10 px-5 text-sm font-semibold text-white/70"
            >
              {unavailableLabel}
            </button>
          )}
        </div>
        <p className="mt-2 break-words text-center text-xs font-medium text-white/60">
          {stickyPaymentSubtext}
        </p>
      </div>
    </main>
      <Theme1EditorialFooter reserveStickySpace store={store} storeSlug={storeSlug} />
    </>
  );
}
