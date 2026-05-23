import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ImageIcon, Package, Sparkles, Store as StoreIcon } from "lucide-react";

import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptIconButton,
  PptSkeletonProductGrid,
  PptTapLoader,
  type PptTone,
} from "@/components/ui";
import { usePublicStore } from "@/hooks/usePublicStore";
import { formatINR } from "@/lib/money";
import { getAvailableQuantity, isProductBookable } from "@/lib/productAvailability";
import {
  STORE_THEME_DEFAULTS,
  getStoreFontClass,
  getStoreHeroStyle,
  getStoreInstagramUrl,
  getStoreTagline,
  getStoreThemeClass,
  getStoreThemeStyle,
} from "@/lib/storeTheme";
import type { Product, Store } from "@/types/firestore";

function getProductImage(product: Product): string {
  const image = product.images?.[0];
  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
}

function canBookProduct(product: Product): boolean {
  return isProductBookable(product);
}

function getProductCtaLabel(product: Product): string {
  const availableQuantity = getAvailableQuantity(product);

  if (product.status === "sold") return "Sold out";
  if (product.status === "hold" || (availableQuantity <= 0 && product.reservedQuantity > 0)) {
    return "Reserved";
  }
  if (product.status === "open" && availableQuantity > 0) return "View product";

  return "Unavailable";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getProductStatusBadge(product: Product): { label: string; tone: PptTone } {
  const availableQuantity = getAvailableQuantity(product);

  if (product.status === "sold") return { label: "Sold", tone: "sold" };
  if (product.status === "hold" || (availableQuantity <= 0 && product.reservedQuantity > 0)) {
    return { label: "Reserved", tone: "reserved" };
  }
  if (product.status === "open" && availableQuantity <= 0) {
    return { label: "Unavailable", tone: "neutral" };
  }
  if (availableQuantity === 1 && product.status === "open") {
    return { label: "1 left", tone: "warning" };
  }
  if (product.status === "open") return { label: "Open", tone: "success" };

  return { label: "Unavailable", tone: "neutral" };
}

function StoreLoadingState() {
  return (
    <main className="pds-page min-h-screen px-4 py-8">
      <section className="pds-container">
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <PptTapLoader title="Loading store..." description="Fetching fresh drops and booking status." />
        </div>
        <div className="mt-8">
          <PptSkeletonProductGrid />
        </div>
      </section>
    </main>
  );
}

function StoreLogo({ store }: { store: Store }) {
  if (store.logoUrl) {
    return (
      <img
        src={store.logoUrl}
        alt={`${store.storeName} logo`}
        className="h-16 w-16 shrink-0 rounded-[22px] border border-[var(--pds-border)] object-cover shadow-[var(--pds-shadow-soft)]"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#5B35F5,#EC4899)] text-xl font-semibold text-white shadow-[var(--pds-shadow-primary)]">
      {getInitials(store.storeName) || <StoreIcon size={24} />}
    </div>
  );
}

function StoreHeader({ store, instagramUrl }: { store: Store; instagramUrl: string }) {
  return (
    <section className="pds-panel">
      <div className="flex items-start gap-4">
        <StoreLogo store={store} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] text-[var(--pds-text)]">
              {store.storeName}
            </h1>
            {store.isPublished ? <PptBadge tone="success" icon={<Sparkles size={13} />}>Live</PptBadge> : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--pds-muted)]">
            {getStoreTagline(store)}
          </p>
        </div>
        {instagramUrl ? (
          <PptIconButton
            label={`Open ${store.storeName} on Instagram`}
            tone="instagram"
            onClick={() => window.open(instagramUrl, "_blank", "noreferrer")}
          >
            <PptBrandIcon type="instagram" size={20} />
          </PptIconButton>
        ) : null}
      </div>
    </section>
  );
}

