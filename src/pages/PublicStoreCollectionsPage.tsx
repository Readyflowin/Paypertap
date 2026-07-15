import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Grid2X2, ImageIcon, Store as StoreIcon } from "lucide-react";

import { PptEmptyState, PptTapLoader } from "@/components/ui";
import { usePublicStore } from "@/hooks/usePublicStore";
import { getCollectionNameKey, getCollectionSlug } from "@/lib/collections";
import {
  filterProductsByCollection,
  getUniqueCollections,
} from "@/storefront/collectionFilters";
import { getProductGridImageUrl } from "@/storefront/imageMedia";
import { Theme1Header } from "@/storefront/themes/theme1/Theme1Header";
import { Theme1BottomNav } from "@/storefront/themes/theme1/Theme1Navigation";
import {
  getTheme1ProductId,
  getTheme1StoreDescription,
  isTheme1VisibleProduct,
} from "@/storefront/themes/theme1/theme1Utils";
import {
  Theme1ProductCard,
  getTheme1ProductCardKey,
} from "@/storefront/themes/theme1/Theme1ProductCard";
import { useStorefrontWishlist } from "@/storefront/useStorefrontWishlist";
import type { StoreCollection } from "@/types/firestore";
import type { StorefrontProduct } from "@/storefront/themes/types";

type CollectionCard = {
  imageUrl: string;
  name: string;
  productCount: number;
  routeKey: string;
};

function StorefrontLoadingState() {
  return (
    <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
      <PptTapLoader title="Loading collections..." />
    </main>
  );
}

function StorefrontErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
      <PptEmptyState
        title={title}
        description={description}
        icon={<StoreIcon size={22} />}
      />
    </main>
  );
}

function getManagedCollection(
  collectionName: string,
  managedCollections: StoreCollection[]
) {
  const collectionKey = getCollectionNameKey(collectionName);

  return managedCollections.find(
    (collection) => getCollectionNameKey(collection.name) === collectionKey
  );
}

function getCollectionRouteKey(
  collectionName: string,
  managedCollections: StoreCollection[]
) {
  const managedCollection = getManagedCollection(collectionName, managedCollections);
  return managedCollection?.slug || getCollectionSlug(collectionName);
}

function getCollectionNameFromRoute(
  routeKey: string | undefined,
  collectionNames: string[],
  managedCollections: StoreCollection[]
) {
  const normalizedRouteKey = decodeURIComponent(routeKey || "").trim().toLowerCase();
  if (!normalizedRouteKey) return "";

  return (
    collectionNames.find((collectionName) => {
      const managedCollection = getManagedCollection(collectionName, managedCollections);

      return [
        managedCollection?.slug,
        managedCollection?.collectionId,
        getCollectionSlug(collectionName),
      ]
        .filter(Boolean)
        .some((key) => String(key).toLowerCase() === normalizedRouteKey);
    }) || ""
  );
}

function buildCollectionCards(
  collectionNames: string[],
  products: StorefrontProduct[],
  managedCollections: StoreCollection[]
): CollectionCard[] {
  return collectionNames.map((collectionName) => {
    const collectionProducts = filterProductsByCollection(
      products,
      collectionName,
      managedCollections
    );

    return {
      imageUrl: collectionProducts[0]
        ? getProductGridImageUrl(collectionProducts[0])
        : "",
      name: collectionName,
      productCount: collectionProducts.length,
      routeKey: getCollectionRouteKey(collectionName, managedCollections),
    };
  });
}

function CollectionPlaceholder() {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f0ede7] text-[#736d64]">
      <ImageIcon size={24} aria-hidden="true" />
      <span className="text-xs font-semibold uppercase tracking-[0.12em]">
        Coming soon
      </span>
    </span>
  );
}

