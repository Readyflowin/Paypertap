import type { CSSProperties } from "react";
import type { Store } from "@/types/firestore";

export const STORE_THEME_DEFAULTS = {
  backgroundColor: "#F7F7FA",
  textColor: "#111217",
  cardColor: "#FFFFFF",
  primaryColor: "#5B35F5",
  accentColor: "#16A34A",
  buttonColor: "#5B35F5",
  buttonTextColor: "#FFFFFF",
  heroHeading: "Shop limited pieces before they sell out.",
  heroSubtitle: "Reserve with ₹20. Confirm the rest on WhatsApp.",
  tagline: "Fresh drops, limited pieces.",
};

function isSafeHexColor(value?: string): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value.trim()));
}

function safeColor(value: string | undefined, fallback: string) {
  return isSafeHexColor(value) ? value.trim() : fallback;
}

export function getStoreThemeValues(store: Store) {
  return {
    backgroundColor: safeColor(
      store.backgroundColor,
      STORE_THEME_DEFAULTS.backgroundColor
    ),
    textColor: safeColor(store.textColor, STORE_THEME_DEFAULTS.textColor),
    cardColor: safeColor(store.cardColor, STORE_THEME_DEFAULTS.cardColor),
    primaryColor: safeColor(store.primaryColor, STORE_THEME_DEFAULTS.primaryColor),
    accentColor: safeColor(store.accentColor, STORE_THEME_DEFAULTS.accentColor),
    buttonColor: safeColor(store.buttonColor, STORE_THEME_DEFAULTS.buttonColor),
    buttonTextColor: safeColor(
      store.buttonTextColor,
      STORE_THEME_DEFAULTS.buttonTextColor
    ),
  };
}

export function getStoreThemeStyle(store: Store): CSSProperties {
  const theme = getStoreThemeValues(store);

  return {
    "--store-bg": theme.backgroundColor,
    "--store-text": theme.textColor,
    "--store-card": theme.cardColor,
    "--store-primary": theme.primaryColor,
    "--store-accent": theme.accentColor,
    "--store-button": theme.buttonColor,
    "--store-button-text": theme.buttonTextColor,
    "--pds-text": theme.textColor,
    "--pds-surface": theme.cardColor,
    "--pds-primary": theme.primaryColor,
    "--pds-success": theme.accentColor,
  } as CSSProperties;
}

export function getStoreHeroStyle(store: Store): CSSProperties {
  const theme = getStoreThemeValues(store);
  const preset = store.themeStyle || "clean-minimal";

  if (preset === "soft-boutique") {
    return {
      background: `radial-gradient(circle at 90% 10%, rgba(255,255,255,.28), transparent 28%), linear-gradient(135deg, ${theme.primaryColor} 0%, #8b5cf6 48%, #ec4899 100%)`,
    };
  }

  if (preset === "dark-drop") {
    return {
      background: `radial-gradient(circle at 85% 12%, rgba(255,255,255,.14), transparent 28%), linear-gradient(135deg, #111217 0%, #202237 52%, ${theme.primaryColor} 100%)`,
    };
  }

  if (preset === "streetwear-pop") {
    return {
      background: `radial-gradient(circle at 84% 18%, rgba(255,255,255,.25), transparent 24%), linear-gradient(135deg, #111217 0%, ${theme.primaryColor} 42%, ${theme.accentColor} 100%)`,
    };
  }

  return {
    background: `radial-gradient(circle at 90% 10%, rgba(255,255,255,.17), transparent 26%), linear-gradient(135deg, ${theme.primaryColor} 0%, #27165e 54%, ${theme.accentColor} 100%)`,
  };
}

export function getStoreThemeClass(store: Store): string {
  const themeStyle = store.themeStyle || "clean-minimal";

  if (themeStyle === "soft-boutique") return "ppt-store-theme-soft-boutique";
  if (themeStyle === "dark-drop") return "ppt-store-theme-dark-drop";
  if (themeStyle === "streetwear-pop") return "ppt-store-theme-streetwear-pop";
  return "ppt-store-theme-clean-minimal";
}

export function getStoreFontClass(store: Store): string {
  const fontStyle = store.fontStyle || "clean-sans";

  if (fontStyle === "boutique-serif") return "ppt-store-font-boutique-serif";
  if (fontStyle === "bold-street") return "ppt-store-font-bold-street";
  if (fontStyle === "minimal-modern") return "ppt-store-font-minimal-modern";
  return "ppt-store-font-clean-sans";
}

export function getStoreTagline(store: Store): string {
  return store.tagline || store.bio || STORE_THEME_DEFAULTS.tagline;
}

export function getStoreInstagramUrl(store: Store): string {
  const maybeStore = store as Store & {
    instagram?: string;
    socialLinks?: { instagram?: string };
  };

  if (maybeStore.instagramUrl) return maybeStore.instagramUrl;
  if (maybeStore.instagramHandle) {
    return `https://instagram.com/${maybeStore.instagramHandle.replace(/^@+/, "")}`;
  }

  return maybeStore.instagram || maybeStore.socialLinks?.instagram || "";
}
