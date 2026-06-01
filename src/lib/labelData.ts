import { getPrimaryProductImage } from "./imageUrls";
import { BOOKING_ADVANCE_AMOUNT, getSellerCollectAmount } from "./money";
import { getVariantDetailsText } from "./productVariants";
import type { CheckoutSession, Product, Store } from "../types/firestore";

export type BookingLabelData = {
  bookingId: string;
  bookingDateText: string;
  storeName: string;
  storeSlug: string;
  sellerPhone: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  productId: string;
  productTitle: string;
  productImageUrl: string;
  productUrl: string;
  variantText: string;
  quantity: number;
  productPrice: number;
  paidOnPayPerTap: number;
  sellerConfirmationAmountPending: number;
  finalBalanceAfterConfirmation: number;
  totalProductPrice: number;
};

type BuildBookingLabelDataInput = {
  booking: CheckoutSession;
  store: Store | null;
  product?: Product | null;
  origin?: string;
};

function getOrigin(origin?: string) {
  const trimmedOrigin = origin?.trim().replace(/\/+$/g, "");

  return trimmedOrigin || "https://paypertap.in";
}

function getBookingDateText(value: unknown) {
  let date: Date | null = null;

  if (value instanceof Date) {
    date = value;
  } else if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    date = (value as { toDate: () => Date }).toDate();
  } else if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);
    date = Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toSafeAmount(value: unknown, fallback = 0) {
  const amount = Number(value);

  return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : fallback;
}

function getStoreSlug(store: Store | null, booking: CheckoutSession) {
  return store?.storeSlug || store?.storeId || booking.storeId || "";
}

export function buildBookingLabelData({
  booking,
  store,
  product,
  origin,
}: BuildBookingLabelDataInput): BookingLabelData {
  const bookingRecord = booking as CheckoutSession & { id?: string };
  const bookingId = booking.checkoutId || bookingRecord.id || "";
  const productId = booking.productId || product?.productId || product?.id || "";
  const paidOnPayPerTap = toSafeAmount(
    booking.bookingAdvanceAmount,
    BOOKING_ADVANCE_AMOUNT
  );
  const productPrice = toSafeAmount(booking.productPrice || product?.price);
  const fallbackFinalBalance = toSafeAmount(
    booking.sellerCollectAmount,
    getSellerCollectAmount(productPrice)
  );
  const sellerConfirmationAmountPending = toSafeAmount(
    booking.sellerConfirmationAmountPending,
    0
  );
  const finalBalanceAfterConfirmation =
    typeof booking.finalBalanceAfterConfirmation === "number"
      ? toSafeAmount(booking.finalBalanceAfterConfirmation)
      : fallbackFinalBalance;
  const storeSlug = getStoreSlug(store, booking);
  const normalizedOrigin = getOrigin(origin);
  const productUrl = `${normalizedOrigin}/${encodeURIComponent(
    storeSlug
  )}/product/${encodeURIComponent(productId)}`;

  return {
    bookingId,
    bookingDateText: getBookingDateText(booking.createdAt),
    storeName: store?.storeName || "PayPerTap Store",
    storeSlug,
    sellerPhone:
      booking.sellerWhatsAppPhone ||
      booking.sellerPhone ||
      store?.whatsappPhone ||
      store?.phone ||
      "",
    buyerName: booking.buyerName || "",
    buyerPhone: booking.buyerPhone || "",
    buyerAddress: booking.buyerAddress || "",
    buyerCity: booking.buyerCity || "",
    buyerPincode: booking.buyerPincode || "",
    productId,
    productTitle: booking.productTitle || product?.title || "Booked product",
    productImageUrl: product ? getPrimaryProductImage(product) : "",
    productUrl,
    variantText: getVariantDetailsText(booking),
    quantity: Math.max(1, Number(booking.reservedQuantity || 1)),
    productPrice,
    paidOnPayPerTap,
    sellerConfirmationAmountPending,
    finalBalanceAfterConfirmation,
    totalProductPrice: productPrice,
  };
}
