# Consolidation avant mise en production

## Référencement

- Le sitemap est généré depuis les pages publiques, les articles et les offres de `src/data/offers.ts`. Il inclut les entrées débutants et cours. Retirer une offre des données lors de son retrait commercial supprime aussi son entrée du sitemap ; aucune date d'expiration n'a été inventée.
- Les pages de paiement, l'administration et le formulaire transactionnel d'initiation ne sont pas indexables. La page éditoriale « Je débute le golf » reste indexable.
- Les API sont exclues du crawl et portent `X-Robots-Tag: noindex, nofollow`. Les pages HTML avec `noindex` restent accessibles aux robots pour qu'ils puissent lire cette directive. Cela ne remplace pas l'authentification des routes privées.
- Canonical, sitemap, métadonnées sociales et données structurées utilisent `siteConfig.url` (`https://www.marcilly.com`). Les liens canoniques ne sont plus affichés comme du contenu dans les articles.
- Les métadonnées ne déclarent plus arbitrairement une image de 1200 × 630 pour toutes les sources. Les images originales restent utilisées ; aucune recompression du hero n'a été faite.
- L'adresse structurée distingue la rue, le code postal et le pays. Aucun avis, horaire ou identifiant juridique supplémentaire n'a été ajouté au balisage.

À confirmer au déploiement : domaine canonique réellement retenu, redirections HTTP/HTTPS et avec/sans `www`, valeur de `NEXT_PUBLIC_SITE_URL` pour les contrôles d'origine des formulaires, et protection des environnements de préproduction contre l'indexation. Ces réglages de l'hébergeur ne sont pas validés par le build local.

## Informations légales — validation du propriétaire indispensable

Le fichier `src/data/legal.ts` centralise les champs manquants et leurs TODO. Les valeurs vides ne sont pas rendues. Les coordonnées connues du golf restent accessibles ; aucun hébergeur, responsable de publication ou nom de société n'a été déduit des outils utilisés.

À fournir et faire valider :

- identité juridique de l'éditeur et identifiants applicables ;
- responsable de publication ;
- nom, adresse et coordonnées de l'hébergeur effectif ;
- responsable des traitements, finalités, bases légales, destinataires et éventuels transferts ;
- durées de conservation pour chaque traitement, modalités des droits et recours ;
- informations relatives aux services tiers réellement actifs, dont Maps et le calendrier.

Les pages légales restent partielles : supprimer les formulations provisoires ne constitue pas une validation juridique. **Ne pas considérer ce point comme terminé avant réception des informations du propriétaire.** Après validation des deux pages, renseigner `legalContent.reviewed = true` pour permettre leur indexation et leur ajout au sitemap.

## Images et performance

Sources particulièrement lourdes identifiées (octets, arrondis en Mo décimaux) :

| Source | Poids |
| --- | ---: |
| parcours-decouverte-9-trous.png | 3,09 Mo |
| RUGBY.png | 2,98 Mo |
| clubhouse.png | 2,74 Mo |
| ecoledegolf.png | 2,69 Mo |
| titouan.png | 2,63 Mo |
| offers/debutant.jpg | 2,53 Mo |
| practice-golf.png | 2,51 Mo |
| cuisine.png | 2,49 Mo |
| club-house-marcilly.png | 2,17 Mo |

Les tailles `sizes` suivent désormais les colonnes et largeurs maximales des cartes parcours, articles, portraits, sections d'accueil, galerie restaurant, modale et pages d'offres. Le chargement différé par défaut de `next/image` reste actif hors images prioritaires. La précharge superflue de la première image de la modale a été supprimée. Le hero principal conserve sa priorité et `sizes="100vw"`.

Les originaux ont été conservés, y compris les fichiers dont l'utilisation est incertaine. Les bénéfices concernent les variantes réellement demandées par le navigateur à l'optimiseur Next.js, pas une réduction de la taille du dépôt. Vérifier le cache et l'optimiseur d'images sur l'hébergement retenu ; aucun score Lighthouse ou Core Web Vitals de production n'est revendiqué.

## Composants anciens

