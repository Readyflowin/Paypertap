import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  MessageCircle,
  Package,
  Sparkles,
  Store as StoreIcon,
} from "lucide-react";

import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptIconButton,
  PptNotice,
  PptPriceBreakdown,
  PptSkeletonProductGrid,
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
import { getPublicStoreData } from "@/services/publicStoreService";
import type { Product, Store } from "@/types/firestore";

type PageState = {
  store: Store | null;
  product: Product | null;
  isOwnerPreview: boolean;
  loading: boolean;
  error: string;
};

function getProductImage(product: Product): string {
  const image = product.images?.find((item) => item.url || item.mediumUrl || item.thumbUrl);
  return image?.url || image?.mediumUrl || image?.thumbUrl || "";
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
  if (product.status === "sold") return { label: "Sold", tone: "sold" };
  if (isReserved) return { label: "Reserved", tone: "reserved" };
  if (product.status === "open" && getAvailableQuantity(product) <= 0) {
    return { label: "Unavailable", tone: "neutral" };
  }
  if (product.status === "open") return { label: "Open", tone: "success" };
  return { label: "Unavailable", tone: "neutral" };
}

function ProductDetailLoading() {
  return (
    <main className="pds-page min-h-screen overflow-x-hidden px-4 py-6 sm:py-10">
      <section className="pds-container">
        <div className="flex min-h-[35vh] items-center justify-center">
          <PptTapLoader title="Loading product..." description="Checking availability and booking details." />
        </div>
        <div className="mt-8">
          <PptSkeletonProductGrid />
        </div>
      </section>
    </main>
  );
}

