# Compte rendu du site — Golf de Marcilly

État vérifié le 17 septembre 2026 dans le projet local `website-golfmarcilly`.

## Bilan général

Le site possède une structure éditoriale avancée : accueil, parcours, tarifs,
enseignement, restaurant, événements, actualités, contact et association sportive.
Il dispose de parcours de réservation, de formulaires et d'une administration.
La présence du code ne signifie toutefois pas que les services externes sont actifs.
Dans l'environnement local examiné, les accès nécessaires à Supabase, aux e-mails,
à Google Calendar et à SumUp ne sont pas tous renseignés.

Ce rapport porte sur le code et les vérifications locales. Il ne certifie ni le
déploiement du nouveau site sur marcilly.com, ni la configuration de son hébergeur,
ni la réception réelle d'e-mails ou de paiements. Aucun message ni paiement réel
n'a été envoyé pour ce contrôle.

## Pages et contenus

| Partie | Ce qui est présent | Ce qui reste à vérifier ou compléter |
| --- | --- | --- |
| Accueil `/` | Carrousel de photos, présentation des 45 trous, offres, parcours, restaurant, enseignement, événements, actualités, carte et accès aux départs/résultats | Actualisation des offres saisonnières, véritables partenaires, validation finale des textes commerciaux |
| Golf `/golf` | Practice, découverte 9 trous, Pitch & Putt / Kaleka et Grand Parcours | Validation métier des caractéristiques et visuels |
| Tarifs `/tarifs` | Tableaux de découverte, practice, green fees, location et autres formules du fichier de tarifs | Relecture des tarifs affichés et mise à jour à chaque saison |
| Offres `/offres/[slug]` | Pages issues des offres actives : abonnement à 900 € et tarifs de septembre | Prévoir leur retrait ou remplacement à expiration ; pas d'expiration automatique identifiée dans les données actuelles |
| Enseignement `/enseignement` | École de golf 4–18 ans, débutants à 15 €/mois et perfectionnement à 35 €/mois, horaires, adultes, enseignants, contacts, Label Sportif 2024 et questions pratiques | Conditions et périodes de cours à confirmer au club ; ne pas présenter le label 2024 comme une certification 2026 |
| Réserver un cours `/reserver-un-cours` | Choix d'Adrien Lafuge, Roman Lissowski ou Baptiste Courtachon et accès à leurs sites | La prise de rendez-vous dépend des services des enseignants ; pas d'agenda de cours centralisé dans le site |
| Débuter `/je-debute-le-golf` | Présentation de la découverte et accès à l'initiation | Tester les disponibilités réelles après activation des services |
| Initiation `/initiation/reservation` | Choix du créneau, participants, formule avec ou sans repas et calendrier intégré | Connexions Google Calendar / Supabase / SumUp selon le fonctionnement retenu |
| Restaurant `/restaurant` | La Bergerie, galerie, menus et offres groupes/séminaires, forfaits boissons, conditions, demande de table et contact | Activer l'envoi d'e-mails et vérifier une demande de bout en bout avec l'équipe |
| Événements `/evenements` | Séminaires, team building, réceptions, mariages, groupes et formulaire de devis | Activer les e-mails ; confirmer les prestations et conditions commerciales |
| Association `/association-sportive` | Présentation de l'AS, calendrier, départs et résultats FFG, participation et questions pratiques | Organigramme, membres, photos, cotisation, documents d'adhésion et contacts propres à l'AS |
| Actualités `/actualites` et articles | Trois articles éditoriaux, catégories, dates, images et métadonnées | Ajouter les nouvelles réelles du club ; pas d'éditeur d'articles dans l'administration |
| Contact `/contact` | Coordonnées, formulaire et accès au golf | Livraison des messages à activer et vérifier |
| Mentions légales / confidentialité | Pages et structure conditionnelle | Identité juridique, direction de publication, hébergeur et informations de traitement des données encore vides dans `src/data/legal.ts` ; `reviewed` vaut `false` |

Les montants ci-dessus décrivent les données présentes dans le code ; il ne s'agit
pas d'une nouvelle vérification de validité commerciale auprès du club.

## Calendrier de l'association sportive

Le programme initial contient **54 compétitions de 2026**. Le calendrier permet
de changer de mois et d'année, de sélectionner une journée et d'ouvrir les détails
d'une épreuve. Les événements sur plusieurs jours couvrent leur période complète.

