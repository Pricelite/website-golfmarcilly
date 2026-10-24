# Checklist avant mise en ligne

Le parcours d'initiation actuel envoie une demande par e-mail. L'équipe confirme le créneau ; le règlement se fait sur place. Aucun paiement en ligne n'est proposé.

## Avant le déploiement

1. Exécuter `node scripts/preflight.mjs` avec la configuration destinée à la production (`pnpm.cmd preflight` est équivalent si pnpm est disponible). Le contrôle ne révèle aucune valeur secrète et échoue si une variable indispensable manque. Un résultat positif ne prouve pas que les services externes répondent.
2. Vérifier que `NEXT_PUBLIC_SITE_URL` correspond au domaine public HTTPS, puis configurer les redirections vers ce domaine et `FORM_ALLOWED_ORIGINS` si nécessaire.
3. Comparer les migrations présentes dans `supabase/migrations` avec l'historique de la base cible. Appliquer **uniquement les migrations non encore appliquées**, dans l'ordre. Les tables `public_rate_limits`, `contact_fallback_queue`, `restaurant_daily_menu`, les compétitions et les conditions du jour doivent être disponibles avant le code qui les utilise. Sauvegarder la base avant toute migration ; aucune migration n'est lancée par cette checklist.
4. Prévoir pour `BACKOFFICE_DB_PATH` un chemin absolu sur un volume persistant, inscriptible et sauvegardé, hors du dossier temporaire. Vérifier que toutes les instances utilisent le même stockage avant d'activer le back-office. Restaurer ou créer les comptes du back-office et tester les droits. Le fichier SQLite local et les médias ne sont pas copiés automatiquement par un déploiement ; tester leur présence après un redémarrage et une nouvelle version.
5. Configurer la messagerie (Brevo ou SMTP), l'expéditeur vérifié, les destinataires, le flux privé Google Calendar, Supabase et `OPS_CRON_TOKEN`. Configurer aussi `SITE_URL` et le secret `OPS_CRON_TOKEN` dans GitHub Actions pour la reprise de la file de secours.
6. Valider les mentions légales et la politique de confidentialité avec le propriétaire. L'hébergeur reste à renseigner dans `src/data/legal.ts`. Tant que `reviewed` vaut `false`, ces pages restent accessibles mais ne sont pas indexées.
7. Faire tourner les identifiants communiqués dans une conversation ou un document partagé avant leur utilisation en production.

## Vérifications après déploiement

- Ouvrir les pages principales sur ordinateur et téléphone, puis vérifier les images, liens, calendrier, prix et informations du restaurant.
- Vérifier `GET /api/health` publiquement, puis sa vue interne avec `Authorization: Bearer <OPS_CRON_TOKEN>`. La sonde publique mesure seulement la disponibilité du site ; la vue interne teste la configuration et certaines connexions.
- Depuis l'administration, tester la connexion, la déconnexion, la modification d'une compétition, de la carte du jour et des conditions du jour. Ouvrir aussi les archives des initiations et vérifier la consultation des anciennes réservations si la table historique existe. Vérifier que les changements survivent à un redémarrage.
- Soumettre une seule demande d'initiation clairement marquée comme test, sur un créneau convenu avec l'équipe. Vérifier sa réception et la réponse au client. Vérifier de même les formulaires contact, devis et restaurant avec des destinataires informés.
- Vérifier que la file de secours est vide quand l'e-mail fonctionne. Déclencher manuellement le workflow de reprise, puis contrôler ses exécutions planifiées et ses alertes. La reprise peut renvoyer un doublon si l'accusé du fournisseur d'e-mail est perdu.
- Vérifier `robots.txt`, `sitemap.xml`, les liens canoniques et les redirections du domaine final.

La mise en ligne ne doit être annoncée comme terminée qu'après ces contrôles réels. Un build local et le preflight ne vérifient ni la délivrabilité des e-mails ni les migrations de la base cible.
