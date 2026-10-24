# État du golf sur l’accueil

La page d’accueil affiche séparément le Grand parcours aller et retour, le parcours
découverte, Pitch and Putt, Kaleka course, le practice, le restaurant, les voiturettes et les
chariots. Chaque ligne affiche « Ouvert » par défaut au début d’une nouvelle
journée, heure de Paris. La date du jour apparaît au-dessus de la liste ; tant
qu’aucune intervention n’a été saisie, l’accueil précise que cet état est le
réglage par défaut.

## Mise à jour

L’équipe se connecte à `/admin/site-conditions`, choisit « Ouvert », « Fermé »
ou « À confirmer », puis enregistre chaque ligne. Un motif est obligatoire en
cas de fermeture. L’état est visible sur l’accueil après actualisation de la
page. À minuit, heure de Paris, une fermeture de la veille cesse d’être
appliquée et la ligne repasse automatiquement à « Ouvert ». Une saisie du jour
reste affichée avec son horaire.
Une personne connectée à l’administration peut aussi cliquer sur le bouton
d’état de chaque ligne de l’accueil pour choisir directement « Ouvert » (vert)
ou « Fermé » (rouge). Les visiteurs ne disposent pas de ces commandes.

En développement, les saisies restent dans `.local-site-conditions.json` à la
racine du projet. Ce fichier est ignoré par Git et ne modifie pas Supabase.
Le supprimer remet les neuf lignes à « Ouvert » localement.

## Production

Avant de déployer ce code, appliquer la migration
`supabase/migrations/20261011_site_conditions.sql` et configurer
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` et
`ADMIN_SESSION_SECRET` côté serveur selon la configuration existante. Le
service role seul accède à la table ; les visiteurs reçoivent uniquement les
états rendus par le serveur. En cas d’échec de lecture, l’accueil affiche des
états « Non renseigné » sans annoncer une ouverture erronée.

La migration ajoute une table indépendante et ne modifie aucune donnée
existante. Pour revenir à l’application précédente, redéployer l’ancienne
version ; la table peut rester en place. La supprimer ensuite seulement si les
états saisis ne doivent plus être conservés.
