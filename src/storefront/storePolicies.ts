import type { Store, StoreCollection } from "@/types/firestore";
import { buildWhatsAppUrl, normalizeIndianMobileInput } from "@/lib/phone";

export type StoreContactInfo = {
  displayName: string;
  ownerName: string;
  supportEmail: string;
  supportEmailHref: string;
  supportPhone: string;
  supportPhoneHref: string;
  whatsappPhone: string;
  whatsappUrl: string;
  instagramLabel: string;
  instagramUrl: string;
};

export type StorePolicyType = "privacy" | "returns" | "Order";

export type StorePolicyContent = {
  type: StorePolicyType;
  label: string;
  title: string;
  body: string[];
};

export const RETURNS_POLICY_LABELS: Record<
  NonNullable<Store["returnsPolicyType"]>,
  string
> = {
  returns_accepted: "Accept returns",
  exchange_only: "Exchange only",
  no_returns: "No returns",
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneForHref(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

function normalizePhoneForWhatsApp(value: string) {
  const normalized = normalizeIndianMobileInput(value);

  return normalized.ok ? normalized.whatsappNumber || "" : "";
}

function normalizeEmailHref(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? `mailto:${value}`
    : "";
}

function normalizeInstagram(store: Store) {
  const rawUrl = toText(store.instagramUrl);
  const rawHandle = toText(store.instagramHandle).replace(/^@+/, "");
  const rawProfile = rawUrl || rawHandle;

  if (rawUrl && /^https?:\/\/(www\.)?instagram\.com\//i.test(rawUrl)) {
    const handle = rawUrl
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .split(/[/?#]/)[0]
      .replace(/^@+/, "");

    return {
      label: handle ? `@${handle}` : "Instagram",
      url: rawUrl,
    };
  }

  const profileMatch = rawProfile
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .split(/[/?#]/)[0]
    .replace(/[^a-zA-Z0-9._]/g, "");

  if (profileMatch) {
    return {
      label: `@${profileMatch}`,
      url: `https://instagram.com/${profileMatch}`,
    };
  }

  return { label: "", url: "" };
}

export function getReturnsPolicyType(
  store: Store
): NonNullable<Store["returnsPolicyType"]> {
  const value = store.returnsPolicyType;

  if (
    value === "returns_accepted" ||
    value === "exchange_only" ||
    value === "no_returns"
  ) {
    return value;
  }

  return "exchange_only";
}

export function generateReturnsPolicy(store: Store): string {
  const notes = toText(store.returnsPolicyNotes);
  const baseCopy = {
    returns_accepted:
      "Returns are accepted as per seller confirmation. Please contact the seller on WhatsApp with your order details.",
    exchange_only:
      "Exchange may be available as per seller confirmation. Please contact the seller on WhatsApp with your order details.",
    no_returns:
      "Returns depend on the seller's store policy. Please check product details before Order.",
  }[getReturnsPolicyType(store)];

  return notes ? `${baseCopy} ${notes}` : baseCopy;
}

export function generatePrivacyPolicy(): string {
  return "Buyer contact and order details are used to process the order and connect with the seller. Payment and order information is used only for order and support purposes. PayPerTap does not sell buyer data to advertisers. Seller may contact the buyer on WhatsApp to complete the order.";
}

export function getPayPerTapOrderExplanation(): string {
  return "Place an order on PayPerTap without paying PayPerTap. The seller receives the order details and confirms payment, delivery, and fulfilment directly with you.";
}

export function getStorePolicyLinks(store: Store) {
  const returnsLabel = RETURNS_POLICY_LABELS[getReturnsPolicyType(store)];

  return [
    { type: "privacy" as const, label: "Privacy Policy" },
    { type: "returns" as const, label: `${returnsLabel} / Returns Policy` },
    { type: "Order" as const, label: "Order Terms" },
  ];
}

export function getStoreFooterSubheading(store: Store) {
  return (
    toText(store.heroSubtitle) ||
    toText(store.tagline) ||
    toText(store.bio) ||
    "Fresh finds, easy ordering, and seller confirmation on WhatsApp."
  );
}

export function getStoreFooterCollectionNames(
  collections: StoreCollection[] | undefined,
  limit = 5
) {
  if (!collections?.length) return [];

  return collections
    .map((collection) => toText(collection.name))
    .filter(Boolean)
    .slice(0, limit);
}

export function getStorePolicyContent(
  store: Store,
  policyType: string | undefined
): StorePolicyContent | null {
  const type = policyType as StorePolicyType | undefined;

  if (type === "privacy") {
    return {
      type,
      label: "Privacy Policy",
      title: "Privacy Policy",
      body: [generatePrivacyPolicy()],
    };
  }

  if (type === "returns") {
    return {
      type,
      label: "Returns Policy",
      title: "Refund / Returns Policy",
      body: [generateReturnsPolicy(store)],
    };
  }

  if (type === "Order") {
    return {
      type,
      label: "Order Terms",
      title: "Order Terms",
      body: [
        getPayPerTapOrderExplanation(),
        "Pay the seller directly through Cash on Delivery or the seller's configured payment link.",
      ],
    };
  }

  return null;
}

export function getStoreContactInfo(store: Store): StoreContactInfo {
  const displayName = toText(store.storeName) || "PayPerTap Store";
  const ownerName = toText(store.ownerName);
  const whatsappPhone =
    toText(store.whatsappPhone) ||
    toText(store.whatsappNumber) ||
    toText(store.phone);
  const supportPhone = toText(store.supportPhone) || whatsappPhone;
  const supportEmail = toText(store.supportEmail);
  const instagram = normalizeInstagram(store);
  const whatsappNormalized = normalizePhoneForWhatsApp(whatsappPhone);

  return {
    displayName,
    ownerName,
    supportEmail,
    supportEmailHref: normalizeEmailHref(supportEmail),
    supportPhone,
    supportPhoneHref: normalizePhoneForHref(supportPhone),
    whatsappPhone,
    whatsappUrl: whatsappNormalized ? buildWhatsAppUrl(whatsappPhone, "") || "" : "",
    instagramLabel: instagram.label,
    instagramUrl: instagram.url,
  };
}