export default function PublicStoreCollectionsPage() {
  const { collectionSlug, storeSlug = "" } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = usePublicStore(storeSlug);

  const visibleProducts = useMemo(
    () => data?.products.filter(isTheme1VisibleProduct) ?? [],
    [data?.products]
  );
  const collectionNames = useMemo(
    () => getUniqueCollections(visibleProducts, data?.collections ?? []),
    [data?.collections, visibleProducts]
  );
  const collectionCards = useMemo(
    () =>
      buildCollectionCards(
        collectionNames,
        visibleProducts,
        data?.collections ?? []
      ),
    [collectionNames, data?.collections, visibleProducts]
  );
  const selectedCollection = useMemo(
    () =>
      getCollectionNameFromRoute(
        collectionSlug,
        collectionNames,
        data?.collections ?? []
      ),
    [collectionNames, collectionSlug, data?.collections]
  );
  const selectedProducts = useMemo(
    () =>
      selectedCollection
        ? filterProductsByCollection(
            visibleProducts,
            selectedCollection,
            data?.collections ?? []
          )
        : [],
    [data?.collections, selectedCollection, visibleProducts]
  );
  const wishlist = useStorefrontWishlist({
    isPreview: data?.isOwnerPreview,
    storeId: data?.store.storeId || "",
    storeSlug,
  });

  if (loading) {
    return <StorefrontLoadingState />;
  }

  if (!data) {
    const isNotFound = error === "Store not found";

    return (
      <StorefrontErrorState
        title={isNotFound ? "Store not found" : "Unable to load collections"}
        description={
          isNotFound
            ? "This store may be unavailable or not published yet."
            : "Please try again in a little while."
        }
      />
    );
  }

  if (collectionSlug && !selectedCollection) {
    return (
      <main className="min-h-screen bg-[#fffdfa] pb-24 text-[#111111]">
        <Theme1Header
          collections={data.collections}
          products={visibleProducts}
          store={data.store}
          storeSlug={storeSlug}
        />
        <section className="mx-auto grid min-h-[62vh] max-w-xl place-items-center px-4 py-12 text-center">
          <div>
            <Grid2X2 className="mx-auto text-[#8d867d]" size={28} aria-hidden="true" />
            <h1
              className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111111]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              Collection not found
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6f6b64]">
              Browse all available collections from this store.
            </p>
            <Link
              to={`/${storeSlug}/collections`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold !text-white"
            >
              View collections
            </Link>
          </div>
        </section>
        <Theme1BottomNav
          collections={data.collections}
          products={visibleProducts}
          store={data.store}
          storeSlug={storeSlug}
        />
      </main>
    );
  }

  function handleProductSelect(product: StorefrontProduct) {
    const productId = getTheme1ProductId(product);
    if (productId) {
      navigate(`/${storeSlug}/product/${productId}`);
    }
  }

  function getProductFallbackIndex(product: StorefrontProduct) {
    return Math.max(0, visibleProducts.indexOf(product));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdfa] pb-24 text-[#111111] sm:pb-0">
      <Theme1Header
        collections={data.collections}
        products={visibleProducts}
        store={data.store}
        storeSlug={storeSlug}
      />
      <section
        className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-9"
        style={{ animation: "theme1CollectionsIn 360ms ease-out both" }}
      >
        <Link
          to={selectedCollection ? `/${storeSlug}/collections` : `/${storeSlug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] !text-[#6f6b64] hover:!text-[#111111]"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {selectedCollection ? "All collections" : "Store home"}
        </Link>

        <div className="mt-5 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
            {data.store.storeName}
          </p>
          <h1
            className="mt-2 text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#111111] sm:text-5xl"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            {selectedCollection || "Collections"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6f6b64] sm:text-base">
            {selectedCollection
              ? `${selectedProducts.length} product${
                  selectedProducts.length === 1 ? "" : "s"
                } in this collection.`
              : getTheme1StoreDescription(data.store)}
          </p>
        </div>

        {selectedCollection ? (
          <div className="mt-8">
            {selectedProducts.length ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
                {selectedProducts.map((product) => {
                  const fallbackIndex = getProductFallbackIndex(product);

                  return (
                    <Theme1ProductCard
                      key={getTheme1ProductCardKey(product)}
                      fallbackIndex={fallbackIndex}
                      isSaved={wishlist.isWishlisted(product, fallbackIndex)}
                      onSelect={handleProductSelect}
                      onToggleSaved={wishlist.toggleWishlistItem}
                      product={product}
                    />
                  );
                })}
              </div>
            ) : (
              <section className="rounded-[24px] bg-[#f7f4ef] px-6 py-10 text-center">
                <h2 className="text-xl font-semibold text-[#111111]">
                  No products in this collection yet
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f6b64]">
                  Check another collection from this store.
                </p>
              </section>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collectionCards.length ? (
              collectionCards.map((collection) => (
                <Link
                  key={collection.name}
                  to={`/${storeSlug}/collections/${collection.routeKey}`}
                  className="group block min-w-0 overflow-hidden bg-white !text-[#111111] shadow-[0_14px_40px_rgba(17,17,17,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(17,17,17,0.1)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f0ede7]">
                    {collection.imageUrl ? (
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <CollectionPlaceholder />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111111]/70 to-transparent px-4 pb-4 pt-16 text-white">
                      <h2 className="line-clamp-2 text-xl font-semibold leading-tight">
                        {collection.name}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-4">
                    <p className="text-sm font-semibold text-[#111111]">
                      {collection.productCount} product
                      {collection.productCount === 1 ? "" : "s"}
                    </p>
                    <span className="text-sm font-semibold text-[#6f6b64]">
                      View
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <section className="rounded-[24px] bg-[#f7f4ef] px-6 py-10 text-center sm:col-span-2 lg:col-span-3">
                <Grid2X2 className="mx-auto text-[#8d867d]" size={28} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold text-[#111111]">
                  No collections available yet
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f6b64]">
                  This store is preparing its collections.
                </p>
              </section>
            )}
          </div>
        )}
      </section>
      <Theme1BottomNav
        collections={data.collections}
        products={visibleProducts}
        store={data.store}
        storeSlug={storeSlug}
      />
      <style>
        {`@keyframes theme1CollectionsIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }`}
      </style>
    </main>
  );
}
