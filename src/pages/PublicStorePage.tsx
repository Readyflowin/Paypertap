import { Link, useParams } from "react-router-dom";
import { usePublicStore } from "../hooks/usePublicStore";
import { formatINR } from "../lib/money";
import type { Product } from "../types/firestore";

function getAvailableQuantity(product: Product): number {
  return Math.max(
    product.inventoryQuantity - product.reservedQuantity - product.soldQuantity,
    0
  );
}

function getAvailabilityLabel(product: Product): string {
  const availableQuantity = getAvailableQuantity(product);

  if (product.status === "sold") return "Sold out";
  if (product.status === "hold" || (availableQuantity <= 0 && product.reservedQuantity > 0)) {
    return "Reserved";
  }
  if (product.status === "open" && availableQuantity > 0) return "Book for ₹20";
  return "Unavailable";
}

function getProductImage(product: Product): string {
  const image = product.images?.[0];
  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
}

function canBookProduct(product: Product): boolean {
  return product.status === "open" && getAvailableQuantity(product) > 0;
}

export default function PublicStorePage() {
  const { storeSlug } = useParams();

  const { data, loading, error } = usePublicStore(storeSlug || "");

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          <p className="text-sm font-medium text-gray-700">Loading store...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900">Store not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This store may be unavailable or not published yet.
          </p>
        </div>
      </main>
    );
  }

  const { store, theme, products } = data;

  const primaryColor =
    store.primaryColor || theme?.defaultColors.primaryColor || "#111827";

  const secondaryColor =
    store.secondaryColor || theme?.defaultColors.secondaryColor || "#F9FAFB";

  const accentColor =
    store.accentColor || theme?.defaultColors.accentColor || "#2563EB";

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: secondaryColor,
        color: primaryColor,
      }}
    >
      <section className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="rounded-[2rem] bg-white/80 border border-black/5 shadow-sm overflow-hidden">
          <div className="px-5 py-6 sm:px-8 sm:py-10">
            <div className="flex items-center gap-3">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  className="h-12 w-12 rounded-2xl object-cover border"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: accentColor }}
                >
                  {store.storeName.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  {store.storeName}
                </h1>
                <p className="text-sm text-gray-500">{store.bio}</p>
              </div>
            </div>

            <div
              className="mt-6 rounded-3xl px-5 py-6 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <p className="text-sm opacity-80">New drops available</p>
              <h2 className="mt-1 text-3xl font-black leading-tight">
                Shop limited pieces before they sell out.
              </h2>
              <p className="mt-3 text-sm opacity-80">
                Book your item with a ₹20 advance.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Products</h2>
              <p className="text-sm text-gray-500">
                {products.length} item{products.length === 1 ? "" : "s"}{" "}
                available
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-3xl bg-white p-8 text-center border border-black/5">
              <p className="font-semibold">No products available right now.</p>
              <p className="mt-1 text-sm text-gray-500">Check back soon.</p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  accentColor={accentColor}
                  key={product.id || product.productId}
                  primaryColor={primaryColor}
                  product={product}
                  storeSlug={storeSlug || ""}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ProductCard({
  accentColor,
  primaryColor,
  product,
  storeSlug,
}: {
  accentColor: string;
  primaryColor: string;
  product: Product;
  storeSlug: string;
}) {
  const productId = product.productId || product.id;
  const imageUrl = getProductImage(product);

  return (
                <article
                  className="rounded-3xl bg-white border border-black/5 shadow-sm overflow-hidden"
                >
                  <Link
                    to={`/${storeSlug}/product/${productId}`}
                    className="aspect-[4/5] bg-gray-100 flex items-center justify-center"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.images?.[0]?.alt || product.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-400">
                        No image
                      </span>
                    )}
                  </Link>

                  <div className="p-3">
                    <Link
                      to={`/${storeSlug}/product/${productId}`}
                      className="line-clamp-2 text-sm font-bold transition hover:text-gray-600"
                    >
                      {product.title}
                    </Link>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-base font-black">{formatINR(product.price)}</p>
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        ₹{product.bookingAdvanceAmount || 20} advance
                      </span>
                    </div>

                    {canBookProduct(product) ? (
                      <Link
                        to={`/${storeSlug}/checkout/${productId}`}
                        className="mt-3 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Book for ₹20
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-3 flex w-full items-center justify-center rounded-2xl bg-gray-200 px-3 py-2 text-sm font-bold text-gray-500"
                      >
                        {getAvailabilityLabel(product)}
                      </button>
                    )}
                  </div>
                </article>
  );
}
