# Calendrier de l'association sportive

Le calendrier est intégré dans `/association-sportive#competitions`.
L'administration `/admin/competitions` permet l'ajout, la modification et la
suppression avec confirmation. Les changements sont stockés dans Supabase et
visibles à la prochaine consultation ou au rechargement de la page publique,
sans redéploiement. Il n'y a pas de connexion à RMS9.

## Prévisualisation locale sans toucher à Supabase

En mode développement, la page publique et `/admin/competitions` utilisent
toujours le calendrier local : aucune mutation de compétition ne part vers
Supabase, même si `.env.local` pointe vers une base distante. Au premier
chargement, sans `.local-association-events-2027.json`, le programme de secours
fournit les 73 épreuves ou créneaux et les 33 repères scolaires et calendaires.
La première modification crée ce fichier à la racine du projet ; les suivantes
y sont enregistrées. Il est ignoré par Git. Le retirer réinitialise l'affichage
local au programme de secours et ne transfère rien à Supabase. Sauvegarder ce
fichier séparément pour conserver les modifications locales. Le mode local est
inactif en production.

Le fichier local déjà préparé sur ce poste contient 106 entrées après les
corrections visibles sur la capture du propriétaire. Les notes de préparation
conservées restent dans sa note interne, visible uniquement dans l'éditeur
local. Les indications de formule de jeu utiles au public apparaissent dans
la description des épreuves concernées.

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
   n'affichent que les événements à partir de 2027. Exécuter enfin
   `supabase/migrations/20261010_association_2027_open_slots.sql` pour ajouter
   les 27 créneaux du fichier initial. Exécuter ensuite
   `supabase/migrations/20261011_association_2027_calendar_alignment.sql` :
   cette migration ajoute les catégories et zones modifiables, corrige les
   dates et statuts d'après la capture du propriétaire, puis importe les 33
   repères. Elle ne remplace les anciennes valeurs que si elles n'ont pas été
   modifiées dans l'administration. Appliquer les migrations avant de déployer
   le code qui lit les nouvelles colonnes. En cas de retour au code
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
Les nouvelles colonnes `category` et `zone` ont des valeurs par défaut pour les
anciennes lignes ; le code précédent peut continuer à les ignorer en cas de
retour arrière applicatif. Pour annuler aussi les corrections de données après
exécution de la migration, restaurer une sauvegarde de la base prise avant son
application plutôt que de relancer les anciennes migrations.
Les statuts « privée », « en option », « à confirmer » et « confirmée » restent des mentions publiques,
pas des restrictions d'accès aux événements.

Sans configuration ou avant création de la table, le programme local reste
visible et l'administration n'autorise pas de fausse sauvegarde. Une base
configurée mais indisponible affiche un message temporaire. Une table vide
reste vide : les épreuves supprimées ne sont pas réimportées automatiquement.

## Programme repris

Le programme 2027 provient du fichier `Agenda_competitions_2027.html` fourni
par le propriétaire. Ce fichier initial comprend 47 compétitions nommées
(4 confirmées, 7 en option et 36 à confirmer) et 27 « créneaux à définir ».
La capture transmise ensuite corrige le 21 mars (Goltechnic confirmé), retire
Goltechnic du 28 mars et place Coupe CITYA en option le 11 avril. Le calendrier
local, le programme de secours et la migration d'alignement reprennent ces
trois corrections, soit 47 compétitions et 26 créneaux à définir.
Le propriétaire précise qu'une seule compétition est confirmée dans son agenda
actuel : Goltechnic le 21 mars. Les quatre anciennes mentions « Confirmé » du
fichier HTML initial sont retirées du calendrier local et du secours ; leurs
épreuves restent au programme sans statut affirmé jusqu'à réception de la
sauvegarde complète à jour.
Les noms 2026 et les notes de préparation associés à ces
créneaux ne sont pas publiés. Les vacances, fêtes et jours fériés ne sont pas
présentés comme des compétitions. Les compétitions sur deux jours restent deux
entrées si leur statut diffère dans la source. Les modifications ultérieures se
font dans `/admin/competitions` ; les migrations n'écrasent pas les éditions et
leurs marqueurs empêchent qu'une réexécution restaure les entrées supprimées.

## Données du programme initial

Le fichier `src/data/association-events.ts` assemble le programme 2027 de
secours et ses 33 repères. Les données 2026 encore présentes dans Supabase sont conservées
pour un éventuel retour arrière, sans être affichées ni modifiables dans
l'administration courante.
Après activation de Supabase, modifier les compétitions dans l'administration.

- `start` : premier jour, au format `YYYY-MM-DD`.
- `end` : dernier jour inclus, facultatif.
- `title` : nom de l'épreuve.
- `time` et `note` : précisions fournies par l'organisateur, facultatives.
- `status` : `private`, `provisional`, `unconfirmed` ou `confirmed` si nécessaire.

Une épreuve sur plusieurs jours apparaît chaque jour et n'est comptée qu'une fois
dans la liste mensuelle. Le calendrier commence le lundi et s'ouvre sur janvier
2027 tant que l'année n'a pas commencé, puis sur le mois courant à Paris. La
navigation entre les mois reste disponible.
Les cases deviennent grises dès le lendemain du dernier jour de l'épreuve,
selon la date à Paris ; les détails restent consultables.
