import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import { formatINR } from "../../lib/money";
import { getVariantDetailsText } from "../../lib/productVariants";
import { updateOrderNotes } from "../../services/checkoutService";
import type { CheckoutSession } from "../../types/firestore";
import { PptBrandIcon } from "../ui";
import { ORDER_MESSAGE_TEMPLATES, buildOrderWhatsAppUrl } from "./orderMessages";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import {
  formatOrderDate,
  getOrderId,
  getOrderPaymentLabel,
  normalizeOrderStatus,
} from "./orderUtils";

export function OrderDetailsModal({
  onClose,
  onNotesSaved,
  open,
  order,
}: {
  onClose: () => void;
  onNotesSaved: () => Promise<void>;
  open: boolean;
  order: CheckoutSession | null;
}) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNotes(order?.sellerNotes || "");
    setError("");
  }, [order]);

  if (!open || !order) return null;

  const variantDetails = getVariantDetailsText(order);
  const isReadOnly =
    normalizeOrderStatus(order.status) === "completed" ||
    normalizeOrderStatus(order.status) === "cancelled";

  async function handleSaveNotes() {
    if (!order) return;

    try {
      setSavingNotes(true);
      setError("");
      await updateOrderNotes(getOrderId(order), notes);
      await onNotesSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-3">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Order Details
            </p>
            <h2 className="mt-1 break-words text-xl font-semibold text-gray-950">
              {order.productTitle}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="inline-flex min-h-6 items-center justify-center rounded-full border border-gray-200 px-2.5 text-xs font-semibold leading-none text-gray-700">
                {getOrderPaymentLabel(order)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
            aria-label="Close order details"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4">
            <DetailSection title="Customer">
              <DetailGrid
                rows={[
                  ["Name", order.buyerName || "Not shared"],
                  ["Phone", order.buyerPhone || "Not shared"],
                  ["Email", order.buyerEmail || "Not shared"],
                  [
                    "Address",
                    [order.buyerAddress, order.buyerCity, order.buyerPincode]
                      .filter(Boolean)
                      .join(", ") || "Not shared",
                  ],
                ]}
              />
            </DetailSection>

            <DetailSection title="Product">
              <DetailGrid
                rows={[
                  ["Product", order.productTitle],
                  ["Variant", variantDetails || "None"],
                  ["Order ID", getOrderId(order)],
                  ["Order Time", formatOrderDate(order.createdAt)],
                ]}
              />
            </DetailSection>

            <DetailSection title="Payment">
              <DetailGrid
                rows={[
                  ["Payment Method", getOrderPaymentLabel(order)],
                  ["Product Price", formatINR(order.productPrice)],
                  [
                    "Advance Amount",
                    formatINR(order.paymentAmount || order.advanceAmount || 0),
                  ],
                  ["Amount Due With Seller", formatINR(order.sellerAmountDue || 0)],
                  ["Wallet Charge", formatINR(order.walletCharge || 0)],
                ]}
              />
            </DetailSection>

            <DetailSection title="Notes">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add internal notes. Customers cannot see these."
                className="min-h-28 w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none transition focus:border-gray-950"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveNotes()}
                  disabled={savingNotes || isReadOnly}
                  className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
                {isReadOnly ? (
                  <span className="text-xs font-medium text-gray-500">
                    Notes are read only after final status.
                  </span>
                ) : null}
                {error ? <span className="text-xs font-semibold text-red-600">{error}</span> : null}
              </div>
            </DetailSection>
          </div>

          <aside className="grid gap-4 content-start">
            <DetailSection title="Timeline">
              <OrderTimeline order={order} />
            </DetailSection>

            <DetailSection title="WhatsApp Templates">
              <div className="grid gap-2">
                {ORDER_MESSAGE_TEMPLATES.map((template) => (
                  <a
                    key={template.id}
                    href={buildOrderWhatsAppUrl(order, template.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 transition hover:border-gray-950"
                  >
                    <PptBrandIcon type="whatsapp" size={15} />
                    <span>{template.label}</span>
                  </a>
                ))}
              </div>
            </DetailSection>
          </aside>
        </div>
      </section>
    </div>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 text-sm sm:grid-cols-[140px_1fr]">
          <span className="font-medium text-gray-500">{label}</span>
          <strong className="break-words font-semibold text-gray-950">{value}</strong>
        </div>
      ))}
    </div>
  );
}
