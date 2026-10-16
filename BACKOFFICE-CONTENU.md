# Back-office de contenu — état de cette étape

Cette étape ajoute un espace distinct sous `/admin/contenu` **en local**. Elle ne remplace pas encore l'administration historique de `/admin`, qui continue d'utiliser `ADMIN_PASSWORD` pour les réservations, compétitions, carte du restaurant et conditions du jour. Aucun déploiement ni migration Supabase n'a été effectué.

## Couverture actuelle

| Fonction | État |
| --- | --- |
| Comptes individuels, connexion, déconnexion, révocation des sessions | Opérationnel dans `/admin/contenu` |
| Invitation par lien temporaire à usage unique, mot de passe personnel | Opérationnel ; le lien est transmis manuellement par l'administrateur |
| Rôles administrateur, éditeur, contributeur | Opérationnel ; sauf pour l'administrateur, le rôle sert de repère et **n'accorde aucun droit implicite** |
| Droits par page, toutes les pages et médiathèque | Opérationnel pour les actions affichées ; refus par défaut côté serveur |
| Brouillons, demande de validation, aperçu privé, publication, historique, restauration en brouillon, détection de conflit | Opérationnel pour les pages créées dans le nouveau back-office |
| Pages `/pages/[adresse]`, titre SEO, description SEO, URL canonique, sitemap, blocs titre/texte/image/bouton, ambiance crème/vert/blanc | Opérationnel |
| Médiathèque JPEG/PNG/WebP, 5 Mo, médias de brouillon privés | Opérationnel |
| Journal des actions sensibles | Opérationnel pour cette administration |
| Pages existantes (`/`, `/restaurant`, `/association-sportive`, etc.), menus, sections codées et médias de `public/` | **Encore définis dans le code** ; aucune édition depuis ce back-office |
| Droits par section, édition des espacements/typographies, déplacement d'adresse avec redirection | **À réaliser** |
| Comptes individuels sur l'administration historique `/admin` | **À réaliser** ; conserver `ADMIN_PASSWORD` secret pendant la transition |

La portée est donc une première tranche fonctionnelle, pas un CMS complet de l'ensemble du site. Les pages, routes, contenus et fonctionnalités existants restent en place. Aucune copie des contenus existants vers le nouvel éditeur n'a encore été effectuée ; il ne faut pas annoncer cette migration comme achevée.

## Installation et premier administrateur

Prérequis : Node.js **24 ou plus** (SQLite intégré à Node), `pnpm@11.1.2`, accès en écriture au dossier du projet.

Dans PowerShell, depuis la racine du dépôt :

```powershell
pnpm.cmd install
pnpm.cmd exec tsx scripts/backoffice-bootstrap.ts votre-adresse@example.fr
pnpm.cmd dev
```

La commande d'initialisation demande un mot de passe personnel d'au moins 14 caractères **dans le terminal**. Elle refuse de créer un autre administrateur si un administrateur actif existe déjà. Aucun compte ni mot de passe fixe n'est livré dans le dépôt. Ouvrir ensuite `http://localhost:3000/admin/contenu/connexion`.

En développement, SQLite se trouve dans `.data/backoffice.sqlite` et les images dans `.data/media/`. Ces chemins sont ignorés par Git. `BACKOFFICE_DB_PATH` peut désigner un autre fichier SQLite ; en production il est obligatoire et doit pointer vers un volume persistant, privé et sauvegardé. Voir `.env.local.example` pour les autres variables du projet. Ne jamais mettre le fichier SQLite ni les médias dans `public/`.

## Utilisateurs, droits et publication

