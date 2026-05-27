import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ImageIcon,
  MessageCircle,
  Package,
  ShieldCheck,
  Store as StoreIcon,
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
import { BOOKING_ADVANCE_AMOUNT, formatINR } from "@/lib/money";
import {
  getAvailableQuantity,
  getProductUnavailableLabel,
  isProductBookable,
} from "@/lib/productAvailability";
import { getProductById, getPublicProductById } from "@/services/productService";
import { getPublicStoreData } from "@/services/publicStoreService";
import { PaymentTrustStrip } from "@/storefront/PaymentTrustStrip";
import { getProductDetailImageUrls } from "@/storefront/imageMedia";
import { getDisplayImageUrl } from "@/lib/imageUrls";
import type { Product, Store } from "@/types/firestore";

type PageThemeId = "theme1" | "theme2" | "theme3";

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
  bookingBox: string;
  bookingStrong: string;
  primaryCta: string;
  disabledCta: string;
  sticky: string;
  storePanel: string;
  storeLogo: string;
};

const themeClasses: Record<PageThemeId, ThemeClasses> = {
  theme1: {
    main: "bg-[#f7f7f8] text-neutral-950",
    back: "text-neutral-500 hover:text-neutral-950",
    mediaPanel: "border-neutral-200 bg-white shadow-[0_18px_50px_rgba(17,18,23,0.07)]",
    imageSurface: "bg-neutral-100",
    emptyImage: "text-neutral-400",
    thumb: "border-neutral-200 bg-neutral-100",
    infoPanel: "border-neutral-200 bg-white shadow-[0_18px_50px_rgba(17,18,23,0.07)]",
    eyebrow: "text-neutral-400",
    title: "text-neutral-950",
    price: "text-neutral-950",
    muted: "text-neutral-600",
    bookingBox: "border-neutral-200 bg-neutral-50 text-neutral-600",
    bookingStrong: "text-neutral-950",
    primaryCta: "bg-neutral-950 !text-white hover:bg-neutral-800",
    disabledCta: "border-neutral-200 bg-neutral-100 text-neutral-400",
    sticky: "border-neutral-200 bg-white/96 text-neutral-950",
    storePanel: "border-neutral-200 bg-white text-neutral-600",
    storeLogo: "border-neutral-200 bg-neutral-950 text-white",
  },
  theme2: {
    main: "bg-[#f5eee6] text-[#171411]",
    back: "text-[#75695f] hover:text-[#171411]",
    mediaPanel: "border-[#e7ded4] bg-[#fffaf4] shadow-[0_20px_60px_rgba(78,61,43,0.08)]",
    imageSurface: "bg-[#eee5da]",
    emptyImage: "text-[#9a8c7f]",
    thumb: "border-[#e7ded4] bg-[#eee5da]",
    infoPanel: "border-[#e7ded4] bg-[#fffaf4] shadow-[0_20px_60px_rgba(78,61,43,0.08)]",
    eyebrow: "text-[#8f7f6f]",
    title: "text-[#171411]",
    price: "text-[#171411]",
    muted: "text-[#6f6257]",
    bookingBox: "border-[#e7ded4] bg-white/70 text-[#6f6257]",
    bookingStrong: "text-[#171411]",
    primaryCta: "bg-[#171411] !text-[#fffaf4] hover:bg-[#2a241f]",
    disabledCta: "border-[#dfd3c6] bg-[#f4eadf] text-[#9a8b7c]",
    sticky: "border-[#eadfd3] bg-[#fffaf4]/96 text-[#171411]",
    storePanel: "border-[#e7ded4] bg-[#fffaf4] text-[#6f6257]",
    storeLogo: "border-[#e4d9cd] bg-[#171411] text-[#fffaf4]",
  },
  theme3: {
    main: "bg-[#070709] text-white",
    back: "text-white/55 hover:text-white",
    mediaPanel: "border-white/10 bg-neutral-950 shadow-[0_24px_70px_rgba(0,0,0,0.36)]",
    imageSurface: "bg-white/8",
    emptyImage: "text-white/34",
    thumb: "border-white/10 bg-white/8",
    infoPanel: "border-white/10 bg-neutral-900 shadow-[0_24px_70px_rgba(0,0,0,0.36)]",
    eyebrow: "text-white/42",
    title: "text-white",
    price: "text-white",
    muted: "text-white/64",
    bookingBox: "border-white/10 bg-white/7 text-white/64",
    bookingStrong: "text-white",
    primaryCta: "bg-emerald-300 !text-neutral-950 hover:bg-emerald-200",
    disabledCta: "border-white/10 bg-white/10 text-white/40",
    sticky: "border-white/10 bg-neutral-950/96 text-white",
    storePanel: "border-white/10 bg-neutral-900 text-white/58",
    storeLogo: "border-white/14 bg-white text-neutral-950",
  },
};

