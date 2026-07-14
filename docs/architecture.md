# Architecture

PayPerTap is organized around four boundaries:

- Frontend pages and components in `src/`.
- Client-side Firebase services in `src/services/`.
- Serverless API endpoints in `api/`.
- Firestore authorization in `firestore.rules`.

## Core Services

- `src/services/walletService.ts` reads wallet state, wallet activity, recharge sessions, and client-facing wallet helpers.
- `api/_lib/createOrder.ts` is the order engine. It validates store/product/customer state, applies free-order or wallet-charge logic, writes wallet transactions, creates the order, and pauses/resumes store order intake atomically.
- `api/_lib/walletRecharge.ts` owns recharge accounting. Recharge return credits a wallet once and records the transaction.
- `src/services/paymentReturnService.ts` and `api/_lib/paymentReturn.ts` detect buyer return from the seller Razorpay payment link. They never verify payment.
- `src/services/storeService.ts`, `productService.ts`, `sellerService.ts`, and `checkoutService.ts` keep store, product, seller, and buyer order UI flows separated.

## Business Model

The supported model is:

1. Buyer places an order.
2. Seller receives the order.
3. PayPerTap charges the seller wallet through the order engine.
4. COD or partial-advance payment is handled directly between buyer and seller.
5. If a buyer returns from a seller payment link, PayPerTap records only that return event.

The legacy buyer-paid PayPerTap checkout architecture is no longer supported.
