# Creem Payment Test Notes

## 2026-07-05 Test Checkout Closure

### Environment

- Creem test mode
- Local Next.js app exposed through Cloudflare Tunnel
- Tunnel URL: `https://capital-traveller-grande-medications.trycloudflare.com`
- Webhook URL: `https://capital-traveller-grande-medications.trycloudflare.com/api/payments/creem/webhook`
- `CREEM_SIMULATE=false`

Note: `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` were temporarily set to the tunnel URL for local testing. This URL is not a production configuration and should not be committed through `.env.local`.

### Small Credit Pack

- Product key: `pack_small`
- Credits before payment: `385`
- Credits after payment: `390`
- `payment.type`: `one_time`
- `payment.credits_granted`: `5`
- `credit_ledger.delta`: `5`
- `credit_ledger.reason`: `one_time_pack`
- Webhook resend result: duplicate `checkout.completed` returned `200` and did not grant credits again.

### Plus Membership

- Product key: `plus_monthly`
- Credits before payment: `390`
- Credits after payment: `400`
- `user.plan_key`: `free` -> `plus_monthly`
- `subscription.status`: `active`
- `payment.credits_granted`: `10`
- `credit_ledger.delta`: `10`
- `credit_ledger.reason`: `subscription_cycle`
- `checkout.completed` and `subscription.paid` resolved to the same subscription-cycle idempotency key:
  - `creem:sub:sub_snJ6huxYlXdgIvzQ2h1g0:period:2026-08-05`
- `subscription.paid` was processed after `checkout.completed` and skipped as already processed, so the first subscription cycle did not double-grant credits.

### Verified

- Creem checkout creation
- Checkout `success_url` return to `/zh/checkout/success`
- Creem webhook signing secret validation
- One-time credit pack grant
- Webhook resend idempotency for one-time purchases
- Plus subscription first-purchase grant
- `subscription.paid` deduplication for the first subscription cycle

### Still Recommended

- `popular_pack`
- `large_pack`
- `pro_monthly`
- `proplus_yearly`
- `subscription.canceled`
- `subscription.expired`
- `subscription.payment_failed`
- Production-domain webhook configuration and delivery
