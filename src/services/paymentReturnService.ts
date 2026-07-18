import type { CheckoutSession } from "../types/firestore";

export type PaymentReturnResult = {
  order: CheckoutSession;
  orderId: string;
  storeId: string;
  storeSlug: string;
};

export type PaymentReturnStoreResult = {
  storeId: string;
  storeSlug: string;
  storeName: string;
  fallback?: boolean;
  reason?: string;
};

type PaymentReturnApiResponse = Partial<PaymentReturnResult & PaymentReturnStoreResult> & {
  success?: boolean;
  error?: string;
  code?: string;
};

export async function processPaymentReturn(
  token: string,
  orderToken: string
): Promise<PaymentReturnResult> {
  const response = await fetch("/api/orders?action=payment-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, orderToken }),
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

  return {
    order: payload.order,
    orderId: payload.orderId,
    storeId: payload.storeId,
    storeSlug: payload.storeSlug,
  };
}

export async function resolvePaymentReturnStore(
  token: string
): Promise<PaymentReturnStoreResult> {
  const response = await fetch("/api/orders?action=payment-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = (await response.json().catch(() => null)) as
    | PaymentReturnApiResponse
    | null;

  if (!response.ok || !payload?.success || !payload.storeId || !payload.storeSlug) {
    throw new Error(payload?.error || "Payment return store could not be found.");
  }

  return {
    storeId: payload.storeId,
    storeSlug: payload.storeSlug,
    storeName: payload.storeName || "",
    fallback: payload.fallback,
    reason: payload.reason,
  };
}
