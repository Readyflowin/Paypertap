# Payment Return Flow

PayPerTap does not verify Razorpay payments.

For partial-advance orders, the buyer may be redirected to the seller's Razorpay payment link. When the buyer returns to `/payment-return/:token`, PayPerTap:

1. Validates the store payment-return token.
2. Reads the exact pending order ID from browser session storage.
3. Loads that order.
4. Updates awaiting-payment states to `payment_returned`.
5. Records `paymentReturnedAt`, `paymentReturnDetected`, and `paymentReturnMethod`.
6. Redirects to the order success page.

Refreshes are idempotent. Confirming payment is a seller dashboard action and records seller confirmation audit fields. The application must never label a returned payment as successful, received, verified, or paid until the seller manually confirms it.
