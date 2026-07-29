# Compte rendu de reprise - site Golf de Marcilly

## Objectif du projet

Le projet est un site vitrine premium pour le Golf de Marcilly, avec une approche SEO-first et une base deja evoluee pour gerer plusieurs besoins metier :

- presentation du golf et de ses parcours
- page tarifs
- page enseignement
- page restaurant
- page evenements / seminaires
- actualites SEO
- formulaires de contact, newsletter et demande de devis
- reservation d'initiations
- reservation restaurant
- mini back-office admin pour les reservations d'initiation

Le site vise une image haut de gamme, claire et responsive, avec un ton commercial oriente conversion.

## Stack technique

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase pour certaines reservations et le stockage back-office
- Google Calendar pour la gestion des creneaux d'initiation
- SumUp pour les paiements d'initiation
- Nodemailer / SMTP ou Brevo pour les envois email

## Commandes utiles

- `pnpm.cmd dev`
- `pnpm.cmd build`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`

Le build de production passe actuellement.

## Structure du projet

- `src/app` : pages, layout global, routes API
- `src/components` : composants UI, layout, formulaires, sections
- `src/data` : contenu editorial centralise
- `src/lib` : helpers SEO, email, calendrier, reservations, Supabase, securite
- `public` : images et assets
- `supabase/migrations` : schema SQL des reservations initiation

## Pages du site

- `/` : accueil principal
- `/golf` : presentation des parcours
- `/tarifs` : tableaux de tarifs 2026
- `/enseignement` : programmes et professeurs
- `/restaurant` : page La Bergerie
- `/evenements` : offres seminaire / reception / team building
- `/actualites` : listing d'articles SEO
- `/actualites/[slug]` : detail d'un article
- `/offres/[slug]` : pages offres depuis l'accueil
- `/je-debute-le-golf` : page dediee aux initiations / debutants
- `/reserver-un-cours` : page de reservation de cours
- `/contact` : page contact
- `/mentions-legales`
- `/politique-de-confidentialite`
- `/admin` : interface admin des reservations initiation

## Sources de contenu

Les contenus sont majoritairement centralises dans `src/data`.

- `src/data/site.ts` : nom du site, navigation, footer, coordonnees, horaires
- `src/data/home.ts` : highlights accueil, offres, FAQ home
- `src/data/courses.ts` : cartes des parcours
- `src/data/pricing.ts` : tous les tableaux tarifaires
- `src/data/teaching.ts` : programmes et pros
- `src/data/restaurant.ts` : highlights, FAQ, menus, galerie
- `src/data/events.ts` : formats d'evenements
- `src/data/posts.ts` : articles actualites SEO

Important : une partie du contenu est deja reelle ou semi-reelle, mais plusieurs textes restent marketing / maquettes plutot que contenu final valide metier.

## Design et experience

Le design est deja bien avance :

- hero visuel fort
- sections premium en vert / pierre
- responsive mobile et desktop
- CTA de reservation tres presents
- footer et header globalises
- schema.org et metadata SEO integres
- barre mobile fixe en bas avec appel / reservation

## SEO et metadata

Le projet est pense pour le SEO local :

- metadata par page via `buildMetadata`
- `sitemap.ts`
- `robots.ts`
- JSON-LD organisation / breadcrumb
- contenus "actualites" pour acquisition SEO

Fichiers importants :

- `src/lib/metadata.ts`
- `src/lib/schema.ts`
- `src/app/layout.tsx`

## Fonctionnalites metier deja presentes

### 1. Formulaire de contact

Route : `src/app/api/contact/route.ts`

Fonctionnement :

- verifie l'origine de la requete
- applique un rate limit
- envoie un email
- si l'email echoue, stocke une entree de secours dans `.contact-fallback`

### 2. Formulaire newsletter

Route : `src/app/api/newsletter/route.ts`

Fonctionnement :

- validation simple
- rate limit
- envoi email au club

### 3. Demande de devis evenement

Route : `src/app/api/quote/route.ts`

Fonctionnement :

- validation
- rate limit
- envoi email au club

### 4. Reservation restaurant

Route : `src/app/api/restaurant-reservation/route.ts`

Fonctionnement :

- reservation sur creneaux dejeuner de 12h00 a 14h30
- pas plus de 7 jours a l'avance
- minimum 30 minutes avant l'heure choisie
- validation email, date, taille du groupe
- envoi d'un email au restaurant
- envoi d'un email d'accuse de reception au client

Important : ce n'est pas un moteur de disponibilite reel avec base de donnees. C'est un formulaire de demande avec confirmation manuelle par email.

### 5. Demande d'initiation simple legacy

Route : `src/app/api/initiation-reservation/route.ts`

Fonctionnement :

- envoie un email de demande
- fallback local si l'email principal echoue
- peut traiter un ancien format de selection de creneau
- expose explicitement un statut legacy pour compatibilite

Cette route correspond maintenant a un fallback legacy. Le parcours canonique d'initiation passe par `/initiation/reservation`, `/api/slots` et `/api/reservations`.

### 6. Reservation d'initiation moderne

Routes principales :

- `src/app/initiation/reservation/page.tsx`
- `src/app/api/slots/route.ts`
- `src/app/api/reservations/route.ts`
- `src/app/api/reservations/[id]/route.ts`
- `src/app/api/sumup/webhook/route.ts`
- `src/app/payment/success/page.tsx`
- `src/app/payment/cancel/page.tsx`

Fonctionnement :

- recupere les creneaux disponibles via Google Calendar
- peut aussi fonctionner en fallback Supabase pour les creneaux si Google Calendar n'est pas configure
- calcule le nombre de places restantes
- cree une reservation
- selon la configuration, 2 modes existent :
  - mode Google Calendar direct : creation immediate d'un evenement prive bloquant le creneau
  - mode Supabase + SumUp : creation d'une reservation PENDING puis paiement
- synchronisation du statut via webhook SumUp
- consultation publique du statut de reservation par ID

### 7. Back-office admin initiation

Page : `/admin`

Fonctionnement :

- page protegee par mot de passe simple via cookie
- affiche :
  - total participants
  - avec repas / sans repas
  - montant encaisse
  - recap par creneau
  - liste complete des reservations

Important : l'auth admin repose sur `ADMIN_PASSWORD`. Ce n'est pas un systeme de comptes utilisateurs robuste.

### 8. Calendrier d'annonces / planning

Route : `src/app/api/calendar-announcements/route.ts`

Fonctionnement :

- parse des flux ICS de calendriers Google
- gere les recurrences
- remonte les evenements a annoncer
- selectionne prioritairement certains calendriers selon leur couleur

## Base de donnees / Supabase

Le dossier `supabase/migrations` contient au moins deux migrations pour les initiations :

- creation des tables de creneaux et reservations
- mise a jour de la capacite par defaut de 15 a 12 places

Tables principales :

- `initiation_session_slots`
- `initiation_reservations`

Statuts :

- `PENDING`
- `PAID`
- `CANCELED`
- `EXPIRED`
- `FAILED`

## Variables d'environnement importantes

Le fichier `.env.local.example` documente bien la config.

Principales variables :

- Supabase public :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase admin :
  - `SUPABASE_SERVICE_ROLE_KEY`
- Google Calendar :
  - `GOOGLE_CALENDAR_CLIENT_EMAIL`
  - `GOOGLE_CALENDAR_PRIVATE_KEY`
  - `GOOGLE_CALENDAR_INITIATION_ID`
- SumUp :
  - `SUMUP_API_KEY`
  - `SUMUP_MERCHANT_CODE`
  - `SUMUP_WEBHOOK_SECRET`
  - `SUMUP_API_BASE_URL`
- Site :
  - `NEXT_PUBLIC_SITE_URL`
  - `APP_BASE_URL`
- Email :
  - `EMAIL_TO`
  - `EMAIL_TO_NAME`
  - `EMAIL_FROM`
  - `EMAIL_FROM_NAME`
  - `MAIL_PROVIDER`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_SECURE`
  - `BREVO_API_KEY`
