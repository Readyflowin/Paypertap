import type { ReactElement } from "react";
import type { Product, Store, StoreCollection } from "@/types/firestore";

export type StorefrontThemeId = "theme1" | "theme2" | "theme3";

export type StorefrontStore = Store;
export type StorefrontProduct = Product;

export type StorefrontThemeProps = {
  store: StorefrontStore;
  products: StorefrontProduct[];
  storeSlug: string;
  collections?: StoreCollection[];
  isOwnerPreview?: boolean;
};

export type StorefrontThemeComponent = (props: StorefrontThemeProps) => ReactElement;

export type StorefrontThemeDefinition = {
  id: StorefrontThemeId;
  name: string;
  description: string;
  previewLabel: string;
  component: StorefrontThemeComponent;
};
