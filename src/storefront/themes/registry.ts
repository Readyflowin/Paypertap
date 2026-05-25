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
    name: "Theme 1",
    description: "Clean storefront foundation for the first premium PayPerTap theme.",
    previewLabel: "Clean",
    component: Theme1,
  },
  theme2: {
    id: "theme2",
    name: "Theme 2",
    description: "Editorial boutique storefront for fashion, thrift and handmade sellers.",
    previewLabel: "Boutique",
    component: Theme2,
  },
  theme3: {
    id: "theme3",
    name: "Theme 3",
    description: "Bold drop-style storefront for limited releases and creator-led shops.",
    previewLabel: "Drop",
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
