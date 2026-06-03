import { Theme1HeroSection } from "@/storefront/themes/theme1/Theme1Hero";
import type { PreviewProduct, PreviewStore } from "../../types";

export function Theme1Hero({
  featuredProduct,
  isPreviewMobile = false,
  store,
}: {
  featuredProduct: PreviewProduct;
  isPreviewMobile?: boolean;
  store: PreviewStore;
}) {
  return (
    <Theme1HeroSection
      featuredProduct={featuredProduct}
      isPreviewMobile={isPreviewMobile}
      store={{
        ...store,
        name: store.name,
        storeName: store.name,
      }}
      useFeaturedProductAsHeroImage
    />
  );
}
