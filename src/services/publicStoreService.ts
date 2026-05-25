import type { Product, Store, StoreCollection, Theme } from "../types/firestore";
import { listStoreCollections } from "./collectionService";
import {
  getPublicProductsByStoreId,
  getSellerProductsForStore,
} from "./productService";
import { getStoreBySlugOrId } from "./storeService";
import { getThemeById } from "./themeService";

export type PublicStoreData = {
  store: Store;
  theme: Theme | null;
  products: Product[];
  collections: StoreCollection[];
  isOwnerPreview: boolean;
};

export async function getPublicStoreData(
  storeId: string,
  viewerUid?: string | null
): Promise<PublicStoreData | null> {
  const store = await getStoreBySlugOrId(storeId);

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
  const collections = await listStoreCollections(store.storeId, products).catch(
    (error) => {
      console.warn("Failed to load store collections:", error);
      return [];
    }
  );

  return {
    store,
    theme,
    products,
    collections,
    isOwnerPreview,
  };
}
