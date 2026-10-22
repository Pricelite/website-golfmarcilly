# Préversion de démonstration sur Render

Service Node.js gratuit, branche `develop`. Build :
`corepack pnpm install --frozen-lockfile --prod=false && corepack pnpm build`.
Démarrage : `pnpm start --hostname 0.0.0.0 --port $PORT`.
Node : `NODE_VERSION=24`. Contrôle de santé : `/_preview-health`.

Variables :

- `PREVIEW_MODE=true`
- `PREVIEW_USERNAME=visiteur`
- `PREVIEW_PASSWORD` : phrase privée de 16 caractères au minimum, saisie par le propriétaire.
- `BACKOFFICE_DB_PATH=/tmp/golf-preview/backoffice.sqlite`
- `NEXT_PUBLIC_SITE_URL` : URL HTTPS attribuée par Render.

Ne pas importer `.env.local` et ne fournir aucune clé Supabase, Brevo, SMTP,
Google Calendar, OPS ou mot de passe administrateur. La carte d’exemple vient
du contenu public du dépôt, les créneaux sont fictifs et le calendrier de l’AS
utilise son repli public existant. Le bandeau signale la démonstration.

Toutes les ressources sont protégées par authentification HTTP, sauf le contrôle
de santé minimal. Les POST/PUT/PATCH/DELETE, l’administration et les diagnostics
internes sont refusés. Les réponses sont non indexables et sans cache partagé.
Le moteur de recherche n’est pas une protection d’accès ; le mot de passe l’est.
Les liens externes de réservation et de téléphone restent réels.

Le disque gratuit est éphémère et le service peut se mettre en veille. Cette
installation sert aux avis visuels, pas aux modifications administratives,
réservations, tests de persistance ou preuves de disponibilité de production.

Vérifier après déploiement : refus anonyme, authentification, pages et images,
formulaires refusés sans effet, refus de l’administration, noindex et robots.
Pour arrêter le partage, suspendre le service ou changer le mot de passe.
Pour revenir au site normal, utiliser un autre service configuré pour la
production ; ne pas enlever la protection de cette démonstration par défaut.