- Restaurant :
  - `RESTAURANT_RESERVATION_EMAIL_TO`
  - `RESTAURANT_RESERVATION_EMAIL_TO_NAME`
- Admin :
  - `ADMIN_PASSWORD`
- Monitoring :
  - `OPS_CRON_TOKEN`
  - `FALLBACK_QUEUE_ALERT_EMAIL`
- Analytics :
  - `NEXT_PUBLIC_GA4_ID`

## Etat technique actuel

### Ce qui passe

- `pnpm.cmd lint` : OK
- `pnpm.cmd typecheck` : OK
- `pnpm.cmd build` : OK

## Points d'attention / dette technique

### 1. Problemes d'encodage visibles dans certains fichiers

On voit des caracteres mal encodes dans plusieurs sources, par exemple :

- `Orléans`
- `Événements` mal affiche dans certaines donnees
- symbole euro mal rendu

Cela touche notamment certains fichiers `src/data/*` et des routes API. Il faudrait normaliser tous les fichiers en UTF-8 propre.

### 2. README partiellement depasse

Le `README.md` parle d'un site plus simple que l'etat actuel du depot. Il ne reflète pas toute la logique :

- reservations initiation
- admin
- Google Calendar
- SumUp
- fallback email

### 3. Double logique autour des initiations

