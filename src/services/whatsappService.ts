import { BOOKING_ADVANCE_AMOUNT } from "../lib/money";
import type { CheckoutSession, DerivedCustomerLead, Product, Store } from "../types/firestore";

type BuyerBookingInput = {
  storeSlug: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
};

type SellerMessageInput = {
  buyerName: string;
  productTitle: string;
  sellerCollectAmount: number;
  bookingAdvanceAmount?: number;
  sellerUpiId?: string;
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
  const digits = (phone || "").replace(/[^\d]/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }

  return null;
}

function getStoreUpiId(store?: Store | null): string {
  const maybeUpi = (store as unknown as { sellerUpiId?: string; upiId?: string }) || {};

  return maybeUpi.sellerUpiId || maybeUpi.upiId || "";
}

export function getStoreWhatsAppPhone(store?: Store | null): string | null {
  return normalizeIndianPhone(store?.whatsappPhone || store?.phone || "");
}

function buildWhatsAppUrl(phone: string | null, message: string): string {
  const encodedMessage = encodeURIComponent(message);

  if (!phone) {
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function buildBuyerBookingMessage(input: BuyerBookingInput): string {
  const productUrl = `${getOrigin()}/${input.storeSlug}/product/${input.productId}`;

  return [
    "Hi, I just booked this item from your PayPerTap store.",
    "",
    `Product: ${input.productTitle}`,
    `Product link: ${productUrl}`,
    `Product price: ₹${input.productPrice}`,
    `Advance paid: ₹${input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT}`,
    `Remaining amount: ₹${input.sellerCollectAmount}`,
    "",
    "My details:",
    `Name: ${input.buyerName}`,
    `Phone: ${input.buyerPhone}`,
    `Address: ${input.buyerAddress}`,
    `City: ${input.buyerCity}`,
    `Pincode: ${input.buyerPincode}`,
    "",
    "Please share your UPI/payment details so I can pay the remaining amount and confirm delivery.",
  ].join("\n");
}

export function buildBuyerBookingWhatsAppUrl(
  store: Store | null,
  message: string
): string {
  return buildWhatsAppUrl(getStoreWhatsAppPhone(store), message);
}

export function buildSellerPaymentCollectionMessage(
  input: SellerMessageInput
): string {
  const base = [
    `Hi ${input.buyerName}, thanks for booking ${input.productTitle} from our PayPerTap store.`,
    "",
    `Your ₹${input.bookingAdvanceAmount || BOOKING_ADVANCE_AMOUNT} booking advance is recorded.`,
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
  return [
    `Hi ${input.buyerName}, please confirm your delivery details:`,
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
  return [
    "Your order is confirmed. Thank you for shopping with us.",
    "",
    `Product: ${input.productTitle}`,
    "",
    "We will update you shortly with delivery details.",
  ].join("\n");
}

export function buildBookingWhatsAppUrl(phone: string, message: string): string {
  return buildWhatsAppUrl(normalizeIndianPhone(phone), message);
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
    sellerUpiId: getStoreUpiId(store),
  };
}