Les cases des compétitions passées deviennent grises dès le lendemain de leur
dernier jour, selon la date à Paris. Les mentions privées et provisoires restent
visibles et les détails restent consultables. La date est réévaluée périodiquement
et au retour sur la fenêtre.

L'intégration RMS9 essayée puis annulée est retirée. Le calendrier ne dépend pas
d'une connexion RMS9.

La nouvelle page `/admin/competitions` permet :

- d'ajouter une épreuve avec nom, dates, horaire, statut et description ;
- de modifier ces informations ;
- de rechercher une compétition par son nom ;
- de supprimer une épreuve après confirmation explicite.

Les mutations passent par une API contrôlant la session administrateur, l'origine
de la requête et les données. La table prévue dans Supabase n'est accessible que
par le rôle serveur. Le statut « privée » est une information affichée publiquement,
pas un mécanisme de confidentialité de l'événement.

L'URL du projet choisi est configurée : `https://yozjqvvkxkzncampegzl.supabase.co`.
La clé serveur reste absente du fichier local vérifié. L'exécution de la migration
dans ce projet n'est pas confirmée. La connexion du plugin Supabase n'a pas été
confirmée non plus dans la conversation.

Le script `supabase/migrations/20260916_association_events.sql` crée la table et
importe le programme initial. Une réexécution ne rétablit pas les compétitions
déjà supprimées. Avant activation, le site conserve le programme local. Après
activation, une table vide reste vide et une panne de base affiche un message
d'indisponibilité. Les changements sont visibles à la prochaine consultation ou
au rechargement du calendrier public, sans redéploiement.

## Réservations et formulaires

La réservation d'un départ utilise le service externe
`https://marcilly.reservations-golf.fr/`. Le site fournit le lien ; il ne gère pas
son inventaire de départs ni ses comptes utilisateurs.

Le parcours initiation contient une logique de créneaux de week-end, une capacité
de 12 personnes et une fenêtre de réservation de 7 jours à venir plus aujourd'hui.
Les formules codées sont à 25 € sans repas et 48 € avec repas. Les routes de paiement,
de notification SumUp et les pages de succès/annulation existent. Les identifiants
nécessaires manquent localement : ce parcours n'est donc pas validé en conditions
réelles. Le choix entre Google Calendar direct et le parcours Supabase avec
paiement doit être confirmé pour l'exploitation.

La réservation restaurant est une **demande de table**, à confirmer par le
restaurant. Le code prévoit un message au club puis un accusé de réception au
client. Les tests couvrent les erreurs d'envoi, l'ordre des messages et les dates.
Les demandes restaurant ciblent par défaut `golf@marcilly.com`.

Contact et devis disposent de formulaires et d'API. Une file de secours de contact
existe sur disque dans `.contact-fallback`. Son stockage doit être durable et
compatible avec l'hébergement avant de servir de garantie d'exploitation.

Un composant et une API newsletter existent, mais le composant n'est pas monté
dans les pages inspectées. L'API transmet une demande par e-mail au club : ce n'est
pas un système complet de listes d'abonnés et de campagnes marketing.

## Administration et contenus

`/admin` utilise une connexion par mot de passe et affiche le suivi des initiations
quand sa base est disponible. Il propose un accès à la gestion des compétitions.
Un mot de passe et un secret de session sont présents dans `.env.local`, sans être
reproduits ici. Le module de compétitions reste accessible indépendamment d'une
panne de la liste des réservations d'initiation.

Le site n'est pas un CMS complet : les menus, tarifs, offres, articles, partenaires
et textes des pages sont majoritairement gérés dans `src/data`. Hors compétitions,
une modification de ces contenus demande encore une modification du projet et
son déploiement.

La liste des membres de l'AS est vide. La liste des partenaires contient actuellement
le Golf de Marcilly lui-même, ce qui ne constitue pas une liste de partenaires
externes. Les réseaux sociaux enregistrés dans `src/data/site.ts` pointent vers des
adresses génériques, et ne sont pas exploités dans le pied de page actuel.

## Configuration technique et exploitation

Le projet utilise Next.js 16.2.6, React 19.2.3, TypeScript, Tailwind CSS 4 et Framer
Motion. Supabase est prévu pour les données ; Nodemailer/SMTP ou Brevo pour les
e-mails ; Google Calendar et SumUp pour les initiations selon configuration.

