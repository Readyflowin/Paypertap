# Firestore Security Audit

Date: 2026-07-13

Scope reviewed:

- `firestore.rules`
- client Firebase SDK usage in `src/services`
- server Admin SDK usage in `api/_lib` and API route wrappers
- script Admin SDK usage in `scripts`
- attached pasted rules snapshot

Important note: the attached rules snapshot still contains legacy `booking`, `checkoutSessions`, and Rs 20 PayPerTap payment logic. The workspace `firestore.rules` was newer and wallet-aware. If the attached snapshot is deployed anywhere, replace it immediately.

## 1. Firestore Usage Inventory

| File | Function | Collection / path | Operation | Auth expectation | Side | Purpose | Rule coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/lib/firebase.ts` | module init | project Firestore | `getFirestore` | public config | Client | Firebase client instance | N/A |
| `src/services/sellerService.ts` | `getSeller` / `getSellerByUid` | `sellers/{uid}` | `getDoc` | owner | Client | Load seller profile | YES |
| `src/services/sellerService.ts` | `getStore` | `stores/{storeId}` | `getDoc` | owner or public published | Client | Load seller store | YES |
| `src/services/sellerService.ts` | `ensureMinimalSeller` | `sellers/{uid}` | `setDoc` | signed-in owner | Client | Create seller shell after auth | YES |
| `src/services/sellerService.ts` | `ensureMinimalSeller` | `wallets/{uid}` | transaction `get` + `set` via `initializeWallet` | signed-in owner | Client | Create default wallet if missing | YES |
| `src/services/sellerService.ts` | `reserveStoreSlug` | `storeSlugs/{slug}` | `getDoc`, `setDoc`, retry `getDoc` | signed-in owner | Client | Reserve unique store slug | YES |
| `src/services/sellerService.ts` | `completeStoreOnboarding` | `stores/{storeId}` | `setDoc(..., merge)` | owner with reserved slug | Client | Create/update store | YES |
| `src/services/sellerService.ts` | `completeStoreOnboarding` | `sellers/{uid}` | `updateDoc` | owner | Client | Advance onboarding | YES |
| `src/services/sellerService.ts` | `completeProductOnboarding` | `products/{productId}` | `setDoc` via `createSellerProduct` | owner | Client | First product setup | YES |
| `src/services/sellerService.ts` | `completeProductOnboarding` | `sellers/{uid}` | `updateDoc` | owner | Client | Complete onboarding | YES |
| `src/services/storeService.ts` | `getStorePaymentSettings` | `stores/{storeId}` | `getDoc` | owner | Client | Load payment config | YES |
| `src/services/storeService.ts` | `getStorePaymentSettings` | `stores/{storeId}` | `updateDoc` | owner | Client | Backfill missing payment settings/token | YES, but token should be private long-term |
| `src/services/storeService.ts` | `updateStorePaymentSettings` | `stores/{storeId}` | `updateDoc` | owner | Client | COD / partial advance settings | YES |
| `src/services/storeService.ts` | `getStoreById` | `stores/{storeId}` | `getDoc` | owner or public published | Client | Store lookup | YES |
| `src/services/storeService.ts` | `getStoreBySlugOrId` | `stores/{id}`, `storeSlugs/{slug}` | `getDoc` | public for published store / slug get | Client | Public store route lookup | YES |
| `src/services/storeService.ts` | `updateStorePublishStatus` | `stores/{storeId}` | `updateDoc` | owner | Client | Publish/unpublish | YES |
| `src/services/storeService.ts` | `updateStoreCustomization` | `stores/{storeId}` | `updateDoc`, `getDocFromServer` | owner | Client | Store settings/theme/contact/policies | YES |
| `src/services/productService.ts` | `getProductById` | `products/{productId}` | `getDoc` | public if published/open or owner | Client | Product detail | YES |
| `src/services/productService.ts` | `getOpenProductsByStoreId` | `products` | `query where storeId ==, status in` | public if store published | Client | Public product list | YES |
| `src/services/productService.ts` | `getPublicProductsByStoreId` | `products` | `query where storeId ==, status in` | public if store published | Client | Public product list | YES |
| `src/services/productService.ts` | `getSellerProductsForStore` | `products` | `query where sellerId ==` | owner | Client | Dashboard products | YES |
| `src/services/productService.ts` | `createSellerProduct` | `products/{autoId}` | `setDoc` | owner of store | Client | Product creation | YES |
| `src/services/productService.ts` | `updateSellerProduct` | `products/{productId}` | `updateDoc` | owner | Client | Product edit | YES |
| `src/services/productService.ts` | `deleteSellerProduct` | `products/{productId}` | `deleteDoc` or `updateDoc status=unpublished` | owner | Client | Delete/preserve history | YES |
| `src/services/collectionService.ts` | `listStoreCollections` | `stores/{storeId}/collections` | `getDocs` | public if store published or owner | Client | Store collections | YES |
| `src/services/collectionService.ts` | `createStoreCollection` | `stores/{storeId}/collections/{autoId}` | `setDoc` | store owner | Client | Create collection | YES |
| `src/services/collectionService.ts` | `updateStoreCollection` | `stores/{storeId}/collections/{collectionId}` | `updateDoc` | store owner | Client | Rename collection | YES |
| `src/services/collectionService.ts` | `updateStoreCollection` | `products` | `query sellerId/storeId/collectionId`, batched `update` | owner | Client | Propagate collection rename | YES |
| `src/services/collectionService.ts` | `clearProductsForDeletedCollection` | `products` | `query sellerId/storeId/collectionId`, batched `update` | owner | Client | Clear deleted collection refs | YES |
| `src/services/collectionService.ts` | `deleteStoreCollection` | `stores/{storeId}/collections/{collectionId}` | `deleteDoc` | store owner | Client | Delete collection | YES |
| `src/services/collectionService.ts` | `assignProductToCollection` | `products/{productId}` | `updateDoc` | product owner | Client | Assign one product | YES |
| `src/services/checkoutService.ts` | `createOrderWithReservation` | server API | fetch only | public buyer | Client/API | Create order via server engine | Rules intentionally bypassed by Admin SDK |
| `src/services/checkoutService.ts` | `getOrderById` | `orders/{orderId}` | `getDoc` | seller owner only | Client | Order success/dashboard load | PARTIAL: buyer cannot read order by rules |
| `src/services/checkoutService.ts` | `getOrdersBySellerId` | `orders` | `query where sellerId ==` | owner | Client | Dashboard order list | YES |
| `src/services/checkoutService.ts` | `getOrdersByStoreId` | `orders` | `query where storeId ==` | owner after client filter | Client | Store order list | PARTIAL: query can fail without `sellerId == request.auth.uid` |
| `src/services/checkoutService.ts` | `markOrderConfirmed` | `orders/{orderId}` | `updateDoc` | owner | Client | Legacy/alternate confirm | NO in rewritten rules; unused |
| `src/services/checkoutService.ts` | `markOrderPaymentVerified` | `orders/{orderId}` | `updateDoc` | owner | Client | Verify returned partial payment | YES |
| `src/services/checkoutService.ts` | `acceptOrder` | `orders/{orderId}` | `updateDoc` | owner | Client | Move to processing | YES |
| `src/services/checkoutService.ts` | `updateOrderNotes` | `orders/{orderId}` | `updateDoc` | owner | Client | Internal seller notes | YES |
| `src/services/checkoutService.ts` | `completeOrder` | `orders/{orderId}`, `products/{productId}` | transaction `get` + `update` | owner | Client | Complete order and sell reserved stock | YES |
| `src/services/checkoutService.ts` | `markOrderCancelled` | `orders/{orderId}`, `products/{productId}` | transaction `get` + `update` | owner | Client | Cancel and release stock | YES |
| `src/services/walletService.ts` | `initializeWallet` | `wallets/{sellerId}` | transaction `get` + `set` | owner | Client | Create default wallet | YES |
| `src/services/walletService.ts` | `getWallet` | `wallets/{sellerId}` | `getDoc` | owner | Client | Dashboard wallet | YES |
| `src/services/walletService.ts` | `recordWalletTransaction` | `walletTransactions` | `addDoc` | none should use it | Client | Legacy/helper only | NO in rewritten rules; this must remain unused |
| `src/services/walletService.ts` | `getWalletTransactions` | `walletTransactions` | `query where sellerId ==` | owner | Client | Wallet activity | YES |
| `src/services/walletService.ts` | `updateWallet` | `wallets/{sellerId}` | `updateDoc` | none should use it | Client | Helper only | NO in rewritten rules; server owns mutation |
| `src/services/walletService.ts` | `startWalletRecharge` | server API | fetch with ID token | signed-in seller | Client/API | Create recharge session | Rules bypassed by Admin SDK |
| `src/services/walletService.ts` | `processWalletRechargeReturn` | server API | unauthenticated token POST | token holder | Client/API | Credit recharge return | Rules bypassed by Admin SDK |
| `src/services/themeService.ts` | `getThemeById` | `themes/{themeId}` | `getDoc` | public | Client | Load theme metadata | YES |
| `api/_lib/createOrder.ts` | `createChargeableOrder` | `stores/{id}`, `products/{id}`, `wallets/{sellerId}` | transaction `get` | server Admin | Server | Validate store/product/wallet | Bypasses rules |
| `api/_lib/createOrder.ts` | `createChargeableOrder` | `wallets`, `walletTransactions`, `orders`, `products`, `stores` | transaction `set/update` | server Admin | Server | Atomic wallet charge + order + reservation | Bypasses rules |
| `api/_lib/paymentReturn.ts` | `handlePaymentReturn` | `stores` | `query where paymentReturnToken == limit 1` | token holder | Server | Resolve return token | Bypasses rules |
| `api/_lib/paymentReturn.ts` | `handlePaymentReturn` | `orders/{orderId}` | transaction `get/update` | token + pendingOrderId | Server | Mark `payment_returned` | Bypasses rules |
| `api/_lib/walletRecharge.ts` | `createWalletRecharge` | `walletRecharges/{autoId}` | `set` | verified Firebase ID token | Server | Start wallet recharge | Bypasses rules |
| `api/_lib/walletRecharge.ts` | `creditWalletRecharge` | `walletRecharges` | `query where token == limit 1` | token holder | Server | Find recharge session | Bypasses rules |
| `api/_lib/walletRecharge.ts` | `creditWalletRecharge` | `walletRecharges`, `wallets`, `walletTransactions` | transaction `get/set/update` | token holder | Server | Credit wallet once | Bypasses rules |
| `api/_lib/walletRecharge.ts` | `creditWalletRecharge` | `sellers/{sellerId}`, `stores/{storeId}` | `get`, `set merge` | server | Server | Auto-resume store | Bypasses rules |
| `api/_lib/walletRecharge.ts` | `applyAdminWalletAdjustment` | `wallets`, `walletTransactions`, `sellers`, `stores` | transaction + `get/set/update` | admin custom claim | Server | Bonus/adjustment/refund | Bypasses rules |
| `api/_lib/emailNotifications.ts` | `sendAdminSellerOnboardedEmailIfNeeded` | `sellers`, `stores` | `get`, store `set merge` | server | Server | Admin onboarding email audit | Bypasses rules |
| `api/_lib/emailNotifications.ts` | `sendWalletRechargeSuccessfulEmailIfNeeded` | `walletRecharges`, `sellers`, `stores` | `get`, recharge `set merge` | server | Server | Recharge email once | Bypasses rules |
| `api/_lib/emailNotifications.ts` | `sendWalletStateEmailIfNeeded` | `wallets`, `sellers`, `stores` | `get`, wallet `set merge` | server | Server | Low/empty wallet email once | Bypasses rules |
| `api/send-admin-onboarding-email.ts` | handler | `sellers`, `stores` | Admin helper above | verified Firebase ID token | Server | Trigger admin onboarding email | Bypasses rules |
| `scripts/report-bad-image-urls.ts` | `collectFindings` | `products`, `stores` | Admin collection scan | local Admin env | Script | Operational image audit | Bypasses rules |

## 2. Current Rule Problems

- Attached rules snapshot is critically stale: legacy `phaseOneBookingAdvance`, `checkoutSessions`, `bookingAdvanceAmount`, `sellerCollectAmount`, `sellerConfirmationAdvance*`, and Rs 20 comments would reject new wallet/order writes and preserve removed concepts.
- Current workspace rules allowed client `walletTransactions` creation. Impact: sellers could forge wallet activity rows. Fixed by making wallet transactions admin-only writes.
- Current workspace rules allowed public product reservation updates. Impact: any attacker could increment `reservedQuantity` on open public products and exhaust inventory without creating an order or charging wallet. Fixed by removing public inventory mutation.
- Current workspace rules allowed `events` create with weak validation and no store ownership/published-store check. No current code uses events. Fixed by closing events.
- Store and product create/update were not consistently key-restricted. Impact: owners could add hidden fields to public docs. Fixed with explicit allowlists.
- Order seller updates allowed too many operational fields without transition checks. Impact: browser attacker could skip intended UI flow. Improved with transition-specific checks.
- `getOrdersByStoreId(storeId)` queries only by `storeId`; seller ownership is checked after fetch. Rules cannot prove ownership from that query. Prefer querying `where("sellerId", "==", uid)` and filtering by store locally, or add both filters.

## 3. Unused Rules

- `customers/{customerId}`: no active Firestore writes/reads; dashboard derives leads from `orders`. Keep read/update only if historical docs exist; otherwise remove later.
- `payments/{paymentId}`: no active code uses it after migration. Safe to keep server-only read for historical docs; remove after data migration.
- `events/{eventId}`: no active client writes. Closed in rewritten rules.
- Attached-only `checkoutSessions/{checkoutId}`: removed from workspace rules and code. Do not redeploy.
- Attached-only legacy booking helpers and fields: removed from rewritten rules.

## 4. Missing Rules

- `walletRecharges/{rechargeId}` needed explicit server-only write and owner read. Added.
- `walletTransactions/{transactionId}` needed append-only server/admin write and owner read. Added.
- `wallets/{sellerId}` needed default owner create but no owner mutation of balance/status/free orders. Added.
- `stores/{storeId}` needed `acceptingOrders` / `pauseReason` handling: owner can create initial values, but only server should auto-pause/resume after creation. Added.
- `orders/{orderId}` needed modern statuses and wallet snapshot immutability. Added.

## 5. Security Vulnerabilities

- Critical, code not rules: `/api/wallet-recharge-return` credits wallet based only on return token. A seller can start a recharge, skip payment, call the return endpoint, and receive wallet balance. Fix requires Razorpay verification/webhook or a signed server-side payment confirmation.
- High, rules: public product reservation update allowed inventory denial-of-service. Fixed.
- High, rules: owner-created wallet transactions allowed fake transaction history. Fixed.
- Medium, code/rules design: public store documents expose `paymentReturnToken`. Payment return is not payment verification, but the token should still move to private server-only store config.
- Medium, code: `/api/create-order` is public and charges seller wallet on any syntactically valid order. Add CAPTCHA/rate limiting/device throttling to prevent wallet-drain spam.
- Medium, rules: old `events` create path allowed analytics spam. Fixed by closing events.
- Medium, rules: product/store public docs can expose operational/private fields because Firestore rules cannot redact fields. Consider splitting public/private store and product metadata.

## 6. Ownership Problems

- `getOrdersByStoreId` lacks ownership in the query. Rule compatibility is partial. Prefer `where("sellerId", "==", uid)` on every seller dashboard order query.
- Store collections infer ownership through parent store. This is acceptable but costs a `get()`/`exists()`.
- Products correctly carry `sellerId` and `storeId`; rewritten rules require both to remain immutable after create.
- Wallet ownership is path-based (`wallets/{sellerId}`), which is strong.
- Wallet transactions are document-field based (`sellerId`), which is acceptable for reads and server-only writes.

## 7. Role Problems

- Seller: may manage own seller profile, store content/settings, products, collections, order notes/status actions, and read own wallet/history.
- Customer/public: may read published stores/products/collections/themes and call server APIs for order/payment-return flows. Public must not write Firestore directly.
- Admin custom claim: may read/write admin settings and historical/server-only docs from client if needed.
- Server Admin SDK: must own order creation, wallet mutation, recharge accounting, payment return mutation, admin adjustment, store auto-pause/resume, and email audit fields.

## 8. Query Compatibility Issues

- Compatible: public product query `products where storeId == X and status in [...]` because every returned doc must be public status and in a published store.
- Compatible: seller products query `products where sellerId == uid`.
- Compatible: wallet transactions query `walletTransactions where sellerId == uid`.
- Compatible: collection subcollection read under published/owned store.
- Partial: `orders where storeId == storeId` can be denied because rules cannot know all docs belong to the requesting seller. Use `orders where sellerId == uid` plus optional local store filter, or add both `sellerId` and `storeId`.
- Server-only queries are not rule-limited because Admin SDK bypasses rules.

## 9. Required Firestore Indexes

Required or likely required:

- `products`: `storeId ASC`, `status ASC` for public product lists with `status in`.
- `products`: `sellerId ASC`, `storeId ASC`, `collectionId ASC` for collection rename/delete batch queries.

Recommended for performance if UI moves sorting into Firestore:

- `orders`: `sellerId ASC`, `createdAt DESC`.
- `orders`: `sellerId ASC`, `storeId ASC`, `createdAt DESC`.
- `walletTransactions`: `sellerId ASC`, `createdAt DESC`.
- `walletRecharges`: `token ASC` for server return lookup.
- `stores`: `paymentReturnToken ASC` for server payment-return lookup.

## 10. Recommended Schema Improvements

- Split `stores/{storeId}` into public and private fields. Move `paymentReturnToken`, wallet pause internals, email audit fields, and admin audit fields out of public-readable store docs.
- Split product public data from internal inventory counters if public product reads should not expose `reservedQuantity` and `soldQuantity`.
- Rename `checkoutId` to `orderId` everywhere after historical compatibility is no longer needed.
- Remove `customers`, `payments`, and any old event docs after export/backfill.
- Make these immutable by rule and by convention: `sellerId`, `storeId`, `productId`, wallet snapshots, wallet transaction IDs, buyer identity/contact fields, and order creation timestamps.
- Move seller order actions to server APIs if you want fully atomic order/product timeline enforcement in one trusted layer.

## 11. Performance Improvements

- Store collection rules use `get()` on the parent store for every collection read/write. Denormalizing `sellerId` and `isPublished` on collection docs would reduce rule reads but adds write complexity.
- Product public read rules use `get()` on store. This is necessary with current schema to ensure the parent store is published.
- Client sorts orders/wallet transactions/products in memory. Move to `orderBy` with indexes once datasets grow.
- Avoid client `getOrdersByStoreId`; use seller-scoped query to improve rule compatibility and reduce denied reads.

## 12. Proposed Firestore Rules

The proposed production rules have been written to [`firestore.rules`](../firestore.rules).

Highlights:

- default deny catch-all
- server-only wallet mutations
- server-only order creation
- no public product reservation writes
- no client-created wallet transactions
- no client event writes
- explicit store/product/seller field allowlists
- path-based wallet ownership
- seller-only order management transitions
- public read only for published stores and public product statuses

Local validation status:

- `firebase deploy --only firestore:rules --dry-run` could not complete because this shell has invalid Firebase auth.
- `firebase emulators:exec --only firestore ...` could not run because the installed Java is below version 21.
- Run one of those checks in an authenticated Java 21+ environment before deploying.

## 13. Migration Checklist

- Deploy the rewritten `firestore.rules` after Firebase CLI validation.
- Change `getOrdersByStoreId` usage to include `sellerId == currentUser.uid` or remove it.
- Keep `recordWalletTransaction` and `updateWallet` unused on the client, or delete/export-restrict them.
- Replace wallet recharge return-token crediting with verified Razorpay payment confirmation.
- Move `paymentReturnToken` into a private server-only store config document.
- Consider server APIs for seller order actions if strict transaction-level order/product enforcement is required.
- Create the listed composite indexes before moving sorting into Firestore.
- Export and remove old `customers`, `payments`, and event data if not needed.
- Confirm no deployed rules still match the attached legacy booking snapshot.

## 14. Risk Assessment

After the rules rewrite, the largest remaining risk is not Firestore rules; it is wallet recharge accounting. A return-token-only wallet credit flow is not production-safe for a paid wallet. The next highest risk is public order spam draining seller wallets through `/api/create-order`; add abuse prevention before launch.

Rules risk is substantially lower after the rewrite: direct wallet tampering, fake wallet history, public inventory reservation, hidden field injection, and stale booking rules are addressed. Final deployment should wait until rules compile under Firebase tooling and the wallet recharge verification gap is closed.
