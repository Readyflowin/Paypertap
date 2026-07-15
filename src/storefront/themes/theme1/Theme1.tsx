import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ALL_COLLECTIONS,
  filterProductsByCollection,
  getUniqueCollections,
} from "../../collectionFilters";
import { useStorefrontWishlist } from "../../useStorefrontWishlist";
import type { StorefrontProduct, StorefrontThemeProps } from "../types";
import { Theme1EditorialFooter } from "./Theme1Footer";
import { Theme1Header } from "./Theme1Header";
import { Theme1HeroSection } from "./Theme1Hero";
import { Theme1BottomNav } from "./Theme1Navigation";
import { Theme1Sections } from "./Theme1Sections";
import {
  adaptTheme1Product,
  adaptTheme1Store,
  getTheme1ProductId,
  isTheme1VisibleProduct,
} from "./theme1Utils";

export { Theme1EditorialFooter as Theme1CleanFooter } from "./Theme1Footer";
export { Theme1Header as Theme1StorefrontChrome } from "./Theme1Header";

export default function Theme1({
  collections: managedCollections = [],
  isOwnerPreview,
  products,
  store,
  storeSlug,
}: StorefrontThemeProps) {
  const navigate = useNavigate();
  const [activeCollection, setActiveCollection] = useState(ALL_COLLECTIONS);
  const wishlist = useStorefrontWishlist({
    isPreview: isOwnerPreview,
    storeId: store.storeId,
    storeSlug,
  });
  const visibleProducts = useMemo(
    () => products.filter(isTheme1VisibleProduct),
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
  const displayedProducts = useMemo(
    () =>
      filterProductsByCollection(
        visibleProducts,
        selectedCollection,
        managedCollections
      ),
    [managedCollections, selectedCollection, visibleProducts]
  );
  const displayStore = useMemo(
    () =>
      adaptTheme1Store({
        collections: managedCollections,
        products: visibleProducts,
        store,
      }),
    [managedCollections, store, visibleProducts]
  );
  const featuredHeroProduct = visibleProducts[0]
    ? adaptTheme1Product(visibleProducts[0])
    : null;

  function getProductFallbackIndex(product: StorefrontProduct) {
    return Math.max(0, visibleProducts.indexOf(product));
  }

  function handleProductSelect(product: StorefrontProduct) {
    const productId = getTheme1ProductId(product);
    if (productId) {
      navigate(`/${storeSlug}/product/${productId}`);
    }
  }

  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-[#fffdfa] pb-24 text-[#111111] sm:pb-0">
      <Theme1Header
        collections={managedCollections}
        isPreviewMobile={false}
        onProductSelect={handleProductSelect}
        products={visibleProducts}
        store={store}
        storeSlug={storeSlug}
      />
      <Theme1HeroSection
        featuredProduct={featuredHeroProduct}
        store={displayStore}
        useFeaturedProductAsHeroImage
      />
      <Theme1Sections
        collections={managedCollections}
        getProductFallbackIndex={getProductFallbackIndex}
        isProductSaved={wishlist.isWishlisted}
        isPreviewMobile={false}
        onCollectionChange={setActiveCollection}
        onProductSelect={handleProductSelect}
        onToggleProductSaved={wishlist.toggleWishlistItem}
        products={displayedProducts}
        selectedCollection={selectedCollection}
        store={store}
        totalProductCount={visibleProducts.length}
      />
      <Theme1EditorialFooter
        collections={managedCollections}
        isPreviewMobile={false}
        store={store}
        storeSlug={storeSlug}
      />
      <Theme1BottomNav
        collections={managedCollections}
        products={visibleProducts}
        store={store}
        storeSlug={storeSlug}
      />
    </main>
  );
}
