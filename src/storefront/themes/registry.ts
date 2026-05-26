import Theme1 from "./theme1/Theme1";
import Theme2 from "./theme2/Theme2";
import Theme3 from "./theme3/Theme3";
import type {
  StorefrontThemeDefinition,
  StorefrontThemeId,
} from "./types";

export const DEFAULT_STOREFRONT_THEME_ID: StorefrontThemeId = "theme1";

export const storefrontThemeRegistry: Record<
  StorefrontThemeId,
  StorefrontThemeDefinition
> = {
  theme1: {
    id: "theme1",
    name: "Conversion Clean",
    description: "Fast, focused storefront for clear product browsing and high-intent bookings.",
    previewLabel: "Clean CRO",
    component: Theme1,
  },
  theme2: {
    id: "theme2",
    name: "Boutique Edit",
    description: "Warm editorial storefront for fashion, thrift, boutique, and handmade sellers.",
    previewLabel: "Boutique CRO",
    component: Theme2,
  },
  theme3: {
    id: "theme3",
    name: "Drop Mode",
    description: "Bold storefront for limited drops, creator-led launches, and urgency-led sales.",
    previewLabel: "Drop CRO",
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
