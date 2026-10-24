# Contrôle avant publication — 19 octobre 2026

## Vérifications visuelles du 20 octobre 2026

Les modifications éditoriales demandées sont intégrées : Kaleka course aller/retour, retrait des anciennes offres avec conservation du bouton Bon plan et message « Offres à venir bientôt », retrait des photos 6/8/9/11/12 de la galerie restaurant, ajouts US Orléans et RCO avec logos officiels et Liger Homme avec nom et fiche fournie en attendant son logo.

Contrôles effectués : principales pages sur ordinateur et dix pages à 390 × 844 ; aucun débordement horizontal observé. Fenêtre Bon plan ouverte puis fermée, focus rendu au bouton ; menu mobile ouvert et fermeture par Échap testés ; galerie restaurant parcourue ; liens des trois partenaires vérifiés dans le DOM et les deux nouveaux logos chargés après activation du chargement immédiat dans le bandeau animé. Huit tests ciblés offres/sitemap/conditions réussis, contrôle TypeScript réussi et lint ciblé réussi. Aucune demande de formulaire réelle envoyée pendant cette visite. Ces contrôles ne constituent pas un audit exhaustif d’accessibilité ni une validation sur l’hébergement futur.

La sauvegarde externe n’est toujours pas activée : destination privée, connexion PostgreSQL et certificat non fournis. Une demande de ces informations a été adressée au propriétaire le 20 octobre ; aucune sauvegarde périodique ou restauration complète n’est annoncée comme opérationnelle.

## Mise à jour après autorisation d’exécution

Le propriétaire a ensuite demandé l’initialisation de Golf Prod, choisi la préparation d’une sauvegarde externe gratuite et confirmé que la finalisation de l’hébergement, de ses mentions et de ses tests attendra son choix. Les sections suivantes décrivent l’état constaté avant cette autorisation ; elles sont complétées par les résultats ci-dessous.

- Golf Prod initialisé avec les 18 migrations du dépôt, exécutées en deux transactions : réservations et ajout du statut CONFIRMED, puis reste du schéma et des imports du dépôt. Les délimitations BEGIN/COMMIT des sources ont été regroupées dans chaque lot. Les fichiers historiques n’ont pas été modifiés ni renommés ; aucun historique CLI fictif n’a été créé.
- Avant écriture : zéro table public, zéro utilisateur Auth, zéro bucket et zéro objet Storage. Aucun contact ou réservation de Staging copié.
- Neuf tables applicatives après initialisation, toutes protégées par RLS. Lecture refusée à anon/authenticated et autorisée à service_role sur les neuf tables. Révocation explicite des accès publics aux deux tables de réservation lors du premier lot ; droits nécessaires accordés au serveur.
- 168 événements du calendrier, trois marqueurs d’import et une carte du restaurant issus des sources du dépôt. Aucun ancien état administratif de Staging importé. La publication du site n’est pas déclenchée par cette initialisation.
- Test SQL sous service_role : réservation historique sur place, idempotence, refus de dépassement de capacité et limitation de débit réussis. Transaction annulée, aucun email envoyé. Cela ne certifie pas le parcours HTTP actuel sur le futur serveur.
- Export des neuf tables sauvegardé dans `.data/prod-initialisation-2026-10-19/`, exclu de Git. Les deux lots SQL, un manifeste des 18 sources avec SHA-256 et les SQL de vérification sont conservés à côté. Restauration du JSON dans neuf tables temporaires et comparaison intégrale aux données source réussies, puis ROLLBACK. Ce test ne valide pas une reconstruction complète sur une instance distincte.
- Script d’export PostgreSQL préparé : `scripts/backup-supabase.ps1`. Voir `EXPLOITATION-SAUVEGARDES.md` pour les prérequis, les limites et la planification encore nécessaire. Aucun dump PostgreSQL complet ni sauvegarde périodique activée : outils clients, connexion et stockage externe restent à configurer.
- Kbis fourni par le propriétaire : extrait à jour au 15 mai 2025. Dénomination, forme juridique à associé unique, capital de 30 489,80 €, RCS Orléans 334 925 419 et siège intégrés dans `src/data/legal.ts`. Aucun numéro de TVA trouvé dans ce document ; aucune donnée privée supplémentaire publiée. Hébergement et numéro de TVA restent à compléter, `reviewed: false` conservé.
- Préflight exécuté : deux prérequis toujours manquants, URL publique HTTPS et chemin de stockage persistant SQLite. Tests sur l’hébergement final reportés conformément à la réponse du propriétaire.

