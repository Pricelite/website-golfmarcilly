# Golf de Marcilly - site Next.js

Site du Golf de Marcilly construit avec Next.js App Router, TypeScript, Tailwind CSS, Supabase et envoi d'e-mails transactionnels. Les demandes d'initiation sont confirmées par l'équipe et réglées sur place.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase
- Google Calendar
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
pnpm.cmd preflight
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
- demande d'initiation à partir des créneaux du calendrier, transmise par email et confirmée manuellement par l'équipe
- lecture du flux privé Google Calendar pour les créneaux d'initiation
- page admin indiquant la boîte de suivi des demandes actuelles et donnant accès, en lecture seule, aux anciennes réservations Supabase
- maintien d'un endpoint legacy `/api/initiation-reservation` pour compatibilite
- sitemap, robots, metadata et JSON-LD

## Assistant IA

L'assistant Welix et sa route `/api/chat` ont été retirés du site pour l'instant.

Le site ne charge pas de mesure d'audience GA4 ; aucun bandeau de consentement GA4 n'est affiché.

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
- email SMTP / Brevo
- analytics
- operations / monitoring

## Healthcheck et exploitation

État avant déploiement et points à fournir par le propriétaire : [CONSOLIDATION-PRODUCTION.md](CONSOLIDATION-PRODUCTION.md).

- `GET /api/health`
  Sonde publique de disponibilité du site, sans appel aux services externes.
- `GET /api/health` avec `Authorization: Bearer <OPS_CRON_TOKEN>`
  Retour detaille interne avec l'etat de configuration et la file fallback.
- `POST /api/ops/fallback-queue`
  Traitement de la file de secours avec `OPS_CRON_TOKEN`.

Notes:

- la file de secours est stockée dans Supabase ; appliquer `supabase/migrations/20260925100000_contact_queue_and_rate_limit.sql` puis `supabase/migrations/20260930100000_contact_queue_attempt_start.sql` avant le déploiement du code
- la même migration fournit une limitation de débit partagée en production ; si elle ou Supabase sont indisponibles, les formulaires publics et la connexion admin refusent les nouvelles tentatives
- configurer `SITE_URL` (variable de dépôt) et `OPS_CRON_TOKEN` (secret de dépôt) pour le traitement planifié par GitHub Actions ; vérifier que la tâche s'exécute après mise en ligne
- le traitement planifié échoue avec HTTP 503 dès qu'une demande est en échec définitif, même si l'email d'alerte ne peut pas partir ; surveiller les échecs de cette tâche. Les demandes en échec ne sont pas purgées automatiquement : les traiter puis les supprimer selon la politique de conservation des données
- les anciennes données de `.contact-fallback` ne sont pas importées automatiquement : les traiter avant de retirer l'ancien stockage
- chaque message porte une référence stable dans l'objet de l'email ; si le fournisseur accepte un envoi mais que son accusé de traitement est perdu, une reprise peut encore générer un doublon avec la même référence
- les demandes d'initiation identiques sont limitées à un envoi pendant dix minutes, via la table `public_rate_limits` existante ; un échec d'envoi libère la tentative pour permettre de réessayer. Un fournisseur qui accepte l'email puis perd sa réponse peut encore entraîner un doublon lors d'une nouvelle tentative.
- ce contrôle requiert la migration `20260925100000_contact_queue_and_rate_limit.sql` déjà utilisée par les formulaires publics. Pour revenir à l'ancien comportement, redéployer la version précédente du code ; conserver la table et ses données, également utilisées par les autres limitations de débit.

### Carte du jour du restaurant

- Appliquer `supabase/migrations/20260930110000_restaurant_daily_menu.sql` avant de publier cette version. La migration crée une table datée accessible uniquement via la clé de service côté serveur ; elle ne modifie pas les anciennes cartes ni les réservations.
- Se connecter à `/admin`, ouvrir « Modifier la carte du jour », choisir la date, puis renseigner trois entrées, trois plats et trois desserts avec leurs prix. « Publier la carte » enregistre les choix ; « Retirer cette carte » supprime la publication de cette date.
- La dernière carte publiée reste consultable avec sa date de publication. Seule une publication datée du jour est présentée comme « Carte du jour » ; la validité d’une carte plus ancienne reste à confirmer auprès du restaurant. De 10 h à 15 h (heure de Paris), les plats sont affichés directement ; hors de cette plage, ils restent accessibles dans « Consulter la dernière carte publiée ». Pour confirmer la carte d’un jour, publier son contenu à cette date depuis l’administration. La carte éditoriale initiale reste le repli si aucune publication n’est disponible. La lecture publique est limitée à quatre secondes et le cache est renouvelé toutes les trente secondes, avec invalidation lors d’une modification.
- En cas de retour à une ancienne version, conserver la table et ses données ; l'ancien code l'ignore. Ne supprimer la table qu'après export ou suppression volontaire des cartes enregistrées.

