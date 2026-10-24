# Vérification des formulaires et de Supabase — 19 octobre 2026

## Environnement et autorisations

- Projet confirmé dans le tableau de bord : **Golf Staging**, correspondant à l’URL Supabase configurée localement. Le projet distinct **Golf Prod** n’a pas été modifié.
- Application locale, puis build de production local sur le port 3100 pour tester les écritures Supabase réelles de l’administration. Le mode développement utilise un fichier local pour les conditions et ne suffit donc pas à vérifier ces écritures distantes.
- Migration ciblée autorisée par le propriétaire et appliquée manuellement dans l’éditeur SQL du projet Staging. Aucun mot de passe ni clé ajouté au dépôt.

## Destinataires et tests réels

Selon la dernière instruction du propriétaire, `EMAIL_TO`, `RESTAURANT_RESERVATION_EMAIL_TO` et `FALLBACK_QUEUE_ALERT_EMAIL` sont configurés localement sur **golf@marcilly.com**. Les valeurs devront être reprises dans l’hébergement cible. Le fichier local de secrets reste exclu de Git.

Un premier accusé de test vers la messagerie personnelle connectée avait été bloqué par un désabonnement transactionnel enregistré dans Brevo. La réactivation proposée n’a pas été exécutée : le propriétaire a ensuite demandé de ne rien recevoir sur cette adresse. Les derniers essais utilisent uniquement golf@marcilly.com, y compris comme adresse du visiteur fictif. Le comportement normal des accusés destinés aux vrais visiteurs n’a pas été modifié.

Identifiant des derniers essais : `TEST-GOLF-20261019-1792404047186`. Tous les messages précisent qu’il s’agit d’un test technique, sans place/table à bloquer ni prestation à organiser.

| Parcours réel testé par sa route HTTP | Résultat |
| --- | --- |
| Contact | HTTP 200 ; notification livrée selon Brevo |
| Devis | HTTP 200 ; notification livrée selon Brevo |
| Restaurant | HTTP 200 ; notification équipe et accusé client livrés selon Brevo |
| Initiation | HTTP 200 sur un créneau réellement proposé ; notification livrée selon Brevo |
| Répétition identique de l’initiation | HTTP 409 ; aucun second email d’initiation |

Brevo rapporte **cinq identifiants de messages distincts**, tous destinés à golf@marcilly.com, tous avec un événement `delivered`, aucun événement `blocked` pour cette série. Les deux emails restaurant ont des fonctions différentes et ne sont pas des doublons. Aucun doublon supplémentaire observé pour cette série ; cela ne prouve pas une déduplication générale des autres formulaires.

`delivered` confirme la livraison au serveur du destinataire. La présence dans la boîte de réception plutôt que les indésirables doit encore être confirmée par une personne ayant accès à la boîte du golf. Le Gmail connecté n’est pas cette boîte ; aucune réception en boîte golf n’a été prétendue.

Les demandes de contact, devis et initiation ne génèrent pas toutes un accusé visiteur automatique : leur comportement actuel a été conservé. La confirmation finale des réservations reste manuelle et n’a pas été simulée par un message trompeur. La file de secours préexistante n’a pas été retraitée.

## Tables Supabase réparées

Avant intervention, les trois relations étaient absentes, confirmé par `to_regclass` et les réponses API HTTP 404 / PGRST205. Aucun historique `supabase_migrations.schema_migrations` n’était présent sur cette base.

Migration traçable ajoutée : `supabase/migrations/20261019120000_repair_missing_operational_tables.sql`.

- Création des tables `restaurant_daily_menus`, `site_conditions`, `association_event_imports` si absentes.
- Contraintes de carte : entre 1 et 12 choix par catégorie ; contraintes des identifiants, états et motifs des conditions reprises du contrat actuel.
- RLS activée sur les trois tables.
- Aucun droit de lecture pour `anon` ou `authenticated` ; droits nécessaires accordés à `service_role` seulement, vérifiés par SQL.
- Aucun import de compétitions rejoué, aucun faux marqueur d’import ajouté. Les 57 compétitions existantes ont été sauvegardées avant intervention et conservées.
- API après intervention : HTTP 200 pour les trois tables.

La création de la table d’imports ne certifie pas que tous les imports historiques et alignements 2027 ont été appliqués : leur contenu reste une validation séparée. Les migrations historiques du dépôt n’ont pas été réécrites.

## Administration vérifiée

- Connexion avec le parcours administratif réel réussie ; cookies non affichés.
- Accès anonyme à la carte administrative refusé (HTTP 401).
- Enregistrement et relecture d’une carte fictive datée du 30 décembre 2199 réussis. Date volontairement future pour ne pas remplacer la carte affichée au public. Suppression de cette seule carte de test effectuée et confirmée.
- Passage du practice à fermé avec motif TEST, relecture Supabase, puis passage à ouvert vérifiés.
- La ligne du practice créée uniquement pour ce test a ensuite été retirée par une suppression conditionnée à son identifiant et au motif de test. Les trois nouvelles tables sont revenues à leur état vide après ces essais.
- Les parcours de gestion des compétitions existantes n’ont pas été modifiés durant cette vérification.

## Sauvegarde, compatibilité et retour arrière

Preuves locales privées dans `.data/staging-check-2026-10-19/`, exclues de Git : sauvegarde des compétitions avant intervention, réponses synthétiques des formulaires, résultats administratifs et événements de livraison. Les données personnelles éventuelles ne sont pas reproduites dans ce rapport.

La migration ajoute les tables manquantes sans transformer les compétitions ni importer des réservations. Elle ne change pas les méthodes, URL et réponses des API du site. Sur une installation existante, `CREATE TABLE IF NOT EXISTS` préserve les tables ; cette migration ne remplace pas la vérification des contraintes et migrations historiques déjà appliquées.

En cas de retour au code précédent, conserver ces tables : leur présence ne nécessite pas leur suppression. Toute suppression ultérieure doit être précédée d’un export et d’une vérification qu’aucune donnée métier n’y a été ajoutée. Aucun retour arrière destructif n’a été exécuté. Pour Golf Prod, vérifier séparément le schéma et la sauvegarde, puis appliquer seulement les migrations nécessaires avec autorisation ; ce rapport ne vaut pas déploiement en production.
