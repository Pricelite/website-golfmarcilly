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
   Il crée la table et importe les épreuves historiques de 2026 dans une
   transaction. Une réexécution ne réimporte pas les événements supprimés.
   Exécuter ensuite `supabase/migrations/20261009_association_events_2027.sql`.
   Cette migration ajoute les statuts 2027 et importe les 47 compétitions
   nommées du fichier fourni par le propriétaire. Ne pas la lancer sur la
   production sans validation explicite. Elle conserve les données de 2026
   en archive dans la table, mais le calendrier public et l'administration
   n'affichent que les événements à partir de 2027. En cas de retour au code
   précédent, les données 2026 restent disponibles. Après sauvegarde, les
   entrées `agenda-2027-source-*` peuvent être retirées si nécessaire ; ne
   rétablir l'ancienne contrainte de statut que si `confirmed` et `unconfirmed`
   ne sont plus utilisés.
3. Redémarrer le serveur local après configuration, ou déployer le code et
   les variables pour la première activation en production.
4. Ouvrir `/admin/competitions`, se connecter avec le mot de passe administrateur,
   puis gérer le planning. Un lien est également disponible depuis `/admin`.

La table utilise RLS et n'autorise que le rôle serveur `service_role`.
Les mutations vérifient la session administrateur, l'origine de la requête,
les dates, l'horaire et les limites des champs côté serveur.
Les statuts « privée », « en option », « à confirmer » et « confirmée » restent des mentions publiques,
pas des restrictions d'accès aux événements.

Sans configuration ou avant création de la table, le programme local reste
visible et l'administration n'autorise pas de fausse sauvegarde. Une base
configurée mais indisponible affiche un message temporaire. Une table vide
reste vide : les épreuves supprimées ne sont pas réimportées automatiquement.

## Programme repris

Le programme 2027 provient du fichier `Agenda_competitions_2027.html` fourni
par le propriétaire. Seules les 47 lignes intitulées « Compétition » avec un
nom ont été importées : 4 confirmées, 7 en option et 36 à confirmer. Les
créneaux libres, vacances, fêtes et jours fériés ne sont pas présentés comme
des épreuves. Les compétitions sur deux jours restent deux entrées si leur
statut diffère dans la source. Les modifications ultérieures se font dans
`/admin/competitions` ; la migration n'écrase pas les éditions et son marqueur
empêche qu'une réexécution restaure les entrées supprimées.

## Données du programme initial

Le fichier `src/data/association-events.ts` contient uniquement le programme
2027 de secours. Les données 2026 encore présentes dans Supabase sont conservées
pour un éventuel retour arrière, sans être affichées ni modifiables dans
l'administration courante.
Après activation de Supabase, modifier les compétitions dans l'administration.

- `start` : premier jour, au format `YYYY-MM-DD`.
- `end` : dernier jour inclus, facultatif.
- `title` : nom de l'épreuve.
- `time` et `note` : précisions fournies par l'organisateur, facultatives.
- `status` : `private`, `provisional`, `unconfirmed` ou `confirmed` si nécessaire.

Une épreuve sur plusieurs jours apparaît chaque jour et n'est comptée qu'une fois
dans la liste mensuelle. Le calendrier commence le lundi et s'ouvre sur la
première compétition 2027 tant que l'année n'a pas commencé, puis sur le mois
courant à Paris. La navigation entre les mois reste disponible.
Les cases deviennent grises dès le lendemain du dernier jour de l'épreuve,
selon la date à Paris ; les détails restent consultables.
