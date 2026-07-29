# Procedure Supabase et Variables de Production

Ce document sert a executer la prochaine etape apres les phases de durcissement :

- appliquer la migration Supabase critique
- renseigner les variables d'environnement de production
- verifier rapidement que tout est pret

## 1. Migration Supabase a appliquer

Migration cible :

- [supabase/migrations/20260729_initiation_reservation_hardening.sql](/c:/Users/Anthony/Desktop/website-golfmarcilly/supabase/migrations/20260729_initiation_reservation_hardening.sql:1)

Cette migration est obligatoire pour finaliser le durcissement du systeme de reservation d'initiation.

Elle ajoute :

- verrouillage du creneau pendant la creation
- reutilisation d'une reservation `PENDING` identique
- unicite de `sumup_checkout_id`
- unicite de `sumup_transaction_id`

## 2. Methode recommandee : Supabase SQL Editor

Si le projet Supabase est deja en production et que tu veux aller vite, la methode la plus simple est :

1. ouvrir le dashboard Supabase du projet cible
2. aller dans `SQL Editor`
3. ouvrir le fichier local :
   - [supabase/migrations/20260729_initiation_reservation_hardening.sql](/c:/Users/Anthony/Desktop/website-golfmarcilly/supabase/migrations/20260729_initiation_reservation_hardening.sql:1)
4. coller le contenu dans l'editeur SQL
5. executer la requete

Verification immediate attendue :

- pas d'erreur SQL
- index uniques crees
- fonction `create_initiation_reservation` remplacee

## 3. Methode CLI si tu utilises Supabase localement

Si tu utilises la CLI Supabase sur la machine :

1. connecter le projet cible
2. pousser les migrations

Commande type :

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Si la CLI n'est pas installee globalement, utiliser au besoin :

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Note :

- je n'ai pas ajoute de configuration CLI supplementaire dans le repo
- si tu n'utilises pas deja la CLI Supabase, prefere le `SQL Editor`

## 4. Variables d'environnement a renseigner

### Bloc site / Supabase

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Bloc admin

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Recommandation :

- `ADMIN_SESSION_SECRET` doit etre un secret dedie, long et aleatoire
- ne pas reutiliser `ADMIN_PASSWORD` comme secret de session en production

### Bloc operations

- `OPS_CRON_TOKEN`
- `FALLBACK_QUEUE_ALERT_EMAIL`
- `FALLBACK_QUEUE_RETENTION_DAYS`

Recommandation :

- `OPS_CRON_TOKEN` doit etre long et aleatoire
- `FALLBACK_QUEUE_RETENTION_DAYS=14` est une bonne base

### Bloc initiation paiement

- `SUMUP_API_KEY`
- `SUMUP_MERCHANT_CODE`
- `APP_BASE_URL`
- `SUMUP_WEBHOOK_SECRET`

### Bloc Google Calendar

- `GOOGLE_CALENDAR_CLIENT_EMAIL`
- `GOOGLE_CALENDAR_PRIVATE_KEY`
- `GOOGLE_CALENDAR_INITIATION_ID`

### Bloc email

- `EMAIL_TO`
- `EMAIL_TO_NAME`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`

Si SMTP :

- `MAIL_PROVIDER=smtp`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`

Si Brevo :

- `MAIL_PROVIDER=brevo`
- `BREVO_API_KEY`

## 5. Valeurs a generer proprement

Pour generer un secret fort en PowerShell :

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

Utiliser cette commande pour :

- `ADMIN_SESSION_SECRET`
- `OPS_CRON_TOKEN`
- tout autre secret applicatif dedie

## 6. Ordre recommande de configuration

1. configurer les variables Supabase
2. configurer `ADMIN_SESSION_SECRET`
3. configurer `OPS_CRON_TOKEN`
4. configurer email
5. configurer SumUp
6. configurer Google Calendar
7. appliquer la migration Supabase
8. redéployer l'application

## 7. Verification rapide apres configuration

Executer ou verifier :

### Health public

```text
GET /api/health
```

Attendu :

- `200` si tout est bon
- `503` si un service critique manque encore

### Health interne

```text
GET /api/health
Authorization: Bearer <OPS_CRON_TOKEN>
```

Attendu :

- vue detaillee avec `environment`
- vue detaillee avec `fallbackQueue`

### Admin

Verifier :

- `/admin`
- login avec `ADMIN_PASSWORD`
- logout

### Initiation

Verifier :

- `/initiation/reservation`
- chargement des creneaux
- creation d'une reservation
- creation ou reutilisation du checkout

## 8. Webhook SumUp

Apres configuration de `SUMUP_WEBHOOK_SECRET`, verifier dans SumUp :

- URL webhook pointee vers :
  - `/api/sumup/webhook`
- secret aligne avec la variable d'environnement

Tests attendus :

- mauvaise signature -> `401`
- payload invalide -> `400`
- secret absent -> `503`
- webhook valide -> `200`

## 9. Validation finale locale avant prod

Les commandes a garder comme reference :

```bash
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

## 10. Checklist ultra courte

Avant ouverture publique :

- migration `20260729_initiation_reservation_hardening.sql` appliquee
- `ADMIN_SESSION_SECRET` renseigne
- `OPS_CRON_TOKEN` renseigne
- `SUMUP_WEBHOOK_SECRET` renseigne si paiement actif
- health public OK
- health interne OK
- login admin OK
- reservation initiation OK
- webhook SumUp OK
