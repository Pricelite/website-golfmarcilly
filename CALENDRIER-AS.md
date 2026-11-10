# Calendrier de l’association sportive

Le calendrier public se trouve sur `/association-sportive#competitions`. L’éditeur
est accessible aux administrateurs sur `/admin/competitions`. Les changements
enregistrés dans Supabase sont visibles au prochain chargement de la page publique.
Il n’y a pas de connexion à RMS9.

## Programme 2027 fourni par le club

Le fichier `Agenda_competitions_2027.html` remis le 10 novembre 2026 contient
107 entrées pour 2027 : 47 compétitions, 27 créneaux libres et 33 repères
(jours fériés, fêtes et vacances scolaires). Les dates, titres, statuts, zones
et notes ont été repris dans `src/data/association-events-2027.json` et
`src/data/association-calendar-context-2027.json`. Les deux dates « Goltechnic »
des 21 et 28 mars restent en option dans ce fichier. Le 11 avril reste un
« Créneau à définir ». Les indications « scramble à 2 » et « scramble à 4 »
alimentent aussi le champ structuré « Formule de jeu ».

Le programme de secours assemble ces 107 entrées avec les 13 rendez-vous du
club encore situés en 2026. Il n’ajoute pas les anciennes récurrences de 2027
qui ne figurent pas dans le fichier fourni. Les données 2026 du programme du
club et de Supabase ne sont pas modifiées.

## Formule de jeu

L’éditeur propose « Score max », « Scramble à 2 », « Scramble à 4 » et
« Autres ». Le choix « Autres » demande une précision. La validation est faite
côté serveur ; la formule enregistrée apparaît dans les détails publics de
l’événement. Les anciennes entrées sans formule restent valides.

## Stockage local et partagé

En développement, `CONTENT_SYNC_ENABLED=false` utilise le fichier local
`.local-association-events-2027.json`, ignoré par Git. S’il n’existe pas,
le programme de secours est utilisé. Le supprimer réinitialise les seules
données locales : sauvegarder les modifications utiles auparavant.

Avec `CONTENT_SYNC_ENABLED=true`, localhost lit les données partagées. Le jeton
limité `CONTENT_SYNC_TOKEN` est recommandé ; sans ce jeton, les anciennes
variables `CONTENT_SUPABASE_URL` et `CONTENT_SUPABASE_SERVICE_ROLE_KEY` donnent
un accès serveur plus large. Ne jamais exposer ces valeurs au navigateur ni
les placer dans `NEXT_PUBLIC_*`. Une base configurée mais indisponible affiche
une erreur ; une base vide reste vide. Le programme de secours ne remplace pas
silencieusement des données partagées.

Pendant que la base partagée utilise encore l’ancien schéma, localhost conserve
ses rendez-vous 2026 et affiche uniquement les 107 entrées 2027 du fichier
fourni. Un message « aperçu local » indique que cette présentation n’est pas
encore publiée. Une
fois la migration appliquée, les données partagées reprennent la main.

## Migration et déploiement

La nouvelle migration
`supabase/migrations/20261110150000_align_association_agenda_2027_and_game_format.sql`
ajoute `game_format` et `game_format_detail`, puis remplace les événements
commençant en 2027 par les 107 entrées du fichier fourni. Elle utilise un
marqueur unique pour ne pas écraser les changements ultérieurs lors d’une
réexécution. La mise à jour des
lignes existantes et la suppression des entrées absentes du fichier sont bornées
aux dates commençant en 2027 ; aucune ligne de 2026 n’est modifiée. Elle est
copiée à l’identique sous `staging/supabase/migrations`.

Le schéma de Golf Staging précédait l’alignement d’octobre : la migration ajoute
aussi, si nécessaire, les colonnes `category` et `zone`, leurs contraintes et
les statuts de calendrier avant l’import. Elle crée la table de suivi des
imports si elle manque. Ces ajouts ne modifient pas les événements 2026.

Le déploiement de staging sur `develop` doit appliquer cette migration avec
les accès propres à staging, dans l’ordre suivi par Supabase. Vérifier le check
« Supabase Preview » du commit avant de considérer la version prête. Arrêter
le déploiement si la migration échoue. Cette procédure ne s’applique pas à
Golf Prod : ne pas y exécuter de migration ni publier le code dépendant des
nouvelles colonnes sans demande explicite et vérification du schéma.

Le code peut lire l’ancien schéma sans les deux colonnes de formule afin de
préserver l’affichage du calendrier pendant la transition. En revanche,
l’enregistrement d’une formule exige que la migration soit appliquée sur la
base utilisée. Pour revenir au code précédent, conserver les nouvelles
colonnes : il les ignore. Pour revenir sur les données 2027 importées,
restaurer une sauvegarde ciblée des lignes 2027 ; ne pas rejouer une ancienne
migration. Les entrées 2026 restent indépendantes.

## Contrats et sécurité

La table `association_events` utilise RLS et n’accorde pas d’accès direct aux
rôles publics. Les mutations vérifient la session administrateur, l’origine
de la requête, les dates et la longueur des champs côté serveur. Les statuts
« privée », « en option », « à confirmer » et « confirmée » sont des mentions
publiques, et non des restrictions d’accès aux événements.