Le parcours canonique est maintenant clarifie :

- parcours principal : `/initiation/reservation` + `/api/slots` + `/api/reservations`
- route legacy conservee pour compatibilite : `/api/initiation-reservation`

La dette restante consiste surtout a decider si la route legacy doit rester durablement ou etre retiree plus tard.

### 4. Admin basique

La page admin repose sur un mot de passe unique. C'est suffisant pour un usage limite, mais pas ideal si le projet doit durer.

### 5. Reservation restaurant non connectee a une vraie disponibilite

Le formulaire ne reserve pas une table en base. Il envoie une demande a traiter manuellement.

### 6. Dependance forte aux variables d'environnement

Une partie importante du projet ne peut pas fonctionner sans configuration reelle :

- mails
- Google Calendar
- SumUp
- Supabase

## Reprise recommandee par priorite

### Priorite 1

- corriger les problemes d'encodage UTF-8
- corriger le lint
- fiabiliser le script `typecheck`
- mettre a jour le README

### Priorite 2

- clarifier le parcours "initiation" final
- choisir entre :
  - simple demande par email
  - reservation avec disponibilite + paiement
- nettoyer le code mort ou redondant si necessaire

### Priorite 3

- valider tous les contenus avec le client
- remplacer les contenus encore trop marketing / fictifs
- verifier les reseaux sociaux et liens externes
- verifier les images associees aux bonnes personnes

### Priorite 4

- renforcer l'admin
- envisager un vrai stockage des demandes restaurant
- brancher analytics si besoin

## Prompt de reprise a coller dans ChatGPT

Tu peux coller le texte ci-dessous dans un nouveau chat :

```text
Je reprends un projet web existant pour le Golf de Marcilly. J'ai besoin que tu m'aides comme si tu arrivais sur le depot en cours de projet.

Contexte general :
- C'est un site premium pour un golf pres d'Orleans.
- Stack : Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, Nodemailer, Google Calendar, SumUp.
- Le site contient des pages vitrine (accueil, golf, tarifs, enseignement, restaurant, evenements, actualites, contact), des routes API, une reservation restaurant, un systeme de reservation d'initiation, et une page admin.

Structure importante :
- src/app : pages et API
- src/components : composants UI et formulaires
- src/data : contenus centralises
- src/lib : logique SEO, emails, calendrier, reservations, Supabase, securite
- supabase/migrations : schema SQL des initiations

Sources de contenu :
- src/data/site.ts
- src/data/home.ts
- src/data/courses.ts
- src/data/pricing.ts
- src/data/teaching.ts
- src/data/restaurant.ts
- src/data/events.ts
- src/data/posts.ts

Fonctionnalites existantes :
- formulaires contact / newsletter / devis avec envoi email
- demande restaurant avec envoi email + accusé reception client
- route de demande initiation simple par email
- logique plus avancee de reservation initiation avec slots, disponibilites, Google Calendar, SumUp, Supabase et webhook
- page /admin pour le suivi des reservations initiation
- SEO avec metadata, sitemap, robots et JSON-LD

Etat technique constate :
- le build passe
- le lint echoue a cause de 2 erreurs react/no-unescaped-entities
- le typecheck echoue a cause d'un probleme de fichiers .next/types manquants
- plusieurs fichiers ont des problemes d'encodage UTF-8 visibles
- le README semble en retard par rapport aux fonctionnalites reelles
- il faut clarifier la vraie version cible du parcours "initiation" car deux logiques coexistent

Ce que je veux que tu fasses :
1. M'aider a auditer l'etat actuel du projet
2. Me proposer un plan de remise au propre
3. Prioriser les correctifs techniques sans casser l'existant
4. M'aider ensuite a intervenir fichier par fichier

Commence par me proposer un plan d'action concret a partir de ce contexte.
```

## Resume ultra court

Le site est deja bien avance visuellement et fonctionnellement. Ce n'est pas juste une vitrine : il y a deja une vraie logique metier autour des mails, des reservations, de Google Calendar, de SumUp et d'un mini back-office. Les principales reprises a faire sont la clarification du parcours initiation, le nettoyage technique, la correction de l'encodage et la remise a jour de la documentation.