Ordre de mise en production pour cette évolution : suspendre le traitement planifié de la file, attendre la fin des traitements en cours, appliquer les deux migrations SQL dans l'ordre, vérifier `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`, puis déployer le code et réactiver la tâche planifiée. Vérifier ensuite la vue interne de `/api/health` et déclencher manuellement la tâche GitHub Actions une fois. Si la première migration a déjà été appliquée, appliquer seulement la seconde. En cas de retour à une ancienne version du site, suspendre de nouveau la tâche planifiée, conserver la table et traiter les messages encore en attente avant de la retirer.

Les mentions légales indiquent Anthony Welh comme directeur de publication, conformément à la confirmation du propriétaire le 14 octobre 2026. L'identité de l'hébergeur effectif et la validation finale des deux pages restent attendues (`src/data/legal.ts`) ; elles restent hors du sitemap et marquées `noindex`.
- `OPS_CRON_TOKEN` est reutilise pour les diagnostics internes et les operations cron

## Vérification locale

Au 14 octobre 2026, après retrait de l'ancien paiement : contrôle TypeScript, lint des fichiers modifiés, dix tests ciblés et build de production réussis. `node scripts/preflight.mjs` signale encore les paramètres à fournir pour l'environnement cible. La CI exécute les contrôles complets sur push et pull request.

## Notes de reprise

- Le controle `typecheck` passe via `tsconfig.typecheck.json` pour ne pas dependre des artefacts `.next` generes partiellement par `next typegen`.
- Le build reste la verification la plus complete du projet, car Next y applique aussi ses controles de routes et de metadata.
- Le parcours d'initiation canonique est `/initiation/reservation` avec les APIs `/api/initiation-options` (créneaux du flux Google privé) et `/api/reservations` (demande envoyée par email). L'équipe confirme la date au visiteur et le règlement se fait sur place.
- L'ancien endpoint `/api/initiation-reservation` est conserve uniquement comme fallback legacy et n'est plus le parcours principal.
- La reprise globale du projet est documentee dans [COMPTE-RENDU-REPRISE.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/COMPTE-RENDU-REPRISE.md:1).
- La checklist de mise en production est documentee dans [CHECKLIST-MISE-EN-PROD.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/CHECKLIST-MISE-EN-PROD.md:1).
- La procedure d'application Supabase et de configuration production est documentee dans [PROCEDURE-SUPABASE-VERCEL.md](/c:/Users/Anthony/Desktop/website-golfmarcilly/PROCEDURE-SUPABASE-VERCEL.md:1).

## Évolutions UX : préparation du déploiement

- Les équipements sont ouverts par défaut. Les modifications manuelles (fermeture, ouverture ou état à confirmer) restent appliquées jusqu’à la prochaine intervention de l’équipe, sans réinitialisation quotidienne. Les dates de modification sont affichées selon le fuseau Europe/Paris. Une fermeture doit être levée manuellement lors de la réouverture.
- Le formulaire de devis transmet désormais `desiredDate` (date ISO facultative). Les anciens consommateurs peuvent continuer à omettre ce champ ; le serveur refuse une date fournie invalide ou passée. La date figure dans les versions texte et HTML de l’email.
- Aucun changement de schéma, aucune migration et aucune nouvelle variable d’environnement ne sont nécessaires pour ces évolutions. Les données existantes sont conservées. Un retour à la version précédente du code suffit pour revenir aux affichages antérieurs, mais rétablit aussi l’ancien comportement des conditions.
- À faire confirmer par le club : capacité et dispositions des salles, validité des cartes reconduites, nouveaux contenus éditoriaux. L’agenda privé Google Calendar reste la source des initiations ; aucun jour de semaine fixe n’est promis.
