import type { CheckoutSession } from "../types/firestore";
import type { StorePaymentMode } from "./storeService";

export type CreateChargeableOrderResult = {
  orderId: string;
  order: CheckoutSession;
  paymentMode: StorePaymentMode;
  paymentLink: string;
  paymentRedirectUrl: string;
  paymentReturnUrl: string;
  redirectUrl: string;
  nextAction: "order_success" | "payment_redirect";
};

export type CreateChargeableOrderApiResponse = {
  success?: boolean;
  code?: string;
  error?: string;
  message?: string;
  details?: unknown;
  debug?: unknown;
  orderId?: string;
  order?: CheckoutSession;
  paymentMode?: StorePaymentMode;
  paymentLink?: string;
  paymentRedirectUrl?: string;
  paymentReturnUrl?: string;
  redirectUrl?: string;
  nextAction?: "order_success" | "payment_redirect";
};

class OrderApiContractError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "OrderApiContractError";
    this.code = code;
    this.details = details;
  }
}

type OrderResponseMeta = {
  ok: boolean;
  status: number;
};

export function normalizeCreateChargeableOrderResponse(
  response: OrderResponseMeta,
  payload: CreateChargeableOrderApiResponse | null
): CreateChargeableOrderResult {
  if (!response.ok || !payload?.success || !payload.orderId || !payload.order) {
    if (payload?.debug) {
      console.error("Order creation API debug:", payload.debug);
    }
    console.error("Order creation API invalid response:", {
      status: response.status,
      ok: response.ok,
      payload,
    });

    throw new OrderApiContractError(
      payload?.message ||
        payload?.error ||
        "Order service did not return a valid response.",
      payload?.code || "invalid_order_response",
      payload?.details
    );
  }

  const paymentMode = payload.paymentMode || payload.order.paymentMode || "cod";
  const paymentLink = payload.paymentLink || payload.order.paymentLink || "";
  const paymentRedirectUrl =
    payload.paymentRedirectUrl ||
    payload.order.paymentRedirectUrl ||
    payload.redirectUrl ||
    paymentLink ||
    "";
  const paymentReturnUrl = payload.paymentReturnUrl || payload.order.paymentReturnUrl || "";
  const nextAction =
    payload.nextAction ||
    (paymentMode === "partial_advance" ? "payment_redirect" : "order_success");

  return {
    orderId: payload.orderId,
    order: payload.order,
    paymentMode,
    paymentLink,
    paymentRedirectUrl,
    paymentReturnUrl,
    redirectUrl: payload.redirectUrl || paymentRedirectUrl,
    nextAction,
  };
}
