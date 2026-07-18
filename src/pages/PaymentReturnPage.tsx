import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { PptButton, PptEmptyState, PptTapLoader } from "@/components/ui";
import {
  processPaymentReturn,
  resolvePaymentReturnStore,
} from "@/services/paymentReturnService";

type ReturnState = {
  error: string;
  loading: boolean;
  storeSlug: string;
};

export default function PaymentReturnPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ReturnState>({
    error: "",
    loading: true,
    storeSlug: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function handleReturn() {
      try {
        const orderToken =
          searchParams.get("orderToken") ||
          searchParams.get("paypertap_order_token") ||
          searchParams.get("ppt_order_token") ||
          "";

        if (!orderToken) {
          const result = await resolvePaymentReturnStore(token);

          if (!cancelled) {
            navigate(`/${result.storeSlug}`, { replace: true });
          }
          return;
        }

        const result = await processPaymentReturn(token, orderToken);

        if (!cancelled) {
          navigate(`/${result.storeSlug}/order-success/${result.orderId}`, {
            replace: true,
            state: { checkout: result.order },
          });
        }
      } catch (error) {
        console.warn("Payment return page failed:", error);

        const fallback = token
          ? await resolvePaymentReturnStore(token).catch(() => null)
          : null;

        if (fallback?.storeSlug && !cancelled) {
          navigate(`/${fallback.storeSlug}`, { replace: true });
          return;
        }

        if (!cancelled) {
          setState({
            error:
              error instanceof Error
                ? error.message
                : "Payment return could not be processed.",
            loading: false,
            storeSlug: fallback?.storeSlug || "",
          });
        }
      }
    }

    handleReturn();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, token]);

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
            onClick={() => navigate(state.storeSlug ? `/${state.storeSlug}` : "/")}
          >
            {state.storeSlug ? "Go to store" : "Go to PayPerTap"}
          </PptButton>
        }
        className="max-w-sm"
      />
    </main>
  );
}
