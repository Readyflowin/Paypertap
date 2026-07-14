import { getDisplayImageUrl } from "@/lib/imageUrls";
import {
  getAvailableQuantity,
  getProductUnavailableLabel,
  isProductBookable,
} from "@/lib/productAvailability";
import { getProductGridImageUrl } from "../../imageMedia";
import {
  getStoreFooterCollectionNames,
  getStoreFooterSubheading,
} from "../../storePolicies";
import { getProductCollection } from "../../collectionFilters";
import type { StorefrontProduct, StorefrontThemeProps } from "../types";

type FlexibleProduct = StorefrontProduct & {
  name?: unknown;
  slug?: unknown;
};

type FlexibleStore = StorefrontThemeProps["store"] & {
  announcement?: unknown;
  announcementText?: unknown;
  description?: unknown;
  storeDescription?: unknown;
  instagramProfile?: unknown;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getTheme1Initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getTheme1ProductId(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;
  return product.productId || product.id || toText(flexibleProduct.slug);
}

export function getTheme1ProductTitle(product: StorefrontProduct) {
  const flexibleProduct = product as FlexibleProduct;
  return product.title || toText(flexibleProduct.name) || "Untitled product";
}

export function getTheme1ProductPrice(product: StorefrontProduct) {
  const rawPrice = (product as { price?: unknown }).price;
  const price =
    typeof rawPrice === "string"
      ? Number(rawPrice.replace(/[^\d.]/g, ""))
      : Number(rawPrice || 0);

  return Number.isFinite(price) ? price : 0;
}

export function getTheme1ProductDescription(product: StorefrontProduct) {
  return product.description || "";
}

export function getTheme1ProductStatus(product: StorefrontProduct) {
  return toText(product.status).toLowerCase();
}

export function isTheme1VisibleProduct(product: StorefrontProduct) {
  const status = getTheme1ProductStatus(product);
  if (!status) return true;
  return ["open", "hold", "sold", "reserved"].includes(status);
}

export function getTheme1ProductBadge(product: StorefrontProduct) {
  const status = getTheme1ProductStatus(product);
  if (status === "sold") return "Sold out";
  if (status === "hold" || status === "reserved") return "Reserved";
  if (!isProductBookable(product)) return "Unavailable";

  const available = getAvailableQuantity(product);
  if (available === 1) return "1 left";
  if (available > 1) return `${available} available`;

  return "Available";
}

export function getTheme1ProductCta(product: StorefrontProduct) {
  return isProductBookable(product) ? "View piece" : getProductUnavailableLabel(product);
}

export function getTheme1StoreLogoUrl(store: StorefrontThemeProps["store"]) {
  return getDisplayImageUrl(store.logoUrl || store.storeLogoUrl);
}

export function getTheme1StoreAnnouncement(store: StorefrontThemeProps["store"]) {
  const flexibleStore = store as FlexibleStore;
  return (
    toText(flexibleStore.announcementText) ||
    toText(flexibleStore.announcement) ||
    "LIMITED DROP LIVE - ORDER BEFORE IT'S GONE"
  );
}

export function getTheme1StoreName(store: StorefrontThemeProps["store"]) {
  return store.storeName || "PayPerTap Store";
}

export function getTheme1StoreLogoText(store: StorefrontThemeProps["store"]) {
  return getTheme1Initials(getTheme1StoreName(store)) || "PT";
}

export function getTheme1StoreDescription(store: StorefrontThemeProps["store"]) {
  const flexibleStore = store as FlexibleStore;
  return (
    toText(flexibleStore.storeDescription) ||
    toText(flexibleStore.description) ||
    toText(store.bio) ||
    toText(store.tagline) ||
    "Fresh finds, easy ordering, and seller confirmation on WhatsApp."
  );
}

export function getTheme1StoreHeroTitle(store: StorefrontThemeProps["store"]) {
  return store.heroTitle || store.heroHeading || "";
}

export function getTheme1StoreHeroSubtitle(store: StorefrontThemeProps["store"]) {
  return store.heroSubtitle || "";
}

export function getTheme1StoreHeroEyebrowText(store: StorefrontThemeProps["store"]) {
  return store.heroEyebrowText || "";
}

export function getTheme1StoreHeroPrimaryCtaText(store: StorefrontThemeProps["store"]) {
  return store.heroPrimaryCtaText || "";
}

export function getTheme1StoreHeroSecondaryCtaText(store: StorefrontThemeProps["store"]) {
  return store.heroSecondaryCtaText || "";
}

export function getTheme1Collections(
  products: StorefrontProduct[],
  managedCollections: StorefrontThemeProps["collections"] = []
) {
  const managed = getStoreFooterCollectionNames(managedCollections, 8);
  const productCollections = products
    .map((product) => getProductCollection(product))
    .filter(Boolean);
  return Array.from(new Set([...managed, ...productCollections])).slice(0, 8);
}

export function getTheme1TrustBadges(store: StorefrontThemeProps["store"]) {
  const description = getStoreFooterSubheading(store);
  return [
    "Verified order",
    "Limited stock",
    "WhatsApp confirmation",
    description.includes("return") ? "Seller policies" : "Direct seller payment",
    "UPI accepted",
    "Seller confirmation",
  ];
}

export function getTheme1SocialProof(
  store: StorefrontThemeProps["store"],
  products: StorefrontProduct[]
) {
  return [
    `${products.length} live piece${products.length === 1 ? "" : "s"}`,
    "Verified order",
    "WhatsApp confirmation",
  ];
}

export function adaptTheme1Product(product: StorefrontProduct) {
  return {
    id: getTheme1ProductId(product),
    title: getTheme1ProductTitle(product),
    price: getTheme1ProductPrice(product),
    compareAtPrice: (product as { compareAtPrice?: number }).compareAtPrice,
    imageUrl: getProductGridImageUrl(product),
    collection: getProductCollection(product) || "New Drop",
    badge: getTheme1ProductBadge(product),
    scarcity: getTheme1ProductBadge(product),
    description: getTheme1ProductDescription(product),
    source: product,
  };
}

export function adaptTheme1Store({
  collections,
  products,
  store,
}: {
  collections?: StorefrontThemeProps["collections"];
  products: StorefrontProduct[];
  store: StorefrontThemeProps["store"];
}) {
  return {
    name: getTheme1StoreName(store),
    logoText: getTheme1StoreLogoText(store),
    logoUrl: getTheme1StoreLogoUrl(store),
    announcement: getTheme1StoreAnnouncement(store),
    heroImageUrl: getDisplayImageUrl(store.heroImageUrl),
    heroTitle: getTheme1StoreHeroTitle(store),
    heroSubtitle: getTheme1StoreHeroSubtitle(store),
    heroEyebrowText: getTheme1StoreHeroEyebrowText(store),
    heroPrimaryCtaText: getTheme1StoreHeroPrimaryCtaText(store),
    heroSecondaryCtaText: getTheme1StoreHeroSecondaryCtaText(store),
    story: getTheme1StoreDescription(store),
    socialProof: getTheme1SocialProof(store, products),
    trustBadges: getTheme1TrustBadges(store),
    collections: getTheme1Collections(products, collections),
    source: store,
  };
}
