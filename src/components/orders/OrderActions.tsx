import type { CheckoutSession } from "../../types/firestore";
import { normalizeOrderStatus } from "./orderUtils";

export type OrderActionId =
  | "verify_payment"
  | "reject_payment"
  | "accept_order"
  | "cancel_order"
  | "complete_order";

type OrderActionsProps = {
  order: CheckoutSession;
  savingAction: string;
  onAction: (action: OrderActionId) => void;
};

export function OrderActions({ onAction, order, savingAction }: OrderActionsProps) {
  const status = normalizeOrderStatus(order.status);

  if (status === "pending_payment") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
        Waiting for Customer Payment
      </div>
    );
  }

  if (status === "payment_returned") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <ActionButton
          label="Payment Verified"
          loadingLabel="Updating..."
          loading={savingAction === "verify_payment"}
          onClick={() => onAction("verify_payment")}
        />
        <ActionButton
          label="Reject Payment"
          loadingLabel="Cancelling..."
          tone="danger"
          loading={savingAction === "reject_payment"}
          onClick={() => onAction("reject_payment")}
        />
      </div>
    );
  }

  if (status === "pending_confirmation") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <ActionButton
          label="Accept Order"
          loadingLabel="Accepting..."
          loading={savingAction === "accept_order"}
          onClick={() => onAction("accept_order")}
        />
        <ActionButton
          label="Cancel Order"
          loadingLabel="Cancelling..."
          tone="danger"
          loading={savingAction === "cancel_order"}
          onClick={() => onAction("cancel_order")}
        />
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <ActionButton
          label="Mark Completed"
          loadingLabel="Completing..."
          loading={savingAction === "complete_order"}
          onClick={() => onAction("complete_order")}
        />
        <ActionButton
          label="Cancel Order"
          loadingLabel="Cancelling..."
          tone="danger"
          loading={savingAction === "cancel_order"}
          onClick={() => onAction("cancel_order")}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500">
      Read only
    </div>
  );
}

function ActionButton({
  label,
  loading,
  loadingLabel,
  onClick,
  tone = "default",
}: {
  label: string;
  loading: boolean;
  loadingLabel: string;
  onClick: () => void;
  tone?: "danger" | "default";
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={
        tone === "danger"
          ? "rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
          : "rounded-xl bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      }
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
