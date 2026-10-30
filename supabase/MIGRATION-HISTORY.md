# Rapprochement de l’historique SQL

## État au 20 octobre 2026

Golf Prod a été initialisé le 19 octobre par deux lots SQL. Le manifeste
`migration-reconciliation.json` conserve les 18 sources, leurs empreintes SHA-256,
leur ordre d’exécution et une proposition de versions uniques sur 14 chiffres.
Les empreintes ont été comparées au manifeste local de cette initialisation.
Ce fichier constitue une trace documentaire, pas un registre Supabase CLI.

Trois sources historiques commencent par `20261011`. Aucun de ces fichiers
déjà exécutés n’a été renommé ou réappliqué. Les versions proposées ne sont
pas actives : ne pas lancer `db push` sur ces sources historiques.

## Statistiques du site — 30 octobre 2026

La migration `20261030160000_site_analytics.sql` a été exécutée manuellement dans l’éditeur SQL Supabase sur Golf Staging, puis sur Golf Prod, avant la publication du code. Le test transactionnel `supabase/tests/site_analytics.sql` a réussi sur les deux bases ; il annule ses données de test. Les tables de statistiques étaient absentes de Golf Prod avant l’opération. L’exécution dans l’éditeur SQL ne renseigne pas le registre Supabase CLI : ne pas déduire de son absence que la migration doit être rejouée.

Le propriétaire du projet a autorisé une exception pour cette publication : le workflow GitHub de staging, dépourvu d’accès PostgreSQL dédié, a été retiré de la PR après les vérifications manuelles. Cette exception ne vaut pas pour les prochaines migrations : configurer l’accès staging et rétablir l’application et les tests automatiques avant leur déploiement.

## Adoption ultérieure de la CLI

1. Réaliser une sauvegarde PostgreSQL et valider sa restauration sur une cible
   distincte avant toute intervention sur l’historique.
2. Lire le registre réel de chaque projet et comparer son schéma, ses fonctions,
   droits et données de référence avec les lots exécutés. Le constat sur Golf Prod
   ne suffit pas à établir l’état de Staging.
3. Valider les correspondances proposées dans le manifeste. Conserver les deux
   transactions de l’initialisation : l’ajout du statut d’initiation doit être
   validé avant les fonctions qui l’utilisent.
4. Dans une branche dédiée, préparer des noms uniques correspondant au manifeste,
   puis prouver l’installation sur une base de test vierge et la compatibilité
   avec une copie restaurée. Ne pas rejouer les imports sur la base active.
5. Après revue et autorisation de l’opération, rapprocher le registre CLI des
   migrations réellement exécutées, sans exécuter à nouveau leur SQL. Vérifier
   que la CLI n’annonce plus de migration historique à appliquer avant de
   déployer une nouvelle migration.

Utiliser désormais des versions uniques `YYYYMMDDHHMMSS` pour les nouvelles
migrations. En cas d’écart, arrêter le rapprochement et conserver le registre
existant ; ne pas supprimer une ligne pour forcer un signal vert.

## Retour arrière

La préparation documentaire ne change aucune base. Avant l’adoption effective,
conserver une copie des fichiers, du registre et de la sauvegarde restaurable.
Un retour des noms ou du registre doit être coordonné ; il ne restaure pas les
données modifiées par une migration SQL.
