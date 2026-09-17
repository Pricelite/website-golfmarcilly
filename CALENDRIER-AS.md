# Calendrier de l'association sportive

Le calendrier est intégré dans `/association-sportive#competitions`.
L'administration `/admin/competitions` permet l'ajout, la modification et la
suppression avec confirmation. Les changements sont stockés dans Supabase et
visibles à la prochaine consultation ou au rechargement de la page publique,
sans redéploiement. Il n'y a pas de connexion à RMS9.

## Activer la gestion (une seule fois)

1. Renseigner `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_PASSWORD` et idéalement `ADMIN_SESSION_SECRET` dans `.env.local`
   pour le développement, puis dans les variables du serveur de production.
   Les clés privées ne doivent jamais porter le préfixe `NEXT_PUBLIC_`.
   `SUPABASE_SERVICE_ROLE_KEY` accepte la clé serveur secrète actuelle
   (`sb_secret_…`) ou la clé serveur historique `service_role` du projet.
2. Dans le SQL Editor du projet Supabase, exécuter le fichier
   `supabase/migrations/20260916_association_events.sql` dans son intégralité.
   Il crée la table et importe les 54 épreuves du programme actuel dans une
   transaction. Une réexécution ne réimporte pas les événements supprimés.
3. Redémarrer le serveur local après configuration, ou déployer le code et
   les variables pour la première activation en production.
4. Ouvrir `/admin/competitions`, se connecter avec le mot de passe administrateur,
   puis gérer le planning. Un lien est également disponible depuis `/admin`.

La table utilise RLS et n'autorise que le rôle serveur `service_role`.
Les mutations vérifient la session administrateur, l'origine de la requête,
les dates, l'horaire et les limites des champs côté serveur.
Les statuts « privée » et « en option » restent des mentions publiques,
pas des restrictions d'accès aux événements.

Sans configuration ou avant création de la table, le programme local reste
visible et l'administration n'autorise pas de fausse sauvegarde. Une base
configurée mais indisponible affiche un message temporaire. Une table vide
reste vide : les épreuves supprimées ne sont pas réimportées automatiquement.

## Programme repris

Source : https://www.marcilly.com/l-association, consultée le 15 septembre 2026.
L'année 2026 a été confirmée par le propriétaire dans la conversation.
Les dates chiffrées ont été conservées ; les jours de semaine sont calculés.
Le championnat du Club couvre ainsi les 12 et 13 septembre malgré la mention
« Dimanche 12 - 13 » dans la source. La mention « 3 1 mars » est reprise au 31 mars.

Les lignes sans épreuve identifiable (5 juillet, 31 août, 6 et 27 septembre,
25 octobre) ne sont pas affichées. Aucun rendez-vous n'est inventé pour les mois
sans programme. AVC Sécurité reste privé ; la Coupe Soditra reste en option.
Les horaires ne sont indiqués que lorsqu'ils sont fournis (After Work à 16 h).

## Données du programme initial

Le fichier `src/data/association-events.ts` reste le programme initial de secours.
Après activation de Supabase, modifier les compétitions dans l'administration.

- `start` : premier jour, au format `YYYY-MM-DD`.
- `end` : dernier jour inclus, facultatif.
- `title` : nom de l'épreuve.
- `time` et `note` : précisions fournies par l'organisateur, facultatives.
- `status` : `private` ou `provisional` si nécessaire.

Une épreuve sur plusieurs jours apparaît chaque jour et n'est comptée qu'une fois
dans la liste mensuelle. Le calendrier commence le lundi, s'ouvre au mois courant
à Paris et permet de naviguer entre les mois et les années.
Les cases deviennent grises dès le lendemain du dernier jour de l'épreuve,
selon la date à Paris ; les détails restent consultables.