| Service local | État constaté |
| --- | --- |
| URL du site et URL Supabase | Présentes |
| Clé serveur Supabase | Absente |
| Clé publique Supabase historique attendue par le code existant | Absente |
| Mot de passe administrateur et secret de session | Présents |
| Identifiants Google Calendar | Absents |
| Identifiants SumUp | Absents |
| Expéditeur et destinataire des e-mails | Présents |
| Hôte, utilisateur et mot de passe SMTP | Absents |
| Clé Brevo | Absente |
| Jeton d'exploitation `OPS_CRON_TOKEN` | Absent |

Cette lecture ne révèle aucune valeur secrète et ne permet pas de déduire la
configuration éventuelle du serveur de production.

Le code contient des métadonnées par page, des URL canoniques, des données
structurées JSON-LD, un sitemap et des règles robots. Les pages légales non validées
sont exclues du sitemap et marquées non indexables. Les routes API et les pages
d'administration ont des dispositions de non-indexation. Cela ne mesure pas le
positionnement réel dans les moteurs de recherche.

Des protections sont présentes : validation serveur, contrôles d'origine, sessions
signées, cookies protégés, limitation de certaines requêtes et en-têtes de sécurité.
La limitation de requêtes est en mémoire et doit être évaluée si plusieurs instances
du serveur sont utilisées. Ces constats ne constituent pas un audit de sécurité exhaustif.

Le composant Analytics existe mais n'est pas monté dans le layout actuel. La mesure
de fréquentation et des conversions n'est donc pas opérationnelle via ce composant.

Le dossier `public` représente environ **85,7 Mio** de fichiers. Plusieurs visuels
sources pèsent 2 à 3 Mo. Ce total n'est pas le poids téléchargé d'une page, puisque
les images peuvent être optimisées et chargées à la demande. Une mesure dédiée
des performances réelles reste nécessaire avant de conclure sur la vitesse.

## Vérifications effectuées le 17 septembre

- `pnpm test` : **30 tests réussis**.
- `pnpm typecheck` : **réussi**.
- ESLint sur `src`, `middleware.ts` et `next.config.ts` : **réussi**.
- **13 pages** visitées dans Chromium local : réponses HTTP 200 et un titre H1
  relevé par page, dont l'accueil, golf, tarifs, enseignement, restaurant,
  événements, AS, actualités, débutants, contact, pages légales et administration.
- Aucune image terminée en erreur détectée dans la zone visible de ces contrôles ;
  ce test ne couvre pas toutes les images chargées plus bas au défilement.
- À **390 px**, aucun débordement horizontal détecté sur l'accueil, l'enseignement,
  l'AS et le restaurant. Ce n'est pas un audit complet de tous les appareils.
- `/sitemap.xml`, `/robots.txt` et l'image de partage testée répondent HTTP 200 en local.
- Les essais précédents de gestion des compétitions ont validé connexion, ajout,
  édition, rechargement, suppression/annulation, refus des requêtes non autorisées,
  gestion des erreurs et calendrier vide avec une **base simulée**.

Le build de production n'a pas été relancé pour ce compte rendu. Les envois réels,
paiements réels, modifications dans Supabase, performances de production,
accessibilité complète et toutes les destinations externes ne sont pas certifiés
par ces vérifications.

## GitHub et publication

La branche est `main`. Le dernier commit confirmé sur GitHub est
`900193c247346079729668b460e7f9de4486f8f9` : « feat: enrichir accueil, restaurant et
association sportive ». La référence distante a été vérifiée pendant cet examen.

Les améliorations récentes de la page Enseignement, le gris des compétitions passées,
la gestion administrateur des compétitions, sa migration et les adaptations de
connexion sont toujours dans les modifications locales : **elles ne sont pas
encore commitées et poussées**. La présence d'un commit sur GitHub ne prouve pas à
elle seule sa publication sur le domaine final.

## Priorités recommandées

1. Terminer l'accès à Supabase, installer la table et vérifier les sauvegardes réelles.
2. Configurer la livraison des e-mails et tester les demandes de table, contact et devis.
3. Choisir et activer le fonctionnement de réservation d'initiation ; tester capacité,
   confirmations et paiement si retenu.
4. Compléter les pages légales, les informations de l'AS et les vrais partenaires.
5. Valider les tarifs, offres, périodes de cours, prestations et articles avec le club.
6. Exécuter le build de production, vérifier l'environnement d'hébergement et les
   parcours métier, puis commiter, pousser et contrôler la publication effective.
7. Mesurer les performances, l'accessibilité et les conversions ; prévoir la mise
   à jour saisonnière des offres et du programme sportif.

Le point principal à traiter est désormais l'activation et la vérification des
services métier, avec la validation des contenus incomplets et la publication des
dernières modifications.
