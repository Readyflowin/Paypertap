import { BOOKING_ADVANCE_AMOUNT } from "../lib/money";
import {
  calculateConfirmationAdvance,
  type SellerConfirmationAdvanceType,
} from "../lib/confirmationAdvance";
import {
  buildWhatsAppUrl,
  normalizeIndianMobileInput,
} from "../lib/phone";
import { getVariantDetailsText } from "../lib/productVariants";
import type { CheckoutSession, DerivedCustomerLead, Product, Store } from "../types/firestore";

type BuyerBookingInput = {
  storeSlug: string;
  storeName?: string;
  sellerConfirmationAdvanceType?: SellerConfirmationAdvanceType | string;
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
  productId: string;
  productTitle: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  confirmationAdvanceType?: SellerConfirmationAdvanceType | string;
  totalConfirmationAdvance?: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
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
  sellerCollectAmount: number;
  bookingAdvanceAmount?: number;
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

export function buildBuyerBookingMessage(input: BuyerBookingInput): string {
  const productUrl = `${getOrigin()}/${input.storeSlug}/product/${input.productId}`;
  const variantDetails = getVariantDetailsText(input);
  const storeName = input.storeName?.trim() || "this store";
  const confirmationAdvance = calculateConfirmationAdvance({
    productPrice: input.productPrice,
    sellerConfirmationAdvanceType: input.sellerConfirmationAdvanceType,
    sellerConfirmationAdvanceFixedAmount: input.sellerConfirmationAdvanceFixedAmount,
    sellerConfirmationAdvancePercent: input.sellerConfirmationAdvancePercent,
    bookingPaid: input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT,
  });
  const hasConfirmationSnapshot =
    typeof input.sellerConfirmationAmountPending === "number" &&
    typeof input.finalBalanceAfterConfirmation === "number" &&
    typeof input.totalConfirmationAdvance === "number";
  const paymentBreakdown = hasConfirmationSnapshot
    ? {
        ...confirmationAdvance,
        sellerConfirmationAdvanceType:
          input.confirmationAdvanceType || confirmationAdvance.sellerConfirmationAdvanceType,
        paypertapBookingPaid: input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT,
        totalConfirmationAdvance:
          input.totalConfirmationAdvance || input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT,
        sellerConfirmationAmountPending: input.sellerConfirmationAmountPending || 0,
        finalBalanceAfterConfirmation: input.finalBalanceAfterConfirmation || 0,
      }
    : confirmationAdvance;
  const paymentLines =
    paymentBreakdown.sellerConfirmationAmountPending > 0
      ? [
          `Paid on PayPerTap: ₹${paymentBreakdown.paypertapBookingPaid}`,
          `Seller confirmation amount pending: ₹${paymentBreakdown.sellerConfirmationAmountPending}`,
          `Remaining at COD after confirmation: ₹${paymentBreakdown.finalBalanceAfterConfirmation}`,
        ]
      : [
          `Paid on PayPerTap: ₹${paymentBreakdown.paypertapBookingPaid}`,
          `Remaining amount to seller: ₹${paymentBreakdown.finalBalanceAfterConfirmation}`,
        ];
  const closingLine =
    paymentBreakdown.sellerConfirmationAmountPending > 0
      ? "Please share your UPI/payment details so I can complete the confirmation amount and confirm delivery."
      : "Please confirm delivery and the remaining payment details.";

  return [
    `Hi, I booked this product on ${storeName}`,
    "",
    `Product: ${input.productTitle}`,
    ...(variantDetails ? [`Variant: ${variantDetails}`] : []),
    `Product link: ${productUrl}`,
    `Price: ₹${input.productPrice}`,
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

export function buildBuyerBookingWhatsAppUrl(
  store: Store | null,
  message: string
): string | null {
  return buildWhatsAppUrl(store?.whatsappPhone || store?.phone || "", message);
}

export function buildSellerPaymentCollectionMessage(
  input: SellerMessageInput
): string {
  const variantDetails = getVariantDetailsText(input);
  const base = [
    `Hi ${input.buyerName}, thanks for booking ${input.productTitle} from our PayPerTap store.`,
    ...(variantDetails ? [`Variant: ${variantDetails}`] : []),
    "",
    `Your ₹${input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT} booking via PayPerTap is recorded.`,
    `Remaining amount: ₹${input.sellerCollectAmount}.`,
    "Please confirm payment/delivery details here.",
    "",
  ];

  if (input.sellerUpiId?.trim()) {
    return [
      ...base,
      "Please pay the remaining amount here:",
      `UPI ID: ${input.sellerUpiId.trim()}`,
      "",
      "After payment, please share the screenshot here so we can confirm your delivery.",
    ].join("\n");
  }

  return [
    ...base,
    "Please complete the remaining payment as discussed. After payment, share the screenshot here so we can confirm your delivery.",
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
    "Once remaining payment is confirmed, we will process your order.",
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

export function buildBookingWhatsAppUrl(phone: string, message: string): string {
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
      `₹${input.product.price}`,
      `Book here: ${productUrl}`,
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
  // TODO: Product picker for retargeting will be added in next dashboard refinement.
  return buildNewDropRetargetingMessage({
    buyerName: customer.buyerName,
    storeLink,
  });
}

export function buildRetargetingWhatsAppUrl(phone: string, message: string): string {
  return buildBookingWhatsAppUrl(phone, message);
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
    sellerCollectAmount: checkoutSession.sellerCollectAmount,
    bookingAdvanceAmount: checkoutSession.bookingAdvanceAmount,
    selectedVariantLabel: checkoutSession.selectedVariantLabel,
    selectedVariantOptions: checkoutSession.selectedVariantOptions,
    sellerUpiId: getStoreUpiId(store),
  };
}