function getSelectedThemeId(store: Store): PageThemeId {
  const selectedThemeId = store.selectedThemeId || store.themeId;
  return selectedThemeId === "theme2" || selectedThemeId === "theme3"
    ? selectedThemeId
    : "theme1";
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

function ProductDetailLoading() {
  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#f7f7f8] px-4 py-8">
      <PptTapLoader
        title="Loading product..."
        description="Checking availability and booking details."
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
  const logoUrl = getDisplayImageUrl(store.logoUrl);

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
            className={`inline-flex min-h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium ${classes.bookingBox}`}
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
  const imageSlots = imageUrls.length ? imageUrls : [""];
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
  const sellerCollectAmount = Math.max(0, product.price - BOOKING_ADVANCE_AMOUNT);

  return (
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
          <section className={`min-w-0 overflow-hidden rounded-[28px] border p-3 ${classes.mediaPanel}`}>
            <div className={`aspect-[4/5] min-w-0 overflow-hidden rounded-[24px] ${classes.imageSurface}`}>
              {imageSlots[0] ? (
                <img
                  src={imageSlots[0]}
                  alt={product.images?.[0]?.alt || product.title}
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className={`flex h-full flex-col items-center justify-center gap-2 ${classes.emptyImage}`}>
                  <ImageIcon size={32} />
                  <span className="text-sm font-medium">Product image</span>
                </div>
              )}
            </div>

            {imageSlots.length > 1 ? (
              <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
                {imageSlots.slice(1, 3).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className={`aspect-square min-w-0 overflow-hidden rounded-2xl border ${classes.thumb}`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${product.title} image ${index + 2}`}
                        decoding="async"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-full items-center justify-center ${classes.emptyImage}`}>
                        <ImageIcon size={22} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <div className="min-w-0 space-y-4 lg:sticky lg:top-5">
            <section className={`min-w-0 rounded-[28px] border p-5 ${classes.infoPanel}`}>
              {isOwnerPreview ? (
                <div className={`mb-4 rounded-2xl border p-3 text-sm ${classes.bookingBox}`}>
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

              <div className={`mt-5 min-w-0 rounded-[22px] border p-4 text-sm leading-6 ${classes.bookingBox}`}>
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} aria-hidden="true" className="shrink-0" />
                  <strong className={`font-semibold ${classes.bookingStrong}`}>
                    Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}
                  </strong>
                </div>
                <p>
                  Your item is held after successful booking. Pay {formatINR(sellerCollectAmount)} directly to the seller.
                </p>
                
              </div>

              {!isAvailable ? (
                <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${classes.bookingBox}`}>
                  {isReserved
                    ? "This item is currently reserved."
                    : "This item is not currently bookable."}
                </p>
              ) : null}

              {product.description ? (
                <p className={`mt-5 whitespace-pre-line break-words text-sm leading-7 ${classes.muted}`}>
                  {product.description}
                </p>
              ) : null}

              <div className="mt-5">
                <PaymentTrustStrip compact variant={themeId} />
              </div>

              <div className="mt-5 hidden gap-3 sm:grid">
                {isAvailable ? (
                  <Link
                    to={checkoutHref}
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-center text-sm font-semibold ${classes.primaryCta}`}
                  >
                    Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl border px-5 py-3 text-center text-sm font-semibold ${classes.disabledCta}`}
                  >
                    {unavailableLabel}
                  </button>
                )}
                <p className={`flex items-center justify-center gap-2 text-center text-xs font-medium ${classes.muted}`}>
                  <MessageCircle size={14} aria-hidden="true" />
                  Continue on WhatsApp
                </p>
              </div>
            </section>

            <StoreMiniBlock classes={classes} store={store} storeSlug={storeSlug} />
          </div>
        </div>
      </section>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur sm:hidden ${classes.sticky}`}>
        <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-xs font-medium ${classes.muted}`}>Product price</p>
            <p className={`truncate text-lg font-semibold tracking-[-0.035em] ${classes.price}`}>
              {formatINR(product.price)}
            </p>
          </div>
          {isAvailable ? (
            <Link
              to={checkoutHref}
              className={`inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl px-3 text-sm font-semibold ${classes.primaryCta}`}
            >
              Book for {formatINR(BOOKING_ADVANCE_AMOUNT)}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={`inline-flex min-h-11 max-w-[58%] shrink-0 items-center justify-center truncate rounded-2xl border px-3 text-sm font-semibold ${classes.disabledCta}`}
            >
              {unavailableLabel}
            </button>
          )}
        </div>
        <p className={`mt-2 break-words text-center text-xs font-medium ${classes.muted}`}>
          Pay {formatINR(sellerCollectAmount)} directly to the seller
          <span className="block">Continue on WhatsApp</span>
        </p>
      </div>
    </main>
  );
}
