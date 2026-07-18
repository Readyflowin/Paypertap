import type { CheckoutSession } from "../../types/firestore";

export type OrderLifecycleStatus =
  | "pending_payment"
  | "payment_returned"
  | "pending_confirmation"
  | "processing"
  | "completed"
  | "cancelled";

export type OrderPaymentFilter = "all" | "cod" | "partial_advance";
export type OrderSortMode = "newest" | "oldest";

export const ORDER_STATUS_OPTIONS: Array<{
  label: string;
  value: "all" | OrderLifecycleStatus;
}> = [
  { label: "All statuses", value: "all" },
  { label: "Order successful", value: "pending_payment" },
  { label: "Order successful", value: "payment_returned" },
  { label: "Pending confirmation", value: "pending_confirmation" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function normalizeOrderStatus(
  status: CheckoutSession["status"]
): OrderLifecycleStatus {
  if (status === "awaiting_payment" || status === "pending_payment") {
    return "pending_payment";
  }

  if (status === "payment_returned") return "payment_returned";

  if (status === "pending_confirmation" || status === "confirmed") {
    return "pending_confirmation";
  }

  if (status === "processing") {
    return "processing";
  }

  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "released") {
    return "cancelled";
  }

  return "pending_confirmation";
}

export function getOrderStatusLabel(status: CheckoutSession["status"]): string {
  const normalizedStatus = normalizeOrderStatus(status);

  return {
    pending_payment: "Order Successful",
    payment_returned: "Order Successful",
    pending_confirmation: "Pending Confirmation",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
  }[normalizedStatus];
}

export function getOrderStatusTone(status: CheckoutSession["status"]) {
  const normalizedStatus = normalizeOrderStatus(status);

  if (normalizedStatus === "completed") return "success";
  if (normalizedStatus === "cancelled") return "neutral";
  if (normalizedStatus === "payment_returned") return "success";
  if (normalizedStatus === "pending_payment") return "success";
  if (normalizedStatus === "processing") return "primary";

  return "info";
}

export function getOrderPaymentMode(order: CheckoutSession): "cod" | "partial_advance" {
  return order.paymentMode === "partial_advance" ? "partial_advance" : "cod";
}

export function getOrderPaymentLabel(order: CheckoutSession): string {
  return getOrderPaymentMode(order) === "partial_advance" ? "Partial Advance" : "COD";
}

export function getOrderId(order: CheckoutSession): string {
  return order.orderId || order.checkoutId;
}

export function getTimeValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatOrderDate(value: unknown): string {
  const millis = getTimeValue(value);

  if (!millis) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(millis));
}

export function buildOrderSearchText(order: CheckoutSession): string {
  return [
    getOrderId(order),
    order.buyerName,
    order.buyerPhone,
    order.productTitle,
    order.selectedVariantLabel,
    order.buyerCity,
    order.buyerPincode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}