1. L'administrateur ouvre **Utilisateurs et droits**, saisit le nom et l'adresse, choisit un rôle et coche les permissions par page ou pour la médiathèque.
2. Le lien d'activation affiché une fois est transmis par un canal sûr. Il expire après 24 h et l'utilisateur choisit son mot de passe. Aucune inscription publique n'est ouverte.
3. L'administrateur peut désactiver un compte, modifier ses droits, révoquer ses sessions ou créer un nouveau lien de mot de passe. Lorsqu'il change son propre mot de passe, sa session reste active jusqu'à l'utilisation du lien ; l'activation du nouveau mot de passe révoque alors ses sessions. Une personne ne peut pas modifier ses propres droits ; le dernier administrateur actif est protégé.
4. Une page est d'abord un brouillon. Le bouton **Aperçu privé** exige une session avec droit de consultation. Un contributeur doté du droit `submit` peut demander validation ; seul le droit `publish` permet de publier.
5. La publication rend `/pages/[adresse]` accessible au public. Les visiteurs et moteurs de recherche ne voient jamais les brouillons. Une restauration crée un **nouveau brouillon** : il faut le publier séparément.
6. Si deux personnes éditent une même version, la seconde reçoit une erreur 409 et doit recharger la page. Les changements ne sont pas écrasés silencieusement.

Les images de brouillon sont servies uniquement à une session disposant du droit `media:view`. Elles deviennent publiques lorsqu'une page publiée les utilise. Le contenu est rendu par composants sans HTML arbitraire, et les liens sont limités aux chemins internes et aux URL HTTPS.

## Sauvegarde et restauration

Arrêter le serveur avant une copie manuelle, puis sauvegarder **ensemble** `.data/backoffice.sqlite` et `.data/media/` (ou le chemin défini par `BACKOFFICE_DB_PATH` et son dossier `media`). Si la sauvegarde doit se faire pendant que le site tourne, utiliser l'API de sauvegarde SQLite ou `VACUUM INTO` ; une simple copie du seul fichier `.sqlite` peut omettre les données du journal WAL.

Pour restaurer : arrêter le serveur, conserver une copie de l'état actuel, replacer la base **et** les médias issus de la même sauvegarde, puis redémarrer. Les pages publiées redeviennent visibles avec leurs anciennes versions. Pour revenir au site d'avant cette étape sans perdre les données, conserver une copie du dossier de données puis retirer les nouvelles routes/code lors d'une révision Git ; les anciennes pages du site restent indépendantes.

## Prérequis avant mise en production

- Hébergement Node.js 24 avec stockage persistant partagé par **toutes** les instances de l'application, HTTPS et sauvegardes testées. Un hébergement sans disque durable ou avec plusieurs instances non coordonnées ne convient pas au SQLite local.
- Vérifier la configuration du contrôle de débit derrière le proxy de production, les origines autorisées (`NEXT_PUBLIC_SITE_URL`, `FORM_ALLOWED_ORIGINS`) et la protection des secrets existants.
- Faire une revue de sécurité et relier l'administration historique aux comptes individuels avant d'abandonner `ADMIN_PASSWORD`.
- Migrer progressivement les pages et contenus existants, avec un inventaire éditorial et des contrôles visuels, avant de présenter le site comme entièrement administrable.

## Vérifications effectuées

- Tests ciblés du modèle de permissions, validation des blocs et remise à « Ouvert » des conditions du jour : réussis.
- Sur un serveur Next local, la connexion d'un compte fictif, l'activation d'un contributeur, le refus des routes de gestion des comptes et de publication, la modification autorisée, le conflit 409, l'aperçu privé, la demande de validation, la publication, la restauration sans effet immédiat sur le public, la désactivation et la persistance après redémarrage ont été vérifiés. La base et les comptes fictifs ont ensuite été supprimés.
- Compilation `pnpm.cmd build` : réussie. Lint ciblé : aucune erreur ; les avertissements d'optimisation d'images ont ensuite été éliminés en utilisant `next/image`.
- Typecheck séparé : bloqué par deux erreurs **préexistantes** de types Framer Motion dans `src/components/ui/faq-accordion.tsx` et `src/components/ui/reveal.tsx` ; aucune erreur nouvelle du back-office n'a été signalée.

Cette étape ne couvre pas encore l'ensemble des vérifications demandées pour un CMS complet, notamment la migration des pages existantes, les permissions par section et un essai de sauvegarde/restauration sur l'hébergement cible.
