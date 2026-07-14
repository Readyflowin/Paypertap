import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { PptButton, PptEmptyState, PptTapLoader } from "@/components/ui";
import {
  getPendingPaymentOrderId,
  processPaymentReturn,
} from "@/services/paymentReturnService";

type ReturnState = {
  error: string;
  loading: boolean;
};

export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [state, setState] = useState<ReturnState>({
    error: "",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function handleReturn() {
      try {
        const pendingOrderId = getPendingPaymentOrderId();

        if (!pendingOrderId) {
          throw new Error("We could not find the order from this browser session.");
        }

        const result = await processPaymentReturn(token, pendingOrderId);

        if (!cancelled) {
          navigate(`/${result.storeSlug}/order-success/${result.orderId}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.warn("Payment return page failed:", error);

        if (!cancelled) {
          setState({
            error:
              error instanceof Error
                ? error.message
                : "Payment return could not be processed.",
            loading: false,
          });
        }
      }
    }

    handleReturn();

    return () => {
      cancelled = true;
    };
  }, [navigate, token]);

  if (state.loading) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptTapLoader
          title="Returning to order..."
          description="Recording that you came back after the seller payment step."
        />
      </main>
    );
  }

  return (
    <main className="pds-page grid place-items-center px-4">
      <PptEmptyState
        title="Payment return unavailable"
        description={state.error || "This return link is invalid or expired."}
        icon={<AlertCircle size={28} aria-hidden="true" />}
        action={
          <PptButton
            type="button"
            variant="primary"
            rounded="pill"
            icon={<CheckCircle2 size={16} aria-hidden="true" />}
            onClick={() => navigate("/")}
          >
            Go to PayPerTap
          </PptButton>
        }
        className="max-w-sm"
      />
    </main>
  );
}
