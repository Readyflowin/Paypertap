import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

import { formatINR } from "../../lib/money";
import { getVariantDetailsText } from "../../lib/productVariants";
import {
  acceptOrder,
  cancelOrder,
  completeOrder,
  markOrderPaymentVerified,
} from "../../services/checkoutService";
import type { CheckoutSession } from "../../types/firestore";
import { PptBrandIcon } from "../ui";
import { buildOrderWhatsAppUrl } from "./orderMessages";
import { OrderActions, type OrderActionId } from "./OrderActions";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  formatOrderDate,
  getOrderId,
  getOrderPaymentLabel,
  normalizeOrderStatus,
} from "./orderUtils";

export function OrderCard({
  onOrderChanged,
  order,
}: {
  onOrderChanged: () => Promise<void>;
  order: CheckoutSession;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [savingAction, setSavingAction] = useState("");
  const [error, setError] = useState("");
  const variantDetails = getVariantDetailsText(order);
  const orderStatus = normalizeOrderStatus(order.status);

  async function runAction(actionId: OrderActionId, action: () => Promise<void>) {
    try {
      setSavingAction(actionId);
      setError("");
      await action();
      await onOrderChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order.");
    } finally {
      setSavingAction("");
    }
  }

  function handleAction(actionId: OrderActionId) {
    if (actionId === "verify_payment") {
      void runAction(actionId, () => markOrderPaymentVerified(getOrderId(order)));
      return;
    }

    if (actionId === "reject_payment" || actionId === "cancel_order") {
      void runAction(actionId, () => cancelOrder(getOrderId(order)));
      return;
    }

    if (actionId === "accept_order") {
      void runAction(actionId, () => acceptOrder(getOrderId(order)));
      return;
    }

    if (actionId === "complete_order") {
      void runAction(actionId, () => completeOrder(getOrderId(order)));
    }
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
              {getOrderPaymentLabel(order)}
            </span>
          </div>
          <h3 className="mt-3 break-words text-lg font-semibold text-gray-950">
            {order.buyerName || "Customer"}
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-600">{order.buyerPhone}</p>
          <p className="mt-3 break-words text-sm font-semibold text-gray-950">
            {order.productTitle}
          </p>
          {variantDetails ? (
            <p className="mt-1 break-words text-sm text-gray-500">{variantDetails}</p>
          ) : null}
          <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
            <span>Order ID: {getOrderId(order).slice(0, 10)}</span>
            <span>Order Time: {formatOrderDate(order.createdAt)}</span>
          </div>
          {orderStatus === "payment_returned" ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Please verify payment manually.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <OrderActions
            order={order}
            savingAction={savingAction}
            onAction={handleAction}
          />
          <a
            href={buildOrderWhatsAppUrl(order, "confirmation")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 transition hover:border-gray-950"
          >
            <PptBrandIcon type="whatsapp" size={15} />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 transition hover:border-gray-950"
          >
            <MessageCircle size={15} aria-hidden="true" />
            <span>Order Details</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-gray-950"
      >
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        <span>{expanded ? "Hide summary" : "Expand order"}</span>
      </button>

      {expanded ? (
        <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-4">
          <Metric label="Product" value={formatINR(order.productPrice)} />
          <Metric
            label="Advance"
            value={formatINR(order.paymentAmount || order.advanceAmount || 0)}
          />
          <Metric label="Amount Due" value={formatINR(order.sellerAmountDue || 0)} />
          <Metric label="Wallet Charge" value={formatINR(order.walletCharge || 0)} />
        </div>
      ) : null}

      <OrderDetailsModal
        open={detailsOpen}
        order={order}
        onClose={() => setDetailsOpen(false)}
        onNotesSaved={onOrderChanged}
      />
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-xs font-medium text-gray-500">{label}</span>
      <strong className="mt-1 block break-words text-sm font-semibold text-gray-950">
        {value}
      </strong>
    </span>
  );
}
