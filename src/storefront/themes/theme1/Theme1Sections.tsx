import { useEffect, useMemo, useState } from "react";

import type { StorefrontProduct, StorefrontThemeProps } from "../types";
import { Theme1ProductCard, getTheme1ProductCardKey } from "./Theme1ProductCard";
import { ALL_COLLECTIONS } from "../../collectionFilters";
import { getTheme1Collections } from "./theme1Utils";

function getPaymentTrustLabel(store: StorefrontThemeProps["store"]) {
  return store.paymentMode === "partial_advance" ? "Seller advance available" : "COD available";
}

function getPaymentTrustIcon(store: StorefrontThemeProps["store"]) {
  return store.paymentMode === "partial_advance"
    ? "/icons/trust/secure-lock.svg"
    : "/icons/trust/rupee.svg";
}

export function Theme1Sections({
  collections: managedCollections = [],
  getProductFallbackIndex,
  isProductSaved,
  isPreviewMobile = false,
  onCollectionChange,
  onProductSelect,
  onToggleProductSaved,
  products,
  selectedCollection,
  store,
  totalProductCount,
}: {
  collections?: StorefrontThemeProps["collections"];
  getProductFallbackIndex: (product: StorefrontProduct) => number;
  isProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => boolean;
  isPreviewMobile?: boolean;
  onCollectionChange: (collection: string) => void;
  onProductSelect: (product: StorefrontProduct) => void;
  onToggleProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => void;
  products: StorefrontProduct[];
  selectedCollection: string;
  store: StorefrontThemeProps["store"];
  totalProductCount: number;
}) {
  const [visibleProductCount, setVisibleProductCount] = useState(8);
  const visibleProducts = useMemo(
    () => products.slice(0, visibleProductCount),
    [products, visibleProductCount]
  );
  const featuredProducts = products.slice(0, 4);
  const canLoadMoreProducts = visibleProductCount < products.length;
  const collectionOptions = [
    ALL_COLLECTIONS,
    ...getTheme1Collections(products, managedCollections),
  ];
  const trustItems = [
    {
      label: "Verified seller",
      icon: "/icons/trust/verified-user.svg",
    },
    {
      label: "WhatsApp updates",
      icon: "/icons/trust/whatsapp.svg",
    },
    {
      label: getPaymentTrustLabel(store),
      icon: getPaymentTrustIcon(store),
    },
    {
      label: "Secure ordering",
      icon: "/icons/trust/secure-lock.svg",
    },
  ];

  useEffect(() => {
    setVisibleProductCount(8);
  }, [products, selectedCollection]);

  return (
    <>
      {collectionOptions.length ? (
        <section className="mx-auto max-w-7xl px-4 pt-4" aria-label="Collections">
          <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {collectionOptions.map((collection) => {
              const isSelected = collection === selectedCollection;

              return (
                <button
                  key={collection}
                  type="button"
                  onClick={() => onCollectionChange(collection)}
                  className={`inline-flex min-h-10 shrink-0 snap-start items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                    isSelected
                      ? "bg-[#111111] text-white"
                      : "bg-[#f2f0ec] text-[#2f2b27] hover:bg-[#e8e3db]"
                  }`}
                >
                  {collection}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-4" aria-label="Store trust">
        <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-[#ece7df] bg-[#fbfaf7] shadow-[0_10px_30px_rgba(17,17,17,0.04)]">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 flex-col items-center justify-center gap-1.5 border-r border-[#ece7df] px-1.5 py-3 text-center last:border-r-0 sm:flex-row sm:gap-2 sm:px-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(17,17,17,0.08)]">
                <img
                  src={item.icon}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 object-contain"
                />
              </span>
              <span className="min-w-0 text-[10px] font-semibold leading-tight text-[#3d3934] sm:text-xs">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-3">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
              Featured
            </p>
            <h2
              className={`mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111] ${
                isPreviewMobile ? "" : "sm:text-3xl"
              }`}
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              Shop the drop
            </h2>
          </div>
          {totalProductCount > 0 ? (
            <p className="shrink-0 text-xs font-medium text-[#8d867d]">
              {totalProductCount} item{totalProductCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        {totalProductCount === 0 ? (
          <section className="rounded-[28px] border border-[#ece7df] bg-[#fbfaf7] px-6 py-10 text-center">
            <h2
              className="text-2xl font-semibold leading-tight text-[#111111]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              No products live right now.
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#6f6b64]">
              This store is preparing its next drop. Check back soon.
            </p>
          </section>
        ) : products.length === 0 ? (
          <section className="rounded-[28px] border border-[#ece7df] bg-[#fbfaf7] px-6 py-10 text-center">
            <h2 className="text-xl font-semibold text-[#111111]">No products found</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6b64]">
              Try another collection.
            </p>
          </section>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 gap-x-3 gap-y-6 ${
                isPreviewMobile ? "" : "md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {featuredProducts.map((product) => {
                const fallbackIndex = getProductFallbackIndex(product);

                return (
                  <Theme1ProductCard
                    key={getTheme1ProductCardKey(product)}
                    fallbackIndex={fallbackIndex}
                    isSaved={isProductSaved(product, fallbackIndex)}
                    product={product}
                    onSelect={onProductSelect}
                    onToggleSaved={onToggleProductSaved}
                  />
                );
              })}
            </div>

            {products.length > 4 ? (
              <div className="mt-9">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2
                    className="text-2xl font-semibold tracking-[-0.03em] text-[#111111]"
                    style={{ fontFamily: "Georgia, ui-serif, serif" }}
                  >
                    New arrivals
                  </h2>
                  <a href="#products-all" className="text-xs font-semibold uppercase tracking-[0.12em] !text-[#111111]">
                    View all
                  </a>
                </div>
                <div
                  id="products-all"
                  className={`grid grid-cols-2 gap-x-3 gap-y-6 ${
                    isPreviewMobile ? "" : "md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {visibleProducts.map((product) => {
                    const fallbackIndex = getProductFallbackIndex(product);

                    return (
                      <Theme1ProductCard
                        key={`all-${getTheme1ProductCardKey(product)}`}
                        fallbackIndex={fallbackIndex}
                        isSaved={isProductSaved(product, fallbackIndex)}
                        product={product}
                        onSelect={onProductSelect}
                        onToggleSaved={onToggleProductSaved}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {canLoadMoreProducts ? (
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleProductCount((current) =>
                      Math.min(current + 8, products.length)
                    )
                  }
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(17,17,17,0.18)]"
                >
                  View all products
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