Recherche des imports, noms de composants et chemins dans les sources, scripts et configuration : aucun consommateur des anciens `site-header.tsx`, `site-footer.tsx` et `tarifs-sections.tsx`.

Ces trois fichiers ont été supprimés. Les composants actifs sont `components/layout/header.tsx`, `components/layout/footer.tsx` et `components/ui/pricing-table.tsx` avec `data/pricing.ts`. Les autres composants et les API historiques sont conservés : une absence d'import interne ne prouve pas l'absence d'un appel externe à une API.

La CI utilise la version pnpm déclarée dans `package.json` au lieu de forcer pnpm 9, Node 24 comme l'environnement local de validation, et exécute désormais les tests avant le build. Le workflow GitHub lui-même reste à observer au prochain push ; aucune exécution distante n'a été déclenchée ici.

## Mesure d'audience

GA4 est explicitement facultatif dans `.env.local.example`, et `NEXT_PUBLIC_GA4_ID` est vide dans l'environnement local inspecté. `Analytics` et `CookieConsent` restent disponibles mais ne sont pas raccordés au layout ; aucune requête GA4 ne doit partir avec cette version.

Avant une éventuelle activation : confirmer l'usage et l'identifiant avec le propriétaire, revoir ensemble consentement/retrait, informations de confidentialité et CSP, puis tester le chargement après accord et l'absence d'envoi après refus. Le composant existant transmet le chemin et les paramètres d'URL : ne pas transmettre de paramètres contenant des identifiants de réservation ou des données personnelles. Le fichier de composant seul ne suffit pas à considérer GA4 comme prêt à activer.

## Secours des emails — dépendance au disque local

Le stockage utilise `process.cwd()/.contact-fallback`, hors du dossier public et ignoré par Git. Les soumissions sont écrites dans `pending/*.json` et également dans `submissions.ndjson`.

Conditions de fiabilité à valider :

- disque **inscriptible et persistant** entre redémarrages et déploiements ;
- accès à la même file depuis l'application et le processus de reprise ;
- permissions, sauvegardes et accès restreints aux données personnelles ;
- exécution unique du traitement : aucun verrou distribué ni garantie d'envoi exactement une fois ;
- supervision de la file et du fournisseur d'email.

Une instance avec disque temporaire, un répertoire en lecture seule ou plusieurs instances avec disques séparés ne fournit pas ces garanties. Choisir un volume persistant adapté ou migrer la file vers un stockage partagé durable avant de s'appuyer dessus en production. Aucune migration n'a été effectuée dans ce lot.

Le traitement `/api/ops/fallback-queue` requiert `OPS_CRON_TOKEN` et **peut envoyer des emails, y compris en GET**. Il n'a pas été appelé pendant les tests. Il limite chaque passe à `maxItems`, tente chaque entrée jusqu'à cinq fois, puis la classe en échec. Il n'y a pas de tâche planifiée de reprise configurée dans ce dépôt.

`FALLBACK_QUEUE_RETENTION_DAYS` (14 jours par défaut) concerne uniquement les archives `sent` et `failed`, et leur purge se fait lors du traitement de la file. Les entrées `pending` et le journal `submissions.ndjson` ne sont pas purgés par ce réglage. Prévoir une politique distincte validée par le propriétaire ; ne pas assimiler ces 14 jours à une durée globale de conservation des demandes.

Le diagnostic public `/api/health` décrit la présence de configuration, pas la délivrabilité des emails ni la persistance effective du disque. Le diagnostic authentifié expose l'état de la file. Voir aussi `CORRECTIONS-CONVERSION.md` pour les paramètres d'email encore manquants.

## Validation et limites

Contrôles locaux : lint, TypeScript, tous les tests, build de production, routes principales, sitemap/canonical/robots, métadonnées des pages non indexables, JSON-LD et variantes d'images. Les tests des formulaires restent interceptés : aucun email, paiement ou réservation réelle n'est déclenché.

Restent à vérifier dans l'environnement cible : déploiement et domaine, emails réels, intégrations Google Calendar/Supabase/SumUp, stockage et reprise de la file, informations légales validées. Le build réussi ne valide pas ces services externes.
