import { lazy } from "react";
import type {
  StorefrontThemeDefinition,
  StorefrontThemeId,
} from "./types";

export const DEFAULT_STOREFRONT_THEME_ID: StorefrontThemeId = "theme1";

const Theme1 = lazy(() => import("./theme1/Theme1"));
const Theme2 = lazy(() => import("./theme2/Theme2"));
const Theme3 = lazy(() => import("./theme3/Theme3"));

export const storefrontThemeRegistry: Record<
  StorefrontThemeId,
  StorefrontThemeDefinition
> = {
  theme1: {
    id: "theme1",
    name: "Editorial Thrift",
    description: "Premium streetwear storefront for limited drops, one-off pieces, and WhatsApp-confirmed bookings.",
    previewLabel: "Editorial Thrift",
    component: Theme1,
  },
  theme2: {
    id: "theme2",
    name: "Boutique Style",
    description: "Warm editorial storefront for fashion, thrift, boutique, and handmade sellers.",
    previewLabel: "Boutique Style",
    component: Theme2,
  },
  theme3: {
    id: "theme3",
    name: "Drop Style",
    description: "Bold storefront for limited drops, creator-led launches, and urgency-led sales.",
    previewLabel: "Drop Style",
    component: Theme3,
  },
};

export function isStorefrontThemeId(value?: string | null): value is StorefrontThemeId {
  return value === "theme1" || value === "theme2" || value === "theme3";
}

export function getStorefrontThemeDefinition(
  themeId?: string | null
): StorefrontThemeDefinition {
  if (isStorefrontThemeId(themeId)) {
    return storefrontThemeRegistry[themeId];
  }

  return storefrontThemeRegistry[DEFAULT_STOREFRONT_THEME_ID];
}
