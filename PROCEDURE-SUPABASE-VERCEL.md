# Procédure de configuration de production

La checklist à suivre est [CHECKLIST-MISE-EN-PROD.md](CHECKLIST-MISE-EN-PROD.md). Le site ne propose aucun paiement en ligne : les demandes d'initiation sont envoyées par e-mail, confirmées par l'équipe et réglées sur place.

## Supabase

Comparer l'historique des migrations du projet cible avec les fichiers de `supabase/migrations`. Appliquer seulement les migrations manquantes dans l'ordre chronologique, après sauvegarde. Ne pas modifier une migration déjà appliquée pour changer un schéma existant. Les migrations historiques relatives à d'anciennes réservations restent dans le dépôt pour garder la traçabilité des bases qui les ont reçues ; le code actif n'utilise plus ce parcours.

## Configuration

Utiliser `.env.local.example` comme liste de noms, avec des valeurs propres à la production. Les clés de service et les secrets restent côté serveur. `BACKOFFICE_DB_PATH` doit désigner un volume persistant et sauvegardé. Configurer `SITE_URL` et `OPS_CRON_TOKEN` dans les paramètres du dépôt GitHub pour le workflow de reprise de la file.

Exécuter `node scripts/preflight.mjs` dans un environnement contenant les valeurs prévues. Le script vérifie la présence et la forme des paramètres critiques sans afficher leur contenu. Vérifier ensuite les services et les parcours sur le déploiement réel selon la checklist.
