import type { CheckoutSession } from "../types/firestore";

export const PENDING_PAYMENT_ORDER_ID_KEY = "paypertap:pendingOrderId";

export type PaymentReturnResult = {
  order: CheckoutSession;
  orderId: string;
  storeId: string;
  storeSlug: string;
};

type PaymentReturnApiResponse = Partial<PaymentReturnResult> & {
  success?: boolean;
  error?: string;
};

export function storePendingPaymentOrder(orderId: string): void {
  sessionStorage.setItem(PENDING_PAYMENT_ORDER_ID_KEY, orderId);
}

export function getPendingPaymentOrderId(): string {
  return sessionStorage.getItem(PENDING_PAYMENT_ORDER_ID_KEY) || "";
}

export function clearPendingPaymentOrder(): void {
  sessionStorage.removeItem(PENDING_PAYMENT_ORDER_ID_KEY);
}

export async function processPaymentReturn(
  token: string,
  pendingOrderId: string
): Promise<PaymentReturnResult> {
  const response = await fetch("/api/payment-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, pendingOrderId }),
  });
  const payload = (await response.json().catch(() => null)) as
    | PaymentReturnApiResponse
    | null;

  if (
    !response.ok ||
    !payload?.success ||
    !payload.order ||
    !payload.orderId ||
    !payload.storeId ||
    !payload.storeSlug
  ) {
    throw new Error(payload?.error || "Payment return could not be processed.");
  }

  sessionStorage.setItem(
    `paypertap:checkout:${payload.orderId}`,
    JSON.stringify(payload.order)
  );

  return {
    order: payload.order,
    orderId: payload.orderId,
    storeId: payload.storeId,
    storeSlug: payload.storeSlug,
  };
}
