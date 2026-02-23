This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase setup

1. Copy `.env.local.example` to `.env.local` and fill values.
2. In Vercel, add the same vars in Project Settings > Environment Variables.
3. Use the helpers in `src/lib/supabase` when you start wiring data.
4. Optional: call `/api/health` to verify envs are present (no secrets exposed).

## Environment variables (Supabase) / Vercel

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `NEXT_PUBLIC_SITE_URL` (ex: `https://votre-domaine.fr`) for sitemap/metadata.
4. In Vercel, add the same variables in Project Settings > Environment Variables.
5. Verify locally: `pnpm dev` then `curl http://localhost:3000/api/health`.
6. Validate a production build: `pnpm build`.

## Contact email (Brevo)

To send contact form emails through Brevo API, configure:

- `MAIL_PROVIDER=brevo`
- `BREVO_API_KEY=...`
- `EMAIL_FROM=sender@your-domain.tld`
- `EMAIL_FROM_NAME=Golf de Marcilly` (optional)
- `EMAIL_TO=golf@marcilly.com`
- `EMAIL_TO_NAME=Golf de Marcilly` (optional)
- `EMAIL_REPLY_TO=contact@your-domain.tld` (optional)
- `CONTACT_SEND_CONFIRMATION=true` (optional)

Note: if `MAIL_PROVIDER` is unset and `BREVO_API_KEY` is present, Brevo is selected automatically.

For SMTP mode (legacy), keep `MAIL_PROVIDER=smtp` (or unset) and use:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE` (optional)
- `EMAIL_FROM`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Initiation Reservation Module (Production)

### Features

- Public booking page: `/initiation/reservation`
- Slot API: `GET /api/slots`
- Booking + SumUp checkout API: `POST /api/reservations`
- Reservation status API: `GET /api/reservations/:id`
- SumUp webhook API: `POST /api/sumup/webhook`
- Payment return pages:
  - `/payment/success`
  - `/payment/cancel`
- Admin dashboard protected by password: `/admin`

### Supabase Migration

Run the SQL migration:

- File: `supabase/migrations/20260223_initiation_reservations.sql`
- Apply it with Supabase SQL Editor or Supabase CLI migration workflow.

This migration creates:

- `initiation_session_slots`
- `initiation_reservations`
- a transactional function `create_initiation_reservation(...)` to prevent overbooking

### Required Environment Variables

Keep existing Supabase public vars and add:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUMUP_API_KEY`
- `SUMUP_MERCHANT_CODE`
- `APP_BASE_URL` (example: `https://www.golfdemarcilly.fr`)
- `ADMIN_PASSWORD`

Optional:

- `SUMUP_API_BASE_URL` (defaults to `https://api.sumup.com`)
- `SUMUP_WEBHOOK_SECRET` (reserved for stricter webhook validation)

### Capacity and Concurrency Rules

- Booking allowed only within next 7 days (rolling window, server-side enforced).
- Slots generated only on Friday, Saturday, Sunday.
- Fixed slot templates:
  - `11:00-12:00`
  - `14:00-15:00`
- Capacity = 15 participants per slot.
- Pending reservations expire after 10 minutes.
- Overbooking is prevented by database transaction function.

### Payment Flow

1. `POST /api/reservations` validates payload server-side.
2. Reservation created as `PENDING` with 10-min expiration.
3. SumUp hosted checkout is created server-side.
4. User is redirected to SumUp checkout URL.
5. Status is synchronized through webhook and success polling.

### Local Verification Checklist

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Then verify:

- `/tarifs` buttons redirect to `/initiation/reservation`
- booking form calculates total correctly
- full slots display as `Complet`
- `/admin` login works with `ADMIN_PASSWORD`
