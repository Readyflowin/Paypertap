import { createCheckoutSessionWithReservation, type CreateCheckoutSessionInput } from "./checkoutService";
import { buildCheckoutSession } from "./mockPaymentService";
import type { CheckoutSession } from "../types/firestore";

type RazorpayOrderResponse = {
  success: boolean;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
};

type RazorpayVerificationResponse = {
  success: boolean;
  error?: string;
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  notes: {
    sellerId: string;
    storeId: string;
    productId: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Could not load Razorpay checkout.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

async function postJson<TResponse>(url: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as TResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Payment request failed.");
  }

  return data;
}

function openRazorpayCheckout(
  input: CreateCheckoutSessionInput,
  order: Required<Pick<RazorpayOrderResponse, "keyId" | "orderId" | "amount" | "currency">>
) {
  return new Promise<RazorpayPaymentResponse>((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout is not available."));
      return;
    }

    let settled = false;
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "PayPerTap",
      description: "Verified booking",
      prefill: {
        name: input.buyerName,
        ...(input.buyerEmail ? { email: input.buyerEmail } : {}),
        contact: input.buyerPhone,
      },
      notes: {
        sellerId: input.sellerId,
        storeId: input.storeId,
        productId: input.productId,
      },
      theme: {
        color: "#7c3aed",
      },
      handler(response) {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss() {
          if (!settled) {
            reject(new Error("Payment was closed before completion."));
          }
        },
      },
    });

    checkout.open();
  });
}

export async function startRazorpayBookingPayment(
  input: CreateCheckoutSessionInput
): Promise<{
  success: true;
  checkoutId: string;
  checkoutSession: CheckoutSession;
  reservationApplied: boolean;
}> {
  await loadRazorpayCheckoutScript();

  const order = await postJson<RazorpayOrderResponse>("/api/create-razorpay-order", {
    sellerId: input.sellerId,
    storeId: input.storeId,
    productId: input.productId,
  });

  if (!order.success || !order.keyId || !order.orderId || !order.amount || !order.currency) {
    throw new Error(order.error || "Could not create Razorpay order.");
  }

  const payment = await openRazorpayCheckout(input, {
    keyId: order.keyId,
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
  });

  const verification = await postJson<RazorpayVerificationResponse>(
    "/api/verify-razorpay-payment",
    payment
  );

  if (!verification.success) {
    throw new Error(verification.error || "Payment verification failed.");
  }

  const checkoutId = await createCheckoutSessionWithReservation(input);
  const checkoutSession = buildCheckoutSession(input, checkoutId);

  return {
    success: true,
    checkoutId,
    checkoutSession,
    reservationApplied: true,
  };
}
