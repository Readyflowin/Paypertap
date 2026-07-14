# Deployment Guide

## Preflight

```bash
npm ci
npm run lint
npm run build
npm run test:routes
```

## Firebase

Deploy Firestore rules after reviewing production access requirements:

```bash
firebase deploy --only firestore:rules
```

Rules protect seller-owned wallets, wallet transactions, orders, stores, and products. Admin-only mutations must remain server-side.

## Vercel

Set the environment variables listed in the README for production. Keep test flags disabled unless intentionally validating guarded endpoints.

The app uses Vercel rewrites for static marketing routes, app routes, and serverless APIs. Routes for checkout, order success, payment return, and wallet recharge return are `noindex`.

## Final QA

Run through:

- new seller onboarding
- existing seller login
- store and product management
- COD order
- partial-advance order and return
- wallet recharge return
- wallet-empty store pause
- mobile checkout and dashboard smoke checks
