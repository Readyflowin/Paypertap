import type { CheckoutSession } from "../../types/firestore";
import { formatOrderDate, normalizeOrderStatus } from "./orderUtils";

type TimelineEvent = {
  label: string;
  time?: unknown;
};

export function getOrderTimelineEvents(order: CheckoutSession): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { label: "Order Created", time: order.createdAt },
  ];

  if (order.paymentReturnedAt || normalizeOrderStatus(order.status) === "payment_returned") {
    events.push({
      label: "Payment Return Opened",
      time: order.paymentReturnedAt,
    });
  }

  if (order.sellerPaymentConfirmedAt || order.sellerConfirmationAt) {
    events.push({
      label: "Payment Verified Manually",
      time: order.sellerPaymentConfirmedAt || order.sellerConfirmationAt,
    });
  }

  if (order.sellerAcceptedAt) {
    events.push({ label: "Seller Accepted Order", time: order.sellerAcceptedAt });
  }

  if (order.processingAt || normalizeOrderStatus(order.status) === "processing") {
    events.push({ label: "Processing", time: order.processingAt });
  }

  if (order.completedAt || normalizeOrderStatus(order.status) === "completed") {
    events.push({ label: "Completed", time: order.completedAt || order.soldAt });
  }

  if (order.cancelledAt || normalizeOrderStatus(order.status) === "cancelled") {
    events.push({ label: "Cancelled", time: order.cancelledAt || order.releasedAt });
  }

  return events;
}

export function OrderTimeline({ order }: { order: CheckoutSession }) {
  const events = getOrderTimelineEvents(order);

  return (
    <ol className="grid gap-3">
      {events.map((event, index) => (
        <li key={`${event.label}-${index}`} className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-950" />
          <span className="min-w-0">
            <strong className="block text-sm font-semibold text-gray-950">
              {event.label}
            </strong>
            <span className="mt-0.5 block text-xs text-gray-500">
              {formatOrderDate(event.time)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
