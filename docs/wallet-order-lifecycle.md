# Wallet And Order Lifecycle

Shared constants live in `src/config/wallet.ts`:

- `FREE_ORDER_COUNT = 5`
- `ORDER_CHARGE = 19`
- `MINIMUM_ORDER_BALANCE = 19`
- `LOW_BALANCE_THRESHOLD = 95`
- recharge limits: `100` to `25000`

## Order Creation

All chargeable order creation must go through the server order engine in `api/_lib/createOrder.ts`.

The engine runs inside a Firestore transaction:

1. Validate store is published and accepting orders.
2. Validate product exists and is available.
3. Validate customer information.
4. Load or initialize seller wallet.
5. Use a free order if available.
6. Otherwise deduct `ORDER_CHARGE`.
7. Record a wallet transaction.
8. Create the order with wallet snapshots.
9. Update wallet and store availability.

This prevents wallet deduction without an order, or order creation without the matching wallet mutation.

## Wallet Status

- `active`: balance is at least `95`, or free orders remain.
- `low_balance`: balance is `19` to `94`.
- `paused`: balance is below `19` and no free orders remain.

## Recharge

Recharge accounting lives in `api/_lib/walletRecharge.ts`. The return endpoint credits a wallet only once, creates a `recharge` transaction, and resumes paused stores when the wallet can accept orders again.
