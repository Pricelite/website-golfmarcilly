# Golf de Marcilly - site Next.js

Site premium, responsive et SEO-first pour le Golf de Marcilly, construit avec Next.js App Router, TypeScript, Tailwind CSS, Supabase, Google Calendar, SumUp et envoi d'emails transactionnels.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase
- Google Calendar
- SumUp
- Nodemailer / SMTP ou Brevo

## Installation

```bash
pnpm install
```

## Commandes

```bash
pnpm.cmd dev
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd start
```

Sur PowerShell Windows, `pnpm.cmd` est la commande la plus fiable.

## Structure

```text
src/
  app/                  Pages App Router, layout, metadata, routes API
  components/           UI, layout, formulaires, sections metier
  data/                 Contenu editorial centralise
  lib/                  SEO, securite, email, reservations, calendrier, Supabase
public/
  images/               Visuels du golf
  restaurant/           Visuels du restaurant
supabase/
  migrations/           Schema SQL des reservations initiation
styles/
  prose.css             Styles editoriaux
```

## Pages principales

- `/`
- `/golf`
- `/tarifs`
- `/enseignement`
- `/restaurant`
- `/evenements`
- `/actualites`
- `/actualites/[slug]`
- `/offres/[slug]`
- `/je-debute-le-golf`
- `/reserver-un-cours`
- `/contact`
- `/mentions-legales`
- `/politique-de-confidentialite`
- `/admin`

## Fonctions metier presentes

- formulaires `contact`, `newsletter` et `devis`
- demande de reservation restaurant avec email au club + accuse reception client
- page "Je debute le golf"
- reservation d'initiation avec creneaux, disponibilites et suivi
- integration Google Calendar pour les initiations
- integration SumUp pour le paiement initiation
- page admin de suivi des reservations initiation
- maintien d'un endpoint legacy `/api/initiation-reservation` pour compatibilite
- sitemap, robots, metadata et JSON-LD

## Fichiers de contenu

- [src/data/site.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/site.ts:1)
- [src/data/home.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/home.ts:1)
- [src/data/courses.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/courses.ts:1)
- [src/data/pricing.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/pricing.ts:1)
- [src/data/teaching.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/teaching.ts:1)
- [src/data/restaurant.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/restaurant.ts:1)
- [src/data/events.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/events.ts:1)
- [src/data/posts.ts](/c:/Users/Anthony/Desktop/website-golfmarcilly/src/data/posts.ts:1)

## Variables d'environnement

Voir :

- [.env.local.example](/c:/Users/Anthony/Desktop/website-golfmarcilly/.env.local.example:1)

Les blocs principaux couvrent :

- Supabase public et admin
- Google Calendar
- SumUp
- email SMTP / Brevo
- analytics
- operations / monitoring

## Healthcheck et exploitation

- `GET /api/health`
  Retour public minimal avec l'etat global des services.
- `GET /api/health` avec `Authorization: Bearer <OPS_CRON_TOKEN>`
  Retour detaille interne avec l'etat de configuration et la file fallback.
- `GET /api/ops/fallback-queue` ou `POST /api/ops/fallback-queue`
  Traitement manuel/provoque de la file de secours avec `OPS_CRON_TOKEN`.

Notes:

- la file `.contact-fallback` reste locale pour l'instant, mais elle expose maintenant un etat exploitable et une retention configurable via `FALLBACK_QUEUE_RETENTION_DAYS`
- `OPS_CRON_TOKEN` est reutilise pour les diagnostics internes et les operations cron

## Verification actuelle

Au 29 juillet 2026 :

- `pnpm.cmd lint` : OK
- `pnpm.cmd typecheck` : OK
- `pnpm.cmd test` : OK
- `pnpm.cmd build` : OK

## Notes de reprise

- Le controle `typecheck` passe via `tsconfig.typecheck.json` pour ne pas dependre des artefacts `.next` generes partiellement par `next typegen`.
- Le build reste la verification la plus complete du projet, car Next y applique aussi ses controles de routes et de metadata.
- Le parcours d'initiation canonique est maintenant `/initiation/reservation` avec les APIs `/api/slots` et `/api/reservations`.
- L'ancien endpoint `/api/initiation-reservation` est conserve uniquement comme fallback legacy et n'est plus le parcours principal.
- La reprise globale du projet est documentee dans [COMPTE-RENDU-REPRISE.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/COMPTE-RENDU-REPRISE.md:1).
- La checklist de mise en production est documentee dans [CHECKLIST-MISE-EN-PROD.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/CHECKLIST-MISE-EN-PROD.md:1).
- La procedure d'application Supabase et de configuration production est documentee dans [PROCEDURE-SUPABASE-VERCEL.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/PROCEDURE-SUPABASE-VERCEL.md:1).
