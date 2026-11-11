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

## Agenda de l’association sportive 2027 — 10 novembre 2026

La migration `20261110150000_align_association_agenda_2027_and_game_format.sql`
a été appliquée automatiquement à Golf Staging par l’intégration Supabase,
avec un check `Supabase Preview` réussi. Elle a ensuite été exécutée
manuellement dans l’éditeur SQL de Golf Prod, après confirmation du propriétaire
et sauvegarde ciblée des événements 2027, puis avant la fusion de la PR #166
vers `main`. La CI et le déploiement Vercel Production de cette PR ont réussi.

Avant l’exécution sur Golf Prod, la table contenait 110 événements commençant
en 2027 et 73 en 2026. L’export CSV des 110 lignes, conservé hors Git dans les
livrables Codex sous `golf-prod-agenda-2027-avant-migration.csv`, a l’empreinte
SHA-256 `36C218D26FF49F8B0CF81CF83F223C92641FDAFD878F036BB572B52B1ECA5AE9`.
La comparaison avec le fichier du club annonçait 17 suppressions et 14 ajouts.
Après exécution, 107 événements commencent en 2027 et les 73 lignes 2026 sont
toujours présentes. Le marqueur d’import unique et les colonnes `game_format`
et `game_format_detail` ont été vérifiés. La page publique affiche les deux
Goltechnic de mars 2027 en option et conserve les rendez-vous de novembre 2026.

L’exécution manuelle sur Golf Prod n’inscrit pas cette version dans le registre
Supabase CLI. Ne pas rejouer la migration par `supabase db push --include-all`.
Pour revenir aux événements 2027 antérieurs, restaurer l’export ciblé ; un
retour au code précédent peut conserver les nouvelles colonnes.

## Accès administrateur restaurant — 11 novembre 2026

La migration `20261111120000_restaurant_staff_access.sql` a été appliquée
automatiquement à Golf Staging par l’intégration Supabase : le check
`Supabase Preview` du commit `9ade2a3` a réussi. Le parcours du compte personnel
et les opérations de la carte y ont été testés avec un compte temporaire,
supprimé après vérification.

Après confirmation du propriétaire, la migration du dépôt a été exécutée
manuellement dans l’éditeur SQL de **Golf Prod** avant la publication du code
par la PR #176. Avant exécution, les trois tables et les deux fonctions étaient
absentes. Après exécution, le contrôle SQL a confirmé les trois tables avec
RLS, les deux fonctions, l’absence de droits directs pour `anon` et
`authenticated`, les droits du `service_role` et l’absence de comptes créés.
Une lecture PostgREST avec la clé serveur de Golf Prod a répondu HTTP 200.
La migration ne modifie ni les cartes ni les réservations existantes.

Cette exécution manuelle n’inscrit pas la version dans le registre Supabase
CLI de Golf Prod. Ne pas relancer les migrations historiques par
`supabase db push --include-all`. En cas de retour au code précédent, conserver
les nouvelles tables ; leur suppression nécessiterait une migration inverse
après examen des comptes et des sessions éventuellement créés.

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
