import { buildWhatsAppUrl } from "../../lib/phone";
import { getVariantDetailsText } from "../../lib/productVariants";
import type { CheckoutSession } from "../../types/firestore";
import { getOrderPaymentLabel } from "./orderUtils";

export type OrderMessageTemplateId =
  | "confirmation"
  | "payment_reminder"
  | "processing"
  | "ready"
  | "thank_you";

export const ORDER_MESSAGE_TEMPLATES: Array<{
  id: OrderMessageTemplateId;
  label: string;
}> = [
  { id: "confirmation", label: "Order Confirmation" },
  { id: "payment_reminder", label: "Payment Reminder" },
  { id: "processing", label: "Processing Update" },
  { id: "ready", label: "Ready for Delivery" },
  { id: "thank_you", label: "Thank You" },
];

export function buildOrderMessage(
  order: CheckoutSession,
  template: OrderMessageTemplateId
): string {
  const variantDetails = getVariantDetailsText(order);
  const productLine = [
    `Product: ${order.productTitle}`,
    variantDetails ? `Variant: ${variantDetails}` : "",
    `Payment Method: ${getOrderPaymentLabel(order)}`,
  ].filter(Boolean);

  const intro = `Hi ${order.buyerName || "there"},`;

  if (template === "payment_reminder") {
    return [
      intro,
      "Your order is waiting for the seller payment step.",
      "",
      ...productLine,
      "",
      "Please complete the payment using the seller payment link shared during checkout, then reply here once done.",
    ].join("\n");
  }

  if (template === "processing") {
    return [
      intro,
      "Your order has been accepted and is now being prepared.",
      "",
      ...productLine,
      "",
      "We will update you shortly with the next step.",
    ].join("\n");
  }

  if (template === "ready") {
    return [
      intro,
      "Your order is ready for delivery or handover.",
      "",
      ...productLine,
      "",
      "Please confirm your availability and delivery details here.",
    ].join("\n");
  }

  if (template === "thank_you") {
    return [
      intro,
      "Thank you for your order.",
      "",
      ...productLine,
      "",
      "We appreciate you shopping with us.",
    ].join("\n");
  }

  return [
    intro,
    "Your order is confirmed.",
    "",
    ...productLine,
    "",
    "We will contact you shortly with delivery details.",
  ].join("\n");
}

export function buildOrderWhatsAppUrl(
  order: CheckoutSession,
  template: OrderMessageTemplateId
): string {
  return buildWhatsAppUrl(order.buyerPhone, buildOrderMessage(order, template)) || "#";
}
