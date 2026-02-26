# Website Golf Marcilly

## Prerequisites

- Node.js 20+
- pnpm

## Installation

```bash
pnpm install
```

## Local run

```bash
pnpm dev
```

## Production checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill values.

### Core

- `NEXT_PUBLIC_SITE_URL` (ex: `https://www.golfdemarcilly.fr`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Email (required for forms)

SMTP mode:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO` (target mailbox, ex: `golf@marcilly.com`)

Brevo mode:
- `MAIL_PROVIDER=brevo`
- `BREVO_API_KEY`
- `EMAIL_FROM`
- `EMAIL_TO`

Optional:
- `EMAIL_TO_NAME`
- `EMAIL_FROM_NAME`
- `EMAIL_REPLY_TO`
- `CONTACT_SEND_CONFIRMATION=true`

### Security hardening

- `SUMUP_WEBHOOK_SECRET` (mandatory to process SumUp webhook)
- `ADMIN_PASSWORD`
- `OPS_CRON_TOKEN` (token for queue processing endpoint)

### Optional analytics

- `NEXT_PUBLIC_GA4_ID` (GA4 measurement ID, loaded only after cookie consent)

## Fallback email queue (lead reliability)

When primary email sending fails, submissions are queued in:

- `.contact-fallback/pending`
- `.contact-fallback/sent`
- `.contact-fallback/failed`

Legacy append-only file is still maintained:

- `.contact-fallback/submissions.ndjson`

### Automatic processing

Trigger queue processing with:

- `GET /api/ops/fallback-queue`
- or `POST /api/ops/fallback-queue`

Authentication:

- Header `Authorization: Bearer <OPS_CRON_TOKEN>`
- or `x-ops-token: <OPS_CRON_TOKEN>`

Optional query parameter:

- `maxItems` (default `25`, max `100`)

Recommended: configure a cron job every 5 minutes.

### Alerting

An alert email is sent automatically when pending queue reaches threshold.

Optional alert override recipient:

- `FALLBACK_QUEUE_ALERT_EMAIL`

Default recipient fallback:

- `EMAIL_TO`

## Security controls in place

- Origin checks + rate limits on contact/restaurant/initiation APIs.
- Rate limit on admin login.
- SumUp webhook signature verification.
- Security headers in `next.config.ts`.

## SEO controls in place

- Sitemap aligned with indexable pages (`/sitemap.xml`).
- `robots.txt` disallows `/admin` and `/payment`.
- `noindex` on admin and payment pages.

## RGPD / compliance controls in place

- Cookie consent banner before GA4 activation.
- Legal pages:
  - `/mentions-legales`
  - `/politique-de-confidentialite`
  - `/politique-cookies`

## Form smoke tests (manual)

1. Submit `/contact` with valid fields.
2. Submit `/initiation/reservation` with valid fields.
3. Break SMTP credentials intentionally and verify fallback queue file creation.
4. Restore SMTP credentials and call `/api/ops/fallback-queue` to drain pending queue.
5. Verify receipt on `EMAIL_TO` mailbox.

## Deployment checklist

1. Env vars set in hosting platform.
2. `pnpm lint`, `pnpm typecheck`, `pnpm build` green.
3. Cron configured for `/api/ops/fallback-queue`.
4. Test real mail delivery in production.
5. Verify legal pages and cookie consent display.
