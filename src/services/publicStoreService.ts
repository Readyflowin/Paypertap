import type { Product, Store, Theme } from "../types/firestore";
import {
  getPublicProductsByStoreId,
  getSellerProductsForStore,
} from "./productService";
import { getStoreById } from "./storeService";
import { getThemeById } from "./themeService";

export type PublicStoreData = {
  store: Store;
  theme: Theme | null;
  products: Product[];
  isOwnerPreview: boolean;
};

export async function getPublicStoreData(
  storeId: string,
  viewerUid?: string | null
): Promise<PublicStoreData | null> {
  const store = await getStoreById(storeId);

  if (!store) {
    return null;
  }

  const isOwner = Boolean(viewerUid && viewerUid === store.sellerId);
  const isOwnerPreview = !store.isPublished && isOwner;

  if (!store.isPublished && !isOwner) {
    return null;
  }

  const [theme, products] = await Promise.all([
    getThemeById(store.themeId).catch((error) => {
      console.warn("Failed to load store theme:", error);
      return null;
    }),
    isOwnerPreview && viewerUid
      ? getSellerProductsForStore(viewerUid, store.storeId)
          .then((ownerProducts) =>
            ownerProducts.filter((product) =>
              ["open", "draft"].includes(product.status)
            )
          )
          .catch((error) => {
            console.warn("Failed to load owner preview products:", error);
            return [];
          })
      : getPublicProductsByStoreId(store.storeId).catch((error) => {
          console.warn("Failed to load store products:", error);
          return [];
        }),
  ]);

  return {
    store,
    theme,
    products,
    isOwnerPreview,
  };
}
