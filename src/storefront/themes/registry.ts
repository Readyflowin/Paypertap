import { lazy } from "react";
import type {
  StorefrontThemeDefinition,
  StorefrontThemeId,
} from "./types";

export const DEFAULT_STOREFRONT_THEME_ID: StorefrontThemeId = "theme1";

const Theme1 = lazy(() => import("./theme1/Theme1"));

export const storefrontThemeRegistry: Record<
  StorefrontThemeId,
  StorefrontThemeDefinition
> = {
  theme1: {
    id: "theme1",
    name: "Editorial Thrift",
    description: "Premium streetwear storefront for limited drops, one-off pieces, and WhatsApp-confirmed Orders.",
    previewLabel: "Editorial Thrift",
    component: Theme1,
  },
};

export function isStorefrontThemeId(value?: string | null): value is StorefrontThemeId {
  return value === "theme1";
}

export function getStorefrontThemeDefinition(
  themeId?: string | null
): StorefrontThemeDefinition {
  if (isStorefrontThemeId(themeId)) {
    return storefrontThemeRegistry[themeId];
  }

  return storefrontThemeRegistry[DEFAULT_STOREFRONT_THEME_ID];
}
