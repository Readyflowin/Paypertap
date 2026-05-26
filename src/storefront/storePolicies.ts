import type { Store } from "@/types/firestore";

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

export type StorePolicyType = "privacy" | "returns" | "booking";

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
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
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
      "Returns are not accepted unless the seller confirms otherwise. Please check product details before booking.",
  }[getReturnsPolicyType(store)];

  return notes ? `${baseCopy} ${notes}` : baseCopy;
}

export function generatePrivacyPolicy(): string {
  return "Buyer contact and order details are used to process the booking and connect with the seller. Payment and booking information is used only for order and support purposes. PayPerTap does not sell buyer data to advertisers. Seller may contact the buyer on WhatsApp to complete the order.";
}

export function getPayPerTapBookingExplanation(): string {
  return "PayPerTap collects a fixed ₹20 verified-booking fee. The seller does not receive this ₹20. The buyer pays the remaining product amount directly to the seller on WhatsApp, UPI, or COD, and the seller confirms order and delivery on WhatsApp.";
}

export function getStorePolicyLinks(store: Store) {
  const returnsLabel = RETURNS_POLICY_LABELS[getReturnsPolicyType(store)];

  return [
    { type: "privacy" as const, label: "Privacy Policy" },
    { type: "returns" as const, label: `${returnsLabel} / Returns Policy` },
    { type: "booking" as const, label: "PayPerTap Booking Terms" },
  ];
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

  if (type === "booking") {
    return {
      type,
      label: "PayPerTap Booking Terms",
      title: "PayPerTap Booking Terms",
      body: [
        getPayPerTapBookingExplanation(),
        "This booking fee verifies buyer intent and reserves the item for seller follow-up. PayPerTap does not process the remaining product payment.",
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
    whatsappUrl: whatsappNormalized ? `https://wa.me/${whatsappNormalized}` : "",
    instagramLabel: instagram.label,
    instagramUrl: instagram.url,
  };
}
