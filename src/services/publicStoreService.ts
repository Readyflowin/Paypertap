import type { Product, Store, StoreCollection } from "../types/firestore";
import { listStoreCollections } from "./collectionService";
import {
  getPublicProductsByStoreId,
  getSellerProductsForStore,
} from "./productService";
import { getStoreBySlugOrId } from "./storeService";

export type PublicStoreData = {
  store: Store;
  products: Product[];
  collections: StoreCollection[];
  isOwnerPreview: boolean;
};

export type PublicStoreShellData = {
  store: Store;
  isOwnerPreview: boolean;
};

export async function getPublicStoreShellData(
  storeId: string,
  viewerUid?: string | null
): Promise<PublicStoreShellData | null> {
  const store = await getStoreBySlugOrId(storeId);

  if (!store) {
    return null;
  }

  const isOwner = Boolean(viewerUid && viewerUid === store.sellerId);
  const isOwnerPreview = !store.isPublished && isOwner;

  if (!store.isPublished && !isOwner) {
    return null;
  }

  return {
    store,
    isOwnerPreview,
  };
}

export async function getPublicStoreData(
  storeId: string,
  viewerUid?: string | null
): Promise<PublicStoreData | null> {
  const storeShell = await getPublicStoreShellData(storeId, viewerUid);

  if (!storeShell) {
    return null;
  }

  const { store, isOwnerPreview } = storeShell;

  const products = await (
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
        })
  );
  const collections = await listStoreCollections(store.storeId, products).catch(
    (error) => {
      console.warn("Failed to load store collections:", error);
      return [];
    }
  );

  return {
    store,
    products,
    collections,
    isOwnerPreview,
  };
}