function ProductTile({
  product,
  productHref,
  onCtaClick,
}: {
  product: Product;
  productHref: string;
  onCtaClick: () => void;
}) {
  const imageUrl = getProductImage(product);
  const statusBadge = getProductStatusBadge(product);
  const isBookable = canBookProduct(product);

  return (
    <article className="pds-product-card">
      <Link to={productHref} className="pds-product-image" aria-label={`View ${product.title}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.images?.[0]?.alt || product.title} loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--pds-muted)]">
            <ImageIcon size={26} />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        <div className="pds-product-floating">
          <PptBadge tone={statusBadge.tone}>{statusBadge.label}</PptBadge>
        </div>
      </Link>

      <div className="pds-product-body">
        <div className="pds-product-meta">
          <span>{product.category || "Fresh drop"}</span>
          <PptBadge tone="primary">₹20 booking</PptBadge>
        </div>

        <Link to={productHref} className="block text-[var(--pds-text)] hover:text-[var(--pds-primary)]">
          <h3>{product.title}</h3>
        </Link>
        <p>{product.description || "Reserve this piece before it sells out."}</p>

        <div className="pds-product-price">
          <strong>{formatINR(product.price)}</strong>
          <span>Reserve with ₹20</span>
        </div>

        <PptButton
          variant={isBookable ? "primary" : "secondary"}
          fullWidth
          rightIcon={isBookable ? <ArrowRight size={17} /> : undefined}
          disabled={!isBookable}
          onClick={onCtaClick}
        >
          {getProductCtaLabel(product)}
        </PptButton>
      </div>
    </article>
  );
}

export default function PublicStorePage() {
  const navigate = useNavigate();
  const { storeSlug } = useParams();
  const { data, loading, error } = usePublicStore(storeSlug || "");

  if (loading) {
    return <StoreLoadingState />;
  }

  if (error || !data) {
    return (
      <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
        <PptEmptyState
          title="Store not found"
          description="This store may be unavailable or not published yet."
          icon={<StoreIcon size={22} />}
        />
      </main>
    );
  }

  const { store, products } = data;
  const instagramUrl = getStoreInstagramUrl(store);
  const publishedProducts = products.filter((product) =>
    ["open", "hold", "sold", "reserved"].includes(product.status)
  );

  return (
    <main
      className={`pds-page ppt-public-store-page min-h-screen px-4 py-6 sm:py-10 ${getStoreThemeClass(store)} ${getStoreFontClass(store)}`}
      style={getStoreThemeStyle(store)}
    >
      <section className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-[430px] space-y-5 lg:max-w-none">
          <StoreHeader store={store} instagramUrl={instagramUrl} />

          <section className="pds-store-hero-card" style={getStoreHeroStyle(store)}>
            <PptBadge tone="reserved">First come, first served</PptBadge>
            <p className="mt-5 text-sm text-white/72">New drops available</p>
            <h3>{store.heroHeading || STORE_THEME_DEFAULTS.heroHeading}</h3>
            <p>{store.heroSubtitle || STORE_THEME_DEFAULTS.heroSubtitle}</p>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--pds-text)]">
                  Products
                </h2>
                <p className="mt-1 text-sm text-[var(--pds-muted)]">
                  {publishedProducts.length} item{publishedProducts.length === 1 ? "" : "s"} available
                </p>
              </div>
            </div>

            {publishedProducts.length === 0 ? (
              <div className="mt-5">
                <PptEmptyState
                  title="No drops yet"
                  description="This seller has not added products yet. Check back soon."
                  icon={<Package size={22} />}
                  action={
                    instagramUrl ? (
                      <PptButton
                        variant="secondary"
                        icon={<PptBrandIcon type="instagram" size={17} />}
                        onClick={() => window.open(instagramUrl, "_blank", "noreferrer")}
                      >
                        Open Instagram
                      </PptButton>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="ppt-store-product-grid mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {publishedProducts.map((product) => {
                  const productId = product.productId || product.id;
                  const productHref = `/${storeSlug}/product/${productId}`;
                  const isBookable = canBookProduct(product);

                  return (
                    <ProductTile
                      key={product.id || product.productId}
                      product={product}
                      productHref={productHref}
                      onCtaClick={() => {
                        if (isBookable) navigate(productHref);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <footer className="py-10 text-center text-xs font-medium text-[var(--pds-muted)]">
            <Link to={`/${storeSlug}`}>PayPerTap verified booking store</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