function StoreMiniBlock({
  store,
  storeSlug,
}: {
  store: Store;
  storeSlug: string;
}) {
  const navigate = useNavigate();
  const instagramUrl = getStoreInstagramUrl(store);

  return (
    <div className="pds-panel">
      <div className="flex items-center gap-3">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={`${store.storeName} logo`}
            decoding="async"
            loading="lazy"
            className="h-12 w-12 rounded-[18px] border border-[var(--pds-border)] object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#5B35F5,#EC4899)] text-sm font-semibold text-white">
            {getInitials(store.storeName) || <StoreIcon size={18} />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-semibold text-[var(--pds-text)]">
            {store.storeName}
          </strong>
          <span className="mt-1 block line-clamp-1 text-xs text-[var(--pds-muted)]">
            {store.bio || "Fresh drops, limited pieces."}
          </span>
        </div>
        {instagramUrl ? (
          <PptIconButton
            label={`Open ${store.storeName} on Instagram`}
            tone="instagram"
            onClick={() => window.open(instagramUrl, "_blank", "noreferrer")}
          >
            <PptBrandIcon type="instagram" size={18} />
          </PptIconButton>
        ) : null}
      </div>
      <div className="mt-4">
        <PptButton
          variant="secondary"
          fullWidth
          onClick={() => {
            navigate(`/${storeSlug}`);
          }}
        >
          View store
        </PptButton>
      </div>
    </div>
  );
}

function Step({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[var(--pds-border)] bg-white px-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[var(--pds-primary-soft)] text-[var(--pds-primary)]">
        {icon}
      </span>
      <span className="text-sm font-medium text-[var(--pds-text)]">{title}</span>
    </div>
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
      <main className="pds-page grid min-h-screen place-items-center overflow-x-hidden px-4 py-8">
        <PptEmptyState
          title="Product not available"
          description="This product may be sold out or unpublished."
          icon={<Package size={22} />}
          action={
            <PptButton variant="secondary" icon={<ArrowLeft size={17} />} onClick={() => navigate(`/${storeSlug}`)}>
              Back to store
            </PptButton>
          }
        />
      </main>
    );
  }

  const { store, product, isOwnerPreview } = state;
  const imageUrl = getProductImage(product);
  const availableQuantity = getAvailableQuantity(product);
  const isAvailable = store.isPublished && isProductBookable(product) && !isOwnerPreview;
  const isSoldOut = product.status === "sold";
  const isReserved =
    product.status === "hold" || (availableQuantity <= 0 && product.reservedQuantity > 0);
  const checkoutHref = `/${storeSlug}/checkout/${product.productId || product.id}`;
  const statusBadge = getStatusBadge(product, isReserved);
  const unavailableLabel = getProductUnavailableLabel(product);

  return (
    <main className="pds-page min-h-screen overflow-x-hidden px-4 py-6 sm:py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-[460px] min-w-0 lg:max-w-none">
          <Link
            to={`/${storeSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--pds-muted)] transition hover:text-[var(--pds-primary)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to store
          </Link>

          <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)] lg:items-start">
            <section className="pds-panel overflow-hidden p-3">
              <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#f4f1ff,#fff)]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.images?.[0]?.alt || product.title}
                    decoding="async"
                    fetchPriority="high"
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--pds-muted)]">
                    <ImageIcon size={32} />
                    <span className="text-sm font-medium">No image</span>
                  </div>
                )}
              </div>
            </section>

            <div className="min-w-0 space-y-5 lg:sticky lg:top-6">
              <section className="pds-panel">
                {isOwnerPreview ? (
                  <div className="mb-4">
                    <PptNotice tone="warning" title="Owner preview">
                      Checkout is disabled until this store is published.
                    </PptNotice>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  {product.category ? <PptBadge tone="primary">{product.category}</PptBadge> : null}
                  <PptBadge tone={statusBadge.tone}>{statusBadge.label}</PptBadge>
                </div>

                <h1 className="mt-4 break-words text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--pds-text)]">
                  {product.title}
                </h1>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--pds-text)]">
                  {formatINR(product.price)}
                </p>
                {product.description ? (
                  <p className="mt-4 break-words text-sm leading-6 text-[var(--pds-muted)]">
                    {product.description}
                  </p>
                ) : null}

                <div className="mt-5">
                  <PptBadge tone={availableQuantity === 1 ? "warning" : isSoldOut ? "sold" : "neutral"}>
                    {availableQuantity === 1
                      ? "Only 1 piece available"
                      : availableQuantity > 1
                        ? `${availableQuantity} available`
                        : isReserved
                          ? "Reserved"
                          : isSoldOut
                            ? "Sold out"
                            : "Unavailable"}
                  </PptBadge>
                </div>

                <div className="mt-5">
                  <PptPriceBreakdown
                    productPrice={product.price}
                    advanceAmount={product.bookingAdvanceAmount || 20}
                  />
                </div>

                <div className="mt-5">
                  <PptNotice tone="info" title="Reserve this item with ₹20">
                    Your ₹20 booking advance reserves the item. The seller confirms delivery and
                    remaining payment on WhatsApp.
                  </PptNotice>
                </div>

                <p className="mt-5 text-sm leading-6 text-[var(--pds-muted)]">
                  Pay the remaining amount directly to the seller on WhatsApp.
                </p>

                {isAvailable ? (
                  <div className="mt-5">
                    <PptButton fullWidth size="lg" rightIcon={<ArrowLeft className="rotate-180" size={17} />} onClick={() => navigate(checkoutHref)}>
                      Reserve with ₹20
                    </PptButton>
                  </div>
                ) : (
                  <div className="mt-5">
                    <PptButton fullWidth variant="secondary" disabled>
                      {isOwnerPreview ? "Preview only" : unavailableLabel}
                    </PptButton>
                    <div className="mt-3">
                      <PptNotice tone={isSoldOut ? "danger" : "warning"} title="This item is not bookable">
                        {isSoldOut
                          ? "This product is sold out."
                          : "This product is currently reserved or unavailable."}
                      </PptNotice>
                    </div>
                  </div>
                )}
              </section>

              <section className="pds-panel">
                <h2 className="text-base font-semibold text-[var(--pds-text)]">How it works</h2>
                <div className="mt-4 grid gap-3">
                  <Step icon={<Sparkles size={18} />} title="Pay ₹20 booking advance" />
                  <Step icon={<CheckCircle2 size={18} />} title="Item gets reserved" />
                  <Step icon={<MessageCircle size={18} />} title="Confirm remaining payment on WhatsApp" />
                </div>
              </section>

              <StoreMiniBlock store={store} storeSlug={storeSlug} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
