# Migration Notes

The wallet migration replaced the old buyer-paid PayPerTap checkout model.

Current supported flow:

1. Buyer places an order.
2. Seller receives the order.
3. PayPerTap charges the seller wallet through the order engine.
4. Buyer pays the seller directly by COD, UPI, Razorpay payment link, or another seller-managed method.

Removed concepts:

- buyer PayPerTap platform fee
- legacy checkout session payment flow
- PayPerTap buyer payment screens
- legacy server-side buyer-payment APIs
- legacy advance and seller-collect calculation fields
- simulated buyer-payment flow

Future work should keep wallet mutations in wallet/order server services. UI components, checkout screens, dashboard actions, and payment-return logic should not directly modify wallet balances.
