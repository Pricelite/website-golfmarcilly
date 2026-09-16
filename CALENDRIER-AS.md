# Calendrier de l'association sportive

Le calendrier est intégré dans `/association-sportive#competitions`. Il utilise
`src/data/association-events.ts`, sans iframe, compte Google ni service externe.
Les modifications du programme se font dans ce fichier, puis nécessitent un
redéploiement pour apparaître sur le site en ligne. Il n'y a pas de synchronisation
automatique avec l'ancien site ni d'interface d'administration du calendrier.

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

## Modifier une épreuve

- `start` : premier jour, au format `YYYY-MM-DD`.
- `end` : dernier jour inclus, facultatif.
- `title` : nom de l'épreuve.
- `time` et `note` : précisions fournies par l'organisateur, facultatives.
- `status` : `private` ou `provisional` si nécessaire.

Une épreuve sur plusieurs jours apparaît chaque jour et n'est comptée qu'une fois
dans la liste mensuelle. Le calendrier commence le lundi, s'ouvre au mois courant
à Paris et permet de naviguer entre les mois et les années.
