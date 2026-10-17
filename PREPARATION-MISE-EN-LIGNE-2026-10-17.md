# Préparation à la mise en ligne — 17 octobre 2026

## État réel

Version préparée localement ; aucun déploiement ni changement DNS effectué. L’hébergement et le domaine restent à configurer à la demande du propriétaire. La publication publique n’est pas encore validée.

## Contrôles terminés

| Contrôle | Résultat |
| --- | --- |
| Lint complet | Réussi |
| TypeScript complet | Réussi |
| Tests du dépôt | 63 réussis, aucun échec |
| Build de production | Réussi, 49 pages générées ; premier essai bloqué par une permission Windows, second essai hors bac à sable réussi |
| Liens internes sur le serveur local | 23 pages et 30 liens contrôlés, aucune erreur HTTP ou ancre manquante détectée |
| `/api/health` public local | HTTP 200, contrôle de présence de l’application |
| Diagnostic interne local | HTTP 503 : messagerie indisponible, une demande en attente dans la file |
| Back-office en instance de production locale isolée | Accès anonyme refusé ; session fictive acceptée ; création d’une page et téléversement d’un média réussis ; page et octets du média conservés après arrêt/redémarrage |

Le test du back-office a utilisé une nouvelle base et une session fictive sur le port 3100. Il ne valide pas les comptes réels, le formulaire de connexion réel, les modifications de compétitions/restaurant/conditions sur Supabase, ni le stockage de l’hébergeur futur. Aucune demande réelle n’a été envoyée et la file d’emails n’a pas été retraitée.

## Sauvegardes réalisées

Dossier local exclu de Git : `.data/release-preparation-2026-10-17T14-23-45.508Z/`.

- Instantané SQLite via l’API native de sauvegarde, qui tient compte du journal WAL.
- Vérification d’intégrité SQLite : `ok`.
- Restauration de la copie dans un répertoire distinct, intégrité et nombres de lignes comparés : réussie.
- Aucun média présent dans la base locale sauvegardée. La persistance d’un média a été testée séparément sur l’instance fictive.
- Copie des fichiers locaux des conditions et des compétitions.
- Après accord explicite, export JSON en lecture seule des six tables applicatives Supabase accessibles, avec manifeste. Les réservations et demandes de contact restent dans le dossier privé local ; leur contenu n’est pas affiché et ne doit pas être ajouté à Git.

L’export Supabase n’est **pas** une sauvegarde PostgreSQL complète : il ne contient pas le schéma, les politiques, fonctions, rôles, utilisateurs Auth et objets Storage éventuels. Il n’a pas été restauré sur une base Supabase distincte. Une sauvegarde complète et une restauration sur une cible dédiée restent nécessaires avant production. Les sauvegardes actuelles sont sur le même ordinateur : une copie protégée sur un support distinct et une planification restent à prévoir.

## Blocages identifiés

### Messagerie Brevo

La requête de connexion au compte renvoie HTTP 401 avec un motif de restriction IP. Cela ne prouve pas que la clé est invalide. Vérifier et autoriser dans Brevo l’adresse de sortie de l’environnement d’envoi concerné, sans désactiver globalement la protection. Le futur serveur pourra utiliser une autre IP.

Après correction : redémarrer si la configuration a changé, relancer le diagnostic authentifié, prévenir l’équipe, puis effectuer les essais de réception contact/devis/restaurant/initiation. Vérifier la demande déjà en attente avant de déclencher la reprise pour éviter un envoi inattendu.

### Supabase

Les tables suivantes répondent HTTP 404 / `PGRST205` : elles ne sont pas trouvées dans le cache de schéma exposé par l’API du projet configuré.

| Table | Migration à comparer à l’historique du projet cible |
| --- | --- |
| `restaurant_daily_menus` | `20260930110000_restaurant_daily_menu.sql`, puis les migrations suivantes qui assouplissent les nombres de plats |
| `site_conditions` | `20261011_site_conditions.sql` |
| `association_event_imports` | `20261009_association_events_2027.sql` |

Ne pas conclure à partir du seul HTTP 404 qu’une migration doit être rejouée : vérifier le projet sélectionné, le schéma, les droits et l’historique. Aucune migration distante n’a été exécutée. La migration du calendrier contient un import de données et doit être examinée avant application. Les états et compétitions utilisés en développement peuvent provenir de fichiers locaux et ne sont pas transférés automatiquement à Supabase en production.

### Paramètres dépendant de l’hébergement

Le préflight échoue encore sur :

- `NEXT_PUBLIC_SITE_URL` : adresse publique HTTPS à renseigner.
- `BACKOFFICE_DB_PATH` : chemin absolu sur le stockage persistant de la cible.

Ces paramètres ne sont pas remplacés par des valeurs factices pour obtenir un contrôle vert. Les URL canoniques éditoriales pointent vers `https://www.marcilly.com` ; confirmer le domaine final. Protéger la préproduction contre l’indexation sans bloquer l’indexation du site public final.

## GitHub et reprise des emails

- Secret `OPS_CRON_TOKEN` configuré sur GitHub à partir de la configuration locale, sans afficher sa valeur.
- Variable `SITE_URL` non définie : l’adresse publique cible n’est pas disponible.
- Workflow `fallback-queue.yml` conservé dans son état `disabled_manually`, conformément à sa suspension précédente.

Une fois l’URL configurée et la messagerie rétablie : vérifier la file, réactiver le workflow, exécuter une reprise manuelle puis vérifier les passages planifiés. Si le token change lors du déploiement, mettre à jour sa valeur sur le serveur et dans GitHub ensemble.

## Validation du golf restant à obtenir

- Tarifs et horaires finaux, conditions d’accès au grand parcours.
- Capacités et configurations des salles, qualifications détaillées des enseignants et droits d’utilisation des photos.
- Informations d’hébergement et validation finale des pages légales (`src/data/legal.ts` reste non validé).
- Validation humaine des demandes reçues, des confirmations et du déroulement de chaque prestation.

Les durées d’initiation et le matériel fourni ont déjà été confirmés par le propriétaire et intégrés au site.

## Publication et retour arrière

1. Installer la version approuvée sur la cible et renseigner ses secrets côté serveur.
2. Vérifier les migrations nécessaires après sauvegarde complète ; appliquer uniquement celles validées pour cette cible.
3. Relancer le préflight, les diagnostics et les parcours réels. Tester la conservation des données après redémarrage sur cet hébergement.
4. Finaliser HTTPS, domaine, redirections et indexation ; préserver les enregistrements DNS de la messagerie.
5. Déployer puis contrôler pages, demandes et file d’emails sur l’adresse publique.

Référence Git antérieure aux changements préparés : `2ff86f420a3dea3dab64b51cd4a86d5829a5a85e`. En cas de problème, redéployer une version approuvée compatible avec le schéma courant. Un retour au code précédent ne restaure pas les données : arrêter l’application, conserver l’état courant et restaurer ensemble SQLite et médias issus d’une même sauvegarde si nécessaire. Prévoir séparément le retour arrière Supabase, sans supprimer des données à l’aveugle.
