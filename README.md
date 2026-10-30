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

## Surveillance des services

Le workflow GitHub Actions `fallback-queue.yml` traite la file de secours toutes les cinq minutes, puis interroge `/api/health` avec `OPS_CRON_TOKEN`. La réponse publique sans jeton ne vérifie que la disponibilité HTTP ; seule la réponse authentifiée contrôle les dépendances et l'état de la file. Configurer les notifications d'échec des workflows GitHub pour les personnes chargées de l'exploitation. Ce contrôle de connexion ne garantit pas qu'un e-mail arrive dans la boîte de réception : vérifier aussi régulièrement la boîte du golf et les demandes en attente.

## Conditions du site dans le back-office

Un administrateur du back-office personnel ouvre `/admin/contenu/conditions`. Il peut choisir un état pour chaque parcours ou service, ajouter un état réutilisable, ajouter un parcours ou service, et modifier son nom, sa rubrique et son lien interne. Les modifications publiées apparaissent dans « Conditions du jour » sur l’accueil. Une fermeture nécessite un motif.

En développement, les états et le catalogue sont conservés dans des fichiers locaux au worktree. Pour partager ces données entre plusieurs worktrees, définir `SITE_CONDITIONS_LOCAL_PATH` avec le même chemin absolu dans chaque environnement. Les comptes du back-office utilisent séparément `BACKOFFICE_DB_PATH` ; le renseigner avec un chemin absolu commun si les mêmes comptes doivent fonctionner dans plusieurs worktrees.

Pour partager en direct les conditions du golf, la carte du jour et les compétitions avec le site public depuis localhost, utiliser de préférence le jeton limité `CONTENT_SYNC_TOKEN` :

1. Déployer la route `/api/ops/content-sync` sur le site public, puis enregistrer un jeton aléatoire d'au moins 32 caractères dans la variable Vercel **Production** `CONTENT_SYNC_TOKEN` et redéployer.
2. Dans `.env.local`, définir `CONTENT_SYNC_ENABLED=true` et le même `CONTENT_SYNC_TOKEN`, sans préfixe `NEXT_PUBLIC_`, puis redémarrer le serveur local. Le jeton autorise uniquement la lecture et la modification des conditions du golf, de la carte du jour et des compétitions. Vérifier d'abord la lecture des trois contenus avant toute modification réelle.
3. Retirer `CONTENT_SUPABASE_SERVICE_ROLE_KEY` et `CONTENT_SUPABASE_URL` de `.env.local` après vérification. Garder `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` locaux pour les autres fonctions du site.

L'ancienne configuration `CONTENT_SUPABASE_URL` / `CONTENT_SUPABASE_SERVICE_ROLE_KEY` reste disponible pendant la transition si aucun `CONTENT_SYNC_TOKEN` n'est défini en local. Elle donne des droits beaucoup plus larges et doit être retirée après migration. Un jeton local défini mais invalide ou un service distant indisponible provoque une erreur au lieu de revenir silencieusement à cette clé. Pour revenir à des données locales sans toucher à la production, remettre `CONTENT_SYNC_ENABLED=false` et redémarrer ; les anciennes données locales sont conservées.

Les pages, comptes et médias du back-office de contenu sont stockés dans SQLite et dans le dossier média adjacent à `BACKOFFICE_DB_PATH`. Ils ne sont pas concernés par ce mode : une page ou image créée sur localhost n'apparaît pas sur le site public. En production, ce back-office ne doit être activé qu'avec un disque persistant partagé entre toutes les instances ; un système de fichiers éphémère de fonction serverless ne suffit pas. Les modifications de code et de design nécessitent toujours une pull request et un déploiement.

Avant la mise en production, appliquer la migration `supabase/migrations/20261024120000_editable_site_conditions.sql`, puis déployer le code. Elle préserve les lignes et états existants, supprime la liste fermée d’identifiants et ajoute les métadonnées et le catalogue d’états. Le service utilise la clé Supabase côté serveur ; aucun accès public direct aux tables n’est accordé. Pour revenir au code précédent après déploiement, conserver la migration et les données : l’ancien code ignore les nouveaux champs et équipements. Une restauration de schéma demande une migration inverse examinant d’abord les nouveaux équipements et états.

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

## Statistiques du site

- La page `/admin/statistiques` est réservée au mot de passe administrateur ou aux comptes nominatifs ayant le rôle `admin`. Elle affiche les visites consenties et les connexions réussies ; les comptes distincts ne comprennent que les comptes nominatifs. Un mot de passe partagé ne permet pas de connaître le nombre de personnes distinctes.
- La collecte des pages publiques commence uniquement après le choix « Accepter » dans la bannière. Le visiteur peut modifier ce choix depuis le pied de page. Un navigateur est identifié par un UUID local ; une visite est renouvelée après 30 minutes d’inactivité. Les paramètres d’URL, adresses IP, pages d’administration et robots identifiables ne sont pas enregistrés dans les tables d’audience. Les rechargements et navigations internes sont comptés ; un événement rejoué avec le même identifiant n’est enregistré qu’une fois.
- Appliquer `supabase/migrations/20261030160000_site_analytics.sql` sur la base de staging avant de valider son déploiement, puis sur la base de production avant de publier le code. Vérifier les droits des tables et fonctions, ainsi que `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`. Aucune donnée ancienne n’est reconstruite. En cas de retour au code précédent, conserver les tables : elles n’affectent pas les autres fonctions du site. Une suppression du schéma doit être une migration inverse après export ou décision explicite sur les données.
- Le workflow `Staging database migrations` applique automatiquement **ce fichier de migration uniquement** sur Golf Staging avant la validation de la PR, puis lance `supabase/tests/site_analytics.sql`. Les deux projets Supabase ont un registre CLI vide alors que Golf Prod possède un schéma installé historiquement par lots SQL : ne pas lancer `supabase db push --include-all`, qui tenterait de rejouer les migrations anciennes. Configurer `SUPABASE_STAGING_DB_URL` comme secret de l’environnement GitHub `staging` avec l’URL PostgreSQL « Session pooler » du projet **Golf Staging** (mot de passe encodé dans l’URL). Le test vérifie les totaux, les visiteurs distincts, le rejet d’un événement rejoué, le classement et les droits ; il annule ses données dans la même transaction. Un secret absent ou une migration en échec arrête le contrôle. La réconciliation complète du registre CLI reste un chantier distinct documenté dans `supabase/MIGRATION-HISTORY.md`.
- `ANALYTICS_RETENTION_DAYS` règle la conservation entre 30 et 730 jours, 180 par défaut. La purge s’exécute au plus une fois par jour lors de la collecte ou d’une connexion réussie. Sans nouveau trafic, aucune écriture n’a lieu et la purge reprend à la prochaine collecte.
- Vérification après publication : accepter la mesure dans un navigateur de test, ouvrir deux pages publiques, puis consulter `/admin/statistiques` pour la période « Aujourd’hui ». Attendre quelques secondes et actualiser : les deux pages doivent apparaître, avec un seul visiteur et une seule visite. Refuser ensuite la mesure pour vérifier qu’aucune nouvelle page n’est comptée. La période affichée commence à la première visite consentie.
