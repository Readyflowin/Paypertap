# Database Schema

## `wallets/{sellerId}`

One wallet per seller. `sellerId` is the Firebase Auth UID.

```ts
{
  sellerId: string;
  balance: number;
  freeOrdersRemaining: number;
  totalOrdersCharged: number;
  totalWalletSpent: number;
  status: "active" | "low_balance" | "paused";
  lowBalanceEmailSentAt?: Timestamp;
  emptyWalletEmailSentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## `walletTransactions/{transactionId}`

Append-only transaction history.

```ts
{
  sellerId: string;
  type: "recharge" | "free_order" | "order_charge" | "bonus" | "adjustment" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  notes?: string;
  createdAt: Timestamp;
}
```

## `orders/{orderId}`

Orders are the source of truth for seller order management.

Important fields include seller/store/product IDs, customer details, payment mode, order status, order timestamps, wallet snapshots, payment-return audit fields, seller notes, and timeline-relevant timestamps.

Supported statuses:

- `pending_payment`
- `payment_returned`
- `pending_confirmation`
- `processing`
- `completed`
- `cancelled`

## `stores/{storeId}`

Stores include public storefront configuration and order availability fields:

- `published`
- `acceptingOrders`
- `pauseReason`
- `paymentReturnToken`

Wallet-empty stores are paused automatically. Wallet recharge resumes stores automatically when the wallet can accept orders again.
