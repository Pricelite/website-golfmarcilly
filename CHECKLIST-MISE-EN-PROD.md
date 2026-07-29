# Checklist Mise En Prod

Cette checklist sert a finaliser la mise en production du site apres les phases de durcissement.

## 1. Migrations Supabase

La migration la plus importante a appliquer est :

- [supabase/migrations/20260729_initiation_reservation_hardening.sql](/c:/Users/Anthony/Desktop/website-golfmarcilly/supabase/migrations/20260729_initiation_reservation_hardening.sql:1)

Elle apporte :

- verrouillage du creneau pendant la creation de reservation
- reutilisation d'une reservation `PENDING` identique
- unicite de `sumup_checkout_id`
- unicite de `sumup_transaction_id`

Avant mise en ligne, verifier que :

- la migration est appliquee sur la base cible
- les anciennes migrations `20260223_*` et `20260224_*` sont deja presentes
- la fonction `create_initiation_reservation` a bien ete remplacee par la version durcie

## 2. Variables d'environnement critiques

Verifier au minimum :

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `OPS_CRON_TOKEN`
- `EMAIL_TO`
- `EMAIL_FROM`

Pour le mode initiation avec paiement :

- `SUMUP_API_KEY`
- `SUMUP_MERCHANT_CODE`
- `APP_BASE_URL`
- `SUMUP_WEBHOOK_SECRET`

Pour le mode Google Calendar :

- `GOOGLE_CALENDAR_CLIENT_EMAIL`
- `GOOGLE_CALENDAR_PRIVATE_KEY`
- `GOOGLE_CALENDAR_INITIATION_ID`

Optionnels utiles :

- `FALLBACK_QUEUE_ALERT_EMAIL`
- `FALLBACK_QUEUE_RETENTION_DAYS`
- `BREVO_API_KEY`

## 3. Verification Healthcheck

Sans token :

- `GET /api/health`
- attendu : statut `200` ou `503` avec vue publique minimale

Avec token ops :

- `GET /api/health`
- header : `Authorization: Bearer <OPS_CRON_TOKEN>`
- attendu : vue detaillee avec :
  - `environment`
  - `fallbackQueue`
  - `generatedAt`

## 4. Verification Fallback Queue

Verifier :

- `GET /api/ops/fallback-queue`
- ou `POST /api/ops/fallback-queue`
- header : `Authorization: Bearer <OPS_CRON_TOKEN>`

Attendus :

- `401` sans token
- `200` avec token
- presence des compteurs :
  - `processed`
  - `sent`
  - `retained`
  - `movedToFailed`
  - `pending`
  - `alertSent`

## 5. Verification Admin

Verifier :

- acces a `/admin`
- login avec `ADMIN_PASSWORD`
- creation d'un cookie de session admin
- logout via `/admin/logout`

Apres login, verifier que :

- le dashboard s'affiche
- la liste des reservations initiation remonte bien
- les stats et creneaux sont cohérents

## 6. Verification Reservation Initiation

Tester le flux principal :

1. charger `/initiation/reservation`
2. verifier la remontee des creneaux
3. reserver un creneau valide
4. verifier la creation du checkout SumUp
5. verifier la page retour paiement
6. verifier la mise a jour du statut via webhook ou sync

Verifier aussi :

- refus de depassement de capacite
- refus d'un payload invalide
- reutilisation correcte d'une reservation `PENDING` identique
- non-ecrasement d'un `checkout_id` deja pose

## 7. Verification Webhook SumUp

Verifier :

- `POST /api/sumup/webhook`
- signature invalide : `401`
- payload invalide : `400`
- secret manquant : `503`
- webhook valide : `200`

Verifier ensuite en base :

- mise a jour du statut
- mise a jour de `sumup_transaction_id`
- absence de doublons sur `sumup_checkout_id`

## 8. Verification Emails

Tester :

- formulaire contact
- formulaire newsletter
- formulaire devis
- reservation restaurant

Verifier :

- reception du mail principal
- fallback queue reste vide si le transport fonctionne
- les erreurs publiques n'exposent pas de details techniques

## 9. Verification Qualite

Executer avant mise en ligne :

```bash
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

Les 4 commandes doivent etre vertes.

## 10. Verification Post-deploiement

Dans l'heure qui suit la mise en ligne, verifier :

- `/api/health`
- `/admin`
- `/initiation/reservation`
- webhook SumUp
- fallback queue

Verifier aussi les logs serveur sur :

- `api/reservations`
- `api/sumup/webhook`
- `api/contact`
- `fallback-queue`

## 11. Decision de mise en ligne

La mise en production est prete si :

- migration Supabase appliquee
- variables critiques renseignees
- health public et interne coherents
- flux initiation valide
- admin valide
- emails valides
- lint, typecheck, test et build OK
