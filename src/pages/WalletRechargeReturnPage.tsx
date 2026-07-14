import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Wallet } from "lucide-react";

import { formatINR } from "@/lib/money";
import { processWalletRechargeReturn } from "@/services/walletService";
import { PptBadge, PptButton, PptEmptyState, PptTapLoader } from "@/components/ui";

type ReturnState = {
  alreadyCredited: boolean;
  amount: number;
  balanceAfter: number;
  error: string;
  loading: boolean;
  referenceId: string;
};

export default function WalletRechargeReturnPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [state, setState] = useState<ReturnState>({
    alreadyCredited: false,
    amount: 0,
    balanceAfter: 0,
    error: "",
    loading: true,
    referenceId: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function handleReturn() {
      try {
        const result = await processWalletRechargeReturn(token);

        if (!cancelled) {
          setState({
            alreadyCredited: result.alreadyCredited,
            amount: result.amount,
            balanceAfter: result.balanceAfter,
            error: "",
            loading: false,
            referenceId: result.referenceId,
          });
        }
      } catch (error) {
        console.warn("Wallet recharge return page failed:", error);

        if (!cancelled) {
          setState((current) => ({
            ...current,
            error:
              error instanceof Error
                ? error.message
                : "Wallet recharge return could not be processed.",
            loading: false,
          }));
        }
      }
    }

    handleReturn();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.loading) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptTapLoader
          title="Updating wallet..."
          description="Recording your PayPerTap Wallet recharge."
        />
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptEmptyState
          title="Wallet recharge unavailable"
          description={state.error || "This recharge return link is invalid or expired."}
          icon={<AlertCircle size={28} aria-hidden="true" />}
          action={
            <PptButton
              type="button"
              variant="primary"
              rounded="pill"
              icon={<Wallet size={16} aria-hidden="true" />}
              onClick={() => navigate("/dashboard")}
            >
              Open dashboard
            </PptButton>
          }
          className="max-w-sm"
        />
      </main>
    );
  }

  return (
    <main className="pds-page grid place-items-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <PptBadge tone="success" className="mt-4">
          Wallet Recharge
        </PptBadge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
          Wallet Updated
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {state.alreadyCredited
            ? "This recharge was already credited earlier. Your wallet was not credited twice."
            : "Your PayPerTap Wallet recharge has been recorded."}
        </p>
        <div className="mt-5 grid gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-sm">
          <InfoLine label="Recharge amount" value={formatINR(state.amount)} />
          <InfoLine label="Wallet balance" value={formatINR(state.balanceAfter)} />
          <InfoLine label="Reference" value={state.referenceId || "-"} />
        </div>
        <PptButton
          type="button"
          variant="primary"
          rounded="pill"
          fullWidth
          className="mt-5"
          icon={<Wallet size={16} aria-hidden="true" />}
          onClick={() => navigate("/dashboard")}
        >
          Back to dashboard
        </PptButton>
      </section>
    </main>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <strong className="break-all text-right font-semibold text-gray-950">{value}</strong>
    </div>
  );
}
