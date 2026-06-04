import type { ComponentType, LazyExoticComponent, ReactElement } from "react";
import type { Product, Store, StoreCollection } from "@/types/firestore";

export type StorefrontThemeId = "theme1";

export type StorefrontStore = Store;
export type StorefrontProduct = Product;

export type StorefrontThemeProps = {
  store: StorefrontStore;
  products: StorefrontProduct[];
  storeSlug: string;
  collections?: StoreCollection[];
  isOwnerPreview?: boolean;
};

export type StorefrontThemeComponent =
  | ComponentType<StorefrontThemeProps>
  | LazyExoticComponent<ComponentType<StorefrontThemeProps>>;

export type StorefrontThemeDefinition = {
  id: StorefrontThemeId;
  name: string;
  description: string;
  previewLabel: string;
  component: StorefrontThemeComponent;
};