Sources légales consultées : [Ministère de l’Économie — mentions du site](https://www.economie.gouv.fr/entreprises/developper-son-entreprise/innover-et-numeriser-son-entreprise/mentions-sur-votre-site-internet-les-obligations-respecter) et Kbis fourni localement. La date du document ne prouve pas l’absence de changement de société depuis mai 2025.

Retour arrière : les données métier ne doivent pas être supprimées pour revenir au code précédent. Conserver le schéma et exporter l’état courant avant une restauration. Ne jamais rejouer les deux lots d’initialisation comme procédure générale de mise à jour : certaines sources modifient des données et les migrations CLI ont encore besoin d’un rapprochement des versions. L’export local ne remplace pas la future sauvegarde externe.

## Périmètre et décision du propriétaire

L’hébergement final et ses tests sont reportés à la demande du propriétaire. Aucun déploiement, changement DNS, achat de formule Supabase ou migration de Golf Prod réalisé pendant ce contrôle. La réception des emails de test à golf@marcilly.com est confirmée par le propriétaire.

## Golf Prod : vérification en lecture seule

Projet sélectionné dans le tableau de bord : **Golf Prod**, référence `csbktncqqypgwsgumfkw`, distinct de Golf Staging.

La requête suivante a réussi et renvoyé zéro ligne :

```sql
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname in ('public', 'supabase_migrations')
order by 1, 2;
```

Le visualiseur confirme « No tables in schema » pour public. Aucune table applicative ni table d’historique de migrations trouvée dans ces schémas. Cela ne prouve pas que les schémas Auth, Storage ou les autres schémas sont vides.

**Conclusion : cette base n’est pas initialisée pour l’application.** La migration de réparation du 19 octobre ne suffit pas : elle ne crée ni les réservations, ni les fonctions RPC, ni les compétitions, ni la file de secours et la limitation de débit.

### Migrations à préparer pour une installation neuve

Les 18 fichiers du dépôt couvrent les réservations historiques et leur durcissement, le parcours sans paiement en ligne, les compétitions 2026/2027, la file de secours, les limites de débit, la carte du restaurant et les conditions du golf. Plusieurs fichiers importent ou corrigent des données métier ; une initialisation complète ne doit pas être présentée comme une simple création de trois tables.

Attention avant d’utiliser la CLI : trois fichiers ont le préfixe `20261011` (`association_2027_calendar_alignment`, `confirm_thursday_ranking_cups`, `site_conditions`). Préparer un historique avec versions uniques compatible avec les bases déjà existantes ; ne pas renommer des migrations appliquées sans stratégie de rapprochement. Aucun `supabase db push` global n’a été exécuté.

Avant initialisation : disposer d’une sauvegarde de l’état existant, préparer et revoir l’exécution ordonnée, contrôler les droits et fonctions, puis autoriser spécifiquement l’écriture en production. Vérifier ensuite le parcours actuel de demande d’initiation avec confirmation par l’équipe et paiement sur place. Ne pas recopier les réservations et contacts de test de Staging en production.

### Sauvegardes

La page Database → Backups de Golf Prod affiche : **« Free Plan does not include project backups. »** Aucune sauvegarde planifiée de ce projet n’est disponible depuis cette fonction. Aucune restauration n’a donc été testée.

Avant de stocker des données réelles : choisir une sauvegarde gérée incluse dans une offre adaptée, ou un export PostgreSQL externe régulier, protégé et conservé sur un autre support. Le choix et un éventuel achat restent au propriétaire. Prévoir séparément les fichiers Storage éventuels, SQLite et les médias du futur hébergeur. Tester une restauration dans une cible distincte avant de déclarer ce point validé. Les exports locaux de Staging ne constituent pas des sauvegardes de Golf Prod.

## Contenus commerciaux

Confirmations reçues le 19 octobre : tarifs 2026 et horaires actuellement affichés ; capacité de la salle jusqu’à 90 personnes ; licence obligatoire pour le grand parcours.

Intégrations : capacité sur la page Événements et l’article consacré aux séminaires ; licence obligatoire sur la page Golf. Aucun niveau, handicap minimum, diplôme ou droit d’utilisation des photos supplémentaire déduit de ces confirmations.

Le propriétaire a confirmé de masquer les tarifs non licenciés du grand parcours. Pour les 9 trous, 18 trous et 18 trous après 16 h, ils sont remplacés par « Licence obligatoire » ; les tarifs jeunes non licenciés sont également retirés. Les prix licenciés sont conservés. La source partagée actualise la page Tarifs et les tarifs des cartes de la page Golf.

## Informations légales

Les pages et `src/data/legal.ts` ont été relus. L’adresse de contact pour les données est golf@marcilly.com ; l’éditeur, le responsable du traitement et la direction de publication sont renseignés. Les coordonnées complètes de l’hébergeur final manquent et dépendent du choix reporté. `reviewed: false` est conservé : ce contrôle technique ne vaut pas validation juridique du propriétaire.

La consultation directe de la fiche officielle Annuaire des entreprises a renvoyé HTTP 403 ; l’identité juridique n’a pas été certifiée à nouveau ni remplacée par une supposition. Faire confirmer l’identité, les mentions d’immatriculation et fiscales applicables et la direction de publication avant la publication.

La politique mentionne les finalités, les destinataires, les critères de conservation, les droits et les services externes. Restent à confronter à l’exploitation finale : durées réelles dans la messagerie et Supabase, régions des prestataires et éventuels transferts, logs de l’hébergeur et procédure d’effacement. La purge codée de la file de secours ne concerne que les messages déjà envoyés ; elle ne supprime pas toutes les demandes et réservations. Ne pas promettre une durée unique ou une suppression automatique globale sans mise en œuvre.

Référence consultée : [CNIL — information des personnes](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence). Ce contrôle ne constitue pas une certification de conformité.

## Tests sur l’hébergement final — reportés

Après choix de l’hébergement : configurer le projet Supabase de production et les secrets serveur, les destinataires du golf, l’URL HTTPS et le stockage persistant ; compléter les mentions d’hébergement ; lancer le préflight sur la cible ; tester le diagnostic authentifié, les formulaires avec des demandes identifiées TEST, les modifications administratives et la persistance après redémarrage. Vérifier le contenu de la file avant toute reprise, puis configurer SITE_URL et le token cohérent côté serveur/GitHub avant réactivation du workflow. Aucun de ces tests ne peut être déclaré réussi sur un hébergeur non choisi.

## Retour arrière des changements locaux

Les changements de cette intervention sont éditoriaux et n’altèrent aucun schéma ou contrat d’API. Un retour au code précédent retire les nouvelles précisions commerciales ; il ne modifie aucune donnée distante. Les migrations de production restent non exécutées.
