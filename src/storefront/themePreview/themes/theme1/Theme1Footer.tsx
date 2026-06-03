import { Theme1EditorialFooter } from "@/storefront/themes/theme1/Theme1Footer";
import type { PreviewStore } from "../../types";

export function Theme1Footer({
  isPreviewMobile = false,
  store,
}: {
  isPreviewMobile?: boolean;
  store: PreviewStore;
}) {
  return (
    <Theme1EditorialFooter
      isPreviewMobile={isPreviewMobile}
      store={{
        ...store,
        storeName: store.name,
        bio: "Curated streetwear and thrift drops. Powered by PayPerTap.",
      }}
    />
  );
}
