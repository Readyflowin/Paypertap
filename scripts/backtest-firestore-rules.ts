import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const rules = readFileSync(resolve(root, "firestore.rules"), "utf8");

function extractQuotedValues(block: string): string[] {
  return Array.from(block.matchAll(/"([^"]+)"/g), (match) => match[1]);
}

function extractFunctionArray(functionName: string): Set<string> {
  const pattern = new RegExp(
    `function\\s+${functionName}\\s*\\(\\)\\s*{\\s*return\\s*\\[([\\s\\S]*?)\\];\\s*}`,
    "m"
  );
  const match = rules.match(pattern);

  if (!match) {
    throw new Error(`Could not find ${functionName}() array in firestore.rules.`);
  }

  return new Set(extractQuotedValues(match[1]));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMatchBlock(matchPath: string): string {
  const pattern = new RegExp(`match\\s+${escapeRegExp(matchPath)}\\s*\\{`, "m");
  const match = rules.match(pattern);

  if (!match || match.index === undefined) {
    throw new Error(`Could not find ${matchPath} block in firestore.rules.`);
  }

  const openingBrace = match.index + match[0].lastIndexOf("{");
  let depth = 0;

  for (let index = openingBrace; index < rules.length; index += 1) {
    const char = rules[index];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return rules.slice(openingBrace + 1, index);
      }
    }
  }

  throw new Error(`Could not parse ${matchPath} block in firestore.rules.`);
}

function extractUpdateAllowlist(matchPath: string): Set<string> {
  const block = extractMatchBlock(matchPath);
  const match = block.match(/allow\s+update:[\s\S]*?hasOnlyChanged\(\[([\s\S]*?)\]\)/m);

  if (!match) {
    throw new Error(`Could not find update hasOnlyChanged() allowlist in ${matchPath}.`);
  }

  return new Set(extractQuotedValues(match[1]));
}

function assertSubset(label: string, actual: string[], allowed: Set<string>) {
  const missing = actual.filter((key) => !allowed.has(key));

  if (missing.length > 0) {
    throw new Error(`${label} has keys not allowed by rules: ${missing.join(", ")}`);
  }
}

const sellerKeys = extractFunctionArray("sellerKeys");
const sellerUpdateKeys = extractUpdateAllowlist("/sellers/{sellerId}");
const storeProtectedKeys = extractFunctionArray("storeOwnerProtectedKeys");
const productProtectedKeys = extractFunctionArray("productProtectedOwnerKeys");

function assertNotProtected(label: string, actual: string[], protectedKeys: Set<string>) {
  const blocked = actual.filter((key) => protectedKeys.has(key));

  if (blocked.length > 0) {
    throw new Error(`${label} changes protected keys: ${blocked.join(", ")}`);
  }
}

function assertProtected(label: string, actual: string[], protectedKeys: Set<string>) {
  const missing = actual.filter((key) => !protectedKeys.has(key));

  if (missing.length > 0) {
    throw new Error(`${label} expected protected keys missing from rules: ${missing.join(", ")}`);
  }
}

const storeOwnerSafeChangedKeys = [
  "storeName",
  "storeDescription",
  "description",
  "bio",
  "logoUrl",
  "storeLogoUrl",
  "heroTitle",
  "heroSubtitle",
  "heroImageUrl",
  "themeId",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "paymentMode",
  "advanceAmount",
  "paymentProvider",
  "paymentLink",
  "phone",
  "whatsappPhone",
  "instagramProfile",
  "instagramUrl",
  "instagramHandle",
  "isPublished",
  "updatedAt",
  "futurePresentationField",
];

const storeProtectedChangedKeys = [
  "sellerId",
  "storeId",
  "storeSlug",
  "paymentReturnToken",
  "acceptingOrders",
  "pauseReason",
  "emailEvents",
  "adminOnboardingEmailSentAt",
  "createdAt",
];

const storeCustomizationChangedKeys = [
  "updatedAt",
  "storeName",
  "bio",
  "phone",
  "whatsappPhone",
  "supportPhone",
  "ownerName",
  "supportEmail",
  "returnsPolicyType",
  "returnsPolicyNotes",
  "logoUrl",
  "storeLogoUrl",
  "heroTitle",
  "heroSubtitle",
  "heroEyebrowText",
  "heroPrimaryCtaText",
  "heroSecondaryCtaText",
  "heroImageUrl",
  "heroImageKey",
  "announcementText",
  "primaryColor",
  "accentColor",
  "instagramProfile",
  "instagramUrl",
];

const storePaymentSettingsChangedKeys = [
  "paymentMode",
  "advanceAmount",
  "paymentProvider",
  "paymentLink",
  "updatedAt",
];

const storePublishChangedKeys = ["isPublished", "updatedAt"];

const productOwnerSafeChangedKeys = [
  "title",
  "description",
  "price",
  "category",
  "categoryName",
  "collectionId",
  "collectionName",
  "images",
  "imageUrl",
  "thumbnailUrl",
  "sizeChartImage",
  "sizeChartImageUrl",
  "sizeChartImageKey",
  "status",
  "isFeatured",
  "sortOrder",
  "inventoryQuantity",
  "hasVariants",
  "variantOptions",
  "variants",
  "defaultVariantId",
  "metadata",
  "futurePresentationField",
  "updatedAt",
];

const productProtectedChangedKeys = [
  "id",
  "sellerId",
  "storeId",
  "productId",
  "reservedQuantity",
  "soldQuantity",
  "emailEvents",
  "createdAt",
];

const sellerMinimalCreateKeys = [
  "sellerId",
  "authUid",
  "name",
  "email",
  "phone",
  "storeId",
  "status",
  "razorpayLinked",
  "profileImageUrl",
  "onboardingStatus",
  "onboardingStep",
  "createdAt",
  "updatedAt",
];

const sellerOnboardingChangedKeys = [
  "name",
  "phone",
  "storeId",
  "status",
  "razorpayLinked",
  "profileImageUrl",
  "onboardingStatus",
  "onboardingStep",
  "updatedAt",
];

assertSubset("seller create payload", sellerMinimalCreateKeys, sellerKeys);
assertSubset("seller onboarding update payload", sellerOnboardingChangedKeys, sellerUpdateKeys);
assertNotProtected("store owner safe payload", storeOwnerSafeChangedKeys, storeProtectedKeys);
assertNotProtected("store customization payload", storeCustomizationChangedKeys, storeProtectedKeys);
assertNotProtected("store payment settings payload", storePaymentSettingsChangedKeys, storeProtectedKeys);
assertNotProtected("store publish payload", storePublishChangedKeys, storeProtectedKeys);
assertProtected("store protected payload", storeProtectedChangedKeys, storeProtectedKeys);
assertNotProtected("product owner safe payload", productOwnerSafeChangedKeys, productProtectedKeys);
assertProtected("product protected payload", productProtectedChangedKeys, productProtectedKeys);

console.log("Firestore rule compatibility backtest passed.");
