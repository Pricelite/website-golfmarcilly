# Instructions pour les agents — Golf de Marcilly

Ce fichier s'applique à tout le dépôt. L'objectif est de livrer des changements fiables, sûrs et faciles à exploiter en production, avec une vérification proportionnée à la demande. Répondre à l'utilisateur en français.

## Repères du projet

- Site Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 ; gestionnaire de paquets `pnpm@11.1.2`. Sur PowerShell, utiliser `pnpm.cmd`.
- `src/app` : pages, metadata et routes API ; `src/components` : interface ; `src/data` : contenu éditorial ; `src/lib` : logique métier et intégrations ; `supabase/migrations` : migrations SQL ; `public` : médias.
- Sources de configuration : `package.json`, `.env.local.example`, `next.config.ts` et le code concerné. Les comptes rendus et anciennes checklists donnent du contexte, mais peuvent décrire un parcours antérieur : vérifier dans le code avant de les suivre.
- Parcours d'initiation actuel : `/initiation/reservation`, `/api/initiation-options` et `/api/reservations` ; demande par email, confirmation par l'équipe, paiement sur place. `/api/initiation-reservation`, SumUp et certaines pages de paiement restent pour la compatibilité historique. Ne pas réactiver le paiement en ligne par simple refactorisation.
- L'administration, les compétitions, les formulaires publics, les emails, le calendrier, Supabase et la file de secours ont des effets réels : traiter leurs changements comme sensibles.

## Méthode de travail

1. Lire les fichiers concernés, leurs usages et les tests existants avant de modifier. Respecter les changements déjà présents dans l'arbre de travail ; ne pas écraser du travail extérieur à la demande.
2. Faire le plus petit changement cohérent qui résout la demande, sans masquer une erreur ni introduire une régression silencieuse. Garder la logique métier dans `src/lib`, le contenu réutilisable dans `src/data`, et les handlers API fins.
3. Préserver les contrats publics : URLs, méthodes HTTP, formes de réponse, statuts, cookies, variables d'environnement et comportement SEO. Si une modification de contrat est nécessaire, mettre à jour ses consommateurs et la documentation pertinente.
4. En cas de modification de configuration, de migration ou de parcours métier, décrire les prérequis de déploiement, la compatibilité avec les données existantes et la façon de revenir en arrière. Ne pas exécuter de migration, de déploiement ou d'opération sur les données de production sans demande explicite.
5. Signaler clairement toute hypothèse ou limite qui empêche de conclure qu'un changement est prêt à être déployé. Ne jamais présenter un contrôle non exécuté comme réussi.

## Exigences de production

- Valider et borner les entrées côté serveur ; conserver les contrôles d'origine, de débit et d'authentification des routes concernées. Ne pas faire confiance aux seuls contrôles du navigateur.
- Garder les secrets et les clés de service côté serveur. Ne jamais placer de secret dans `NEXT_PUBLIC_*`, le dépôt, les logs, les réponses API ou les captures. Utiliser `.env.local.example` pour documenter les noms et valeurs factices ; ne pas afficher le contenu de `.env.local`.
- Pour une opération qui envoie un email, réserve un créneau, modifie la base ou traite un webhook, vérifier les cas d'échec, les doublons et les tentatives répétées. Renvoyer une erreur compréhensible sans exposer de détails internes ou de données personnelles.
- Préserver l'accessibilité et le responsive des pages : HTML sémantique, labels, navigation clavier, états de chargement et d'erreur, textes alternatifs utiles. Conserver les metadata et liens internes lors des changements de contenu ou de route.
- Respecter le français du site et éviter d'inventer des tarifs, horaires, disponibilités, témoignages ou mentions légales. Vérifier les données métier dans les fichiers source ou demander une précision si elles manquent.
- Pour Supabase, écrire des migrations traçables dans `supabase/migrations` ; examiner les droits, contraintes, données existantes et effets d'une réexécution. Ne pas modifier une migration déjà appliquée pour changer le schéma en production.
- Ne pas introduire une nouvelle dépendance ou un service externe sans besoin concret ; vérifier l'impact sur le bundle, la configuration, la confidentialité et l'exploitation.

## Vérification proportionnée

- Pour une édition de documentation ou de contenu sans logique, relire le diff et vérifier les chemins, liens et faits modifiés. Aucun test automatique n'est requis par défaut.
- Pour du code, exécuter le contrôle le plus ciblé qui vérifie réellement le comportement changé (test existant pertinent, test ajouté si le risque le justifie, lint des fichiers concernés, ou typecheck si le changement touche les types). Vérifier aussi le diff avec `git diff --check` quand des fichiers suivis ont changé.
- Ne lancer la **batterie complète** `pnpm.cmd lint`, `pnpm.cmd typecheck`, `pnpm.cmd test` et `pnpm.cmd build` que si l'utilisateur la demande explicitement. Ne pas l'imposer comme préalable systématique à une modification ou à la réponse finale. La CI définie dans `.github/workflows/ci.yml` conserve ses propres contrôles complets sur push et pull request.
- Si un contrôle ciblé ne peut pas s'exécuter, indiquer pourquoi et ce qui a été vérifié à la place. Ne pas élargir les tests uniquement pour obtenir un signal vert sans rapport avec le changement.

## Livraison

Résumer ce qui a changé, pourquoi, les vérifications réellement effectuées et les éventuels risques ou étapes de mise en production. Donner des chemins de fichiers précis. Une modification locale du dépôt ne vaut pas déploiement.
