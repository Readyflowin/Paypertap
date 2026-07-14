import { buildWhatsAppUrl, normalizeIndianMobileInput } from "../lib/phone";
import { getVariantDetailsText } from "../lib/productVariants";
import type { CheckoutSession, DerivedCustomerLead, Product, Store } from "../types/firestore";

type BuyerOrderInput = {
  storeSlug: string;
  storeName?: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  advanceAmount?: number;
  paymentAmount?: number;
  sellerAmountDue?: number;
  paymentMode?: "cod" | "partial_advance";
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
};

type SellerMessageInput = {
  buyerName: string;
  productTitle: string;
  sellerAmountDue?: number;
  advanceAmount?: number;
  paymentAmount?: number;
  paymentMode?: "cod" | "partial_advance";
  sellerUpiId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
};

type RetargetingInput = {
  buyerName: string;
  storeLink?: string;
  product?: Product;
};

function getOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

export function normalizeIndianPhone(phone?: string): string | null {
  const normalized = normalizeIndianMobileInput(phone || "");

  return normalized.ok ? normalized.whatsappNumber || null : null;
}

function getStoreUpiId(store?: Store | null): string {
  const maybeUpi = (store as unknown as { sellerUpiId?: string; upiId?: string }) || {};

  return maybeUpi.sellerUpiId || maybeUpi.upiId || "";
}

export function getStoreWhatsAppPhone(store?: Store | null): string | null {
  const phone = store?.whatsappPhone || store?.phone || "";
  const normalized = normalizeIndianMobileInput(phone);

  return normalized.ok ? normalized.localNumber || null : null;
}

export function buildBuyerOrderMessage(input: BuyerOrderInput): string {
  const productUrl = `${getOrigin()}/${input.storeSlug}/product/${input.productId}`;
  const variantDetails = getVariantDetailsText(input);
  const storeName = input.storeName?.trim() || "this store";
  const isPartialAdvance = input.paymentMode === "partial_advance";
  const paymentAmount = Math.max(
    0,
    Math.round(Number(input.paymentAmount ?? input.advanceAmount) || 0)
  );
  const sellerAmountDue = Math.max(0, Math.round(Number(input.sellerAmountDue) || 0));
  const paymentLines = isPartialAdvance
    ? [
        `Advance to seller: Rs ${paymentAmount}`,
        `Remaining amount with seller: Rs ${sellerAmountDue}`,
      ]
    : [
        "Payment mode: Cash on Delivery",
        `Amount to collect: Rs ${input.productPrice}`,
      ];
  const closingLine = isPartialAdvance
    ? "Please confirm payment receipt and delivery details."
    : "Please confirm availability, delivery, and payment details.";

  return [
    `Hi, I placed an order on ${storeName}`,
    "",
    `Product: ${input.productTitle}`,
    ...(variantDetails ? [`Variant: ${variantDetails}`] : []),
    `Product link: ${productUrl}`,
    `Price: Rs ${input.productPrice}`,
    "",
    ...paymentLines,
    "",
    "My details:",
    `Name: ${input.buyerName}`,
    `Phone: ${input.buyerPhone}`,
    `Address: ${input.buyerAddress}`,
    `City: ${input.buyerCity}`,
    `Pincode: ${input.buyerPincode}`,
    "",
    closingLine,
  ].join("\n");
}

export function buildBuyerOrderWhatsAppUrl(
  store: Store | null,
  message: string
): string | null {
  return buildWhatsAppUrl(store?.whatsappPhone || store?.phone || "", message);
}

export function buildSellerPaymentCollectionMessage(
  input: SellerMessageInput
): string {
  const variantDetails = getVariantDetailsText(input);
  const isPartialAdvance = input.paymentMode === "partial_advance";
  const base = [
    `Hi ${input.buyerName}, thanks for ordering ${input.productTitle} from our store.`,
    ...(variantDetails ? [`Variant: ${variantDetails}`] : []),
    "",
    isPartialAdvance
      ? `Advance amount: Rs ${input.paymentAmount || input.advanceAmount || 0}.`
      : "Payment mode: Cash on Delivery.",
    `Amount due with seller: Rs ${input.sellerAmountDue || 0}.`,
    "Please confirm payment and delivery details here.",
    "",
  ];

  if (input.sellerUpiId?.trim()) {
    return [
      ...base,
      "Please pay here:",
      `UPI ID: ${input.sellerUpiId.trim()}`,
      "",
      "After payment, please share the screenshot here so we can confirm your delivery.",
    ].join("\n");
  }

  return [
    ...base,
    "Please complete payment as discussed. After payment, share the screenshot here so we can confirm your delivery.",
  ].join("\n");
}

export function buildDeliveryDetailsMessage(input: SellerMessageInput): string {
  const variantDetails = getVariantDetailsText(input);

  return [
    `Hi ${input.buyerName}, please confirm your delivery details:`,
    ...(variantDetails ? [`Product option: ${variantDetails}`] : []),
    "",
    "Name:",
    "Phone:",
    "Address:",
    "City:",
    "Pincode:",
    "",
    "Once payment is confirmed, we will process your order.",
  ].join("\n");
}

export function buildOrderConfirmedMessage(input: SellerMessageInput): string {
  const variantDetails = getVariantDetailsText(input);

  return [
    "Your order is confirmed. Thank you for shopping with us.",
    "",
    `Product: ${input.productTitle}`,
    ...(variantDetails ? [`Variant: ${variantDetails}`] : []),
    "",
    "We will update you shortly with delivery details.",
  ].join("\n");
}

export function buildOrderWhatsAppUrl(phone: string, message: string): string {
  return buildWhatsAppUrl(phone, message) || "#";
}

export function buildNewDropRetargetingMessage(input: RetargetingInput): string {
  if (input.product) {
    const productUrl = `${input.storeLink || getOrigin()}/product/${
      input.product.productId || input.product.id
    }`;

    return [
      `Hi ${input.buyerName}, we just added a new item you may like:`,
      "",
      input.product.title,
      `Rs ${input.product.price}`,
      `Order here: ${productUrl}`,
      "",
      "Limited quantity available.",
    ].join("\n");
  }

  return [
    `Hi ${input.buyerName}, we have new products available on our PayPerTap store.`,
    `Check here: ${input.storeLink || getOrigin()}`,
  ].join("\n");
}

export function buildRetargetingMessage(
  customer: DerivedCustomerLead,
  storeLink: string
): string {
  return buildNewDropRetargetingMessage({
    buyerName: customer.buyerName,
    storeLink,
  });
}

export function buildRetargetingWhatsAppUrl(phone: string, message: string): string {
  return buildOrderWhatsAppUrl(phone, message);
}

export function getSellerUpiId(store?: Store | null): string {
  return getStoreUpiId(store);
}

export function checkoutToSellerMessageInput(
  checkoutSession: CheckoutSession,
  store?: Store | null
): SellerMessageInput {
  return {
    buyerName: checkoutSession.buyerName,
    productTitle: checkoutSession.productTitle,
    sellerAmountDue: checkoutSession.sellerAmountDue,
    advanceAmount: checkoutSession.advanceAmount,
    paymentAmount: checkoutSession.paymentAmount,
    paymentMode: checkoutSession.paymentMode,
    selectedVariantLabel: checkoutSession.selectedVariantLabel,
    selectedVariantOptions: checkoutSession.selectedVariantOptions,
    sellerUpiId: getStoreUpiId(store),
  };
}
