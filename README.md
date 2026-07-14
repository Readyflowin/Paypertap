# PayPerTap

PayPerTap is a seller-first storefront for Instagram and WhatsApp sellers. Buyers place orders through store or product links, customer payments stay direct between buyer and seller, and PayPerTap charges the seller wallet per successful order.

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
npm run test:routes
```

## Environment

Client Firebase:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Server Firebase Admin:

- `FIREBASE_SERVICE_ACCOUNT_JSON`, or
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- optional `GOOGLE_APPLICATION_CREDENTIALS`

Images:

- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`

Emails:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`

App and wallet recharge:

- `PAYPERTAP_APP_URL` or `VITE_APP_URL`
- `PAYPERTAP_WALLET_RECHARGE_PAYMENT_LINK` or `VITE_PAYPERTAP_WALLET_RECHARGE_PAYMENT_LINK`
- `PAYPERTAP_ENABLE_TEST_ENDPOINTS=true` only for guarded test endpoints
- `VITE_ENABLE_INTEGRATION_TESTS=true` only for local integration-test UI exposure

## Architecture Docs

- [Architecture](docs/architecture.md)
- [Database schema](docs/database-schema.md)
- [Wallet and order lifecycle](docs/wallet-order-lifecycle.md)
- [Payment return flow](docs/payment-return-flow.md)
- [Deployment guide](docs/deployment-guide.md)
- [Migration notes](docs/migration-notes.md)
