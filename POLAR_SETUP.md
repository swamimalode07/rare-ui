# Launch checklist

Pending work before RareUI Pro goes live. Dev currently runs on Polar sandbox.

## Polar (production)

Sandbox and production are separate accounts. Nothing carries over.

1. Sign in at polar.sh and create the organization.
2. Products: create "RareUI Pro", one-time payment. Copy its ID from the URL (`/products/<id>`).
3. Settings, General, Developers: create an access token with all scopes, no expiry.
4. Settings, Webhooks, Add Endpoint:
   - URL: `https://<domain>/api/auth/polar/webhooks`
   - Format: Raw
   - Events: `order.paid`, `order.refunded`
   - Copy the secret.
5. Set in Vercel env:
   ```
   POLAR_SERVER=production
   POLAR_ACCESS_TOKEN=<production token>
   POLAR_PRO_PRODUCT_ID=<production product id>
   POLAR_WEBHOOK_SECRET=<production webhook secret>
   ```
6. Test one real purchase, then refund it. License should go Active, then the token should return 401.

## Env and services

- [ ] All vars from `.env.example` set in Vercel.
- [ ] `BETTER_AUTH_URL=https://<domain>`
- [ ] New `BETTER_AUTH_SECRET` for production (`openssl rand -base64 32`), not the dev one.
- [ ] Production Neon branch or database, then `npm run db:migrate` against it.
- [ ] Google OAuth client: add origin `https://<domain>` and redirect `https://<domain>/api/auth/callback/google`.
- [ ] Google OAuth consent screen published (out of testing mode).

## Code

- [ ] Make the `rareuipro` GitHub repo private.
- [ ] Add Pro components to `registry-pro.json`, source in `components/pro/`, then `npm run registry:build`.
- [ ] `SITE_URL` in `lib/site.ts` matches the Pro domain (used in the CLI snippet on `/account`).
- [ ] Email verification and password reset (Resend).

## Legal

- [ ] Have the Pro license in Terms and `LICENSE` reviewed (currently a short draft).
- [ ] Review Terms and Privacy in `lib/legal.ts` for Pro, and confirm `MERCHANT_PRIVACY_URL` points to Polar's current privacy policy.
