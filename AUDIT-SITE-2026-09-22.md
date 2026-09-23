# Audit du site Golf de Marcilly — 22 septembre 2026

Version auditée : commit `8474a6e`, branche `main`.

## Verdict

Le site local est fonctionnel pour la consultation et la sélection des créneaux, mais tout n’est pas opérationnel. L’envoi des mails est actuellement bloqué depuis ce PC par la protection IP de Brevo. L’administration des compétitions attend l’installation de sa table Supabase. La publication du nouveau site sur le domaine définitif n’est pas confirmée.

Cet audit vérifie le projet local et une compilation de production exécutée localement. Il ne certifie ni un hébergement distant inconnu, ni la réception de mails, ni une conformité juridique ou une sécurité exhaustive.

## Vérifications réussies

| Contrôle | Résultat |
| --- | --- |
| TypeScript | Aucune erreur |
| ESLint sur `src` | Aucune erreur |
| Tests automatisés | 35 tests réussis |
| Compilation de production | Réussie dans une copie isolée, sans interrompre le site de travail |
| Pages visitées | 23 routes répondent en HTTP 200, y compris les écrans de connexion et les anciennes pages de paiement |
| Pages publiques principales | 19 pages inspectées à 1440, 390 et 320 pixels : aucun débordement horizontal détecté, aucune erreur JavaScript relevée, aucune image chargée détectée comme cassée |
| Autres écrans | Administration et paiement : contrôle complémentaire à 390 pixels |
| Navigation mobile | Ouverture du menu et navigation vers Golf / Parcours vérifiées |
| Liens internes | 19 destinations relevées vérifiées, aucune erreur HTTP ni ancre manquante détectée |
| Liens externes principaux | 6 réponses HTTP 200 : réservation des départs, départs/résultats FFGolf, sites des trois enseignants |
| Tarifs par parcours | Quatre tableaux intégrés aux blocs, alimentés par les mêmes données que la page Tarifs |
| Agenda d’initiation | Lecture du flux Google fonctionnelle ; 121 créneaux remontés au moment du contrôle, sur les six prochains mois |
| Choix d’initiation | Sélection d’une date puis d’un horaire vérifiée dans le navigateur |
| Contrôles des formulaires | Contact, devis, restaurant, initiation et newsletter : requêtes vides rejetées en 400 ; origines étrangères rejetées en 403 |
| Protection de l’administration | Connexion valide en 303 ; création de compétition sans authentification refusée en 401 |
| Référencement technique | Titres et un H1 présents sur les pages contrôlées ; sitemap.xml et robots.txt répondent en 200 |

Le serveur de production local a également servi sans erreur l’accueil, Golf / Parcours, l’initiation, l’association sportive et l’API des créneaux. Les fonctions de réservation des sites externes n’ont pas été utilisées : une réponse HTTP 200 ne garantit pas leur parcours de paiement ou leur disponibilité réelle.

## Points à traiter, par priorité

### 1. Prioritaire — Brevo bloque actuellement les mails depuis ce PC

Les appels de contrôle aux API Brevo `account`, `senders` et `senders/domains` retournent HTTP 401 avec un motif d’adresse IP non autorisée. La présence d’une clé ne suffit donc pas à garantir l’envoi. La validation antérieure de l’expéditeur ne peut pas être revérifiée tant que cette restriction persiste.

Conséquence : les demandes d’initiation ne peuvent pas être considérées comme envoyées avec succès depuis cette configuration. Contact, devis et restaurant utilisent également le service de messagerie ; leurs mécanismes éventuels de secours ne prouvent pas une réception effective par le golf.

Action : autoriser l’adresse IP actuelle du serveur concerné dans Brevo, puis réaliser un envoi explicitement autorisé vers le golf et vérifier la réception dans Outlook ainsi que le bouton Répondre. Faire la même vérification pour l’hébergement final, dont l’adresse IP peut différer de celle du PC.

Aucun mail réel n’a été envoyé pendant cet audit. Aucun contact client n’a été sollicité.

### 2. Prioritaire — Nouveau site et domaine public à distinguer

La page publique https://www.marcilly.com/ consultée pendant l’audit présente toujours l’ancien site, avec des ressources Wix et une navigation différente. Le push GitHub confirme le dépôt du code, pas la mise en production sur ce domaine.

Action : identifier l’hébergement du nouveau site, vérifier son déploiement, y renseigner les variables privées Brevo et `INITIATION_CALENDAR_ICS_URL`, puis refaire les tests sur son URL. Vérifier les origines autorisées des formulaires et les URL canoniques lors du passage au domaine final.

Source : [accueil public du Golf de Marcilly](https://www.marcilly.com/).

### 3. Important — Administration des compétitions non opérationnelle

Supabase répond, mais la table `association_events` est absente de l’API (HTTP 404). L’écran `/admin/competitions` présente un avertissement de configuration. Le calendrier public reste visible grâce à son programme de repli dans le code ; cela ne signifie pas que les ajouts/suppressions administratifs fonctionnent.

Action : installer les migrations de compétitions `20260916_association_events.sql` puis `20260921_thursday_ranking_cups.sql`, et vérifier un ajout, une modification et une suppression temporaires. Aucun changement de compétition n’a été effectué pendant cet audit.

Les tables des anciennes réservations d’initiation existent, mais le formulaire actuel envoie une demande par mail : il ne crée plus de réservation dans Supabase, conformément au choix du propriétaire. Il n’écrit pas non plus dans Google Agenda.

### 4. Important — Informations légales et confidentialité incomplètes

Les pages existent et s’affichent, mais `src/data/legal.ts` comporte toujours `reviewed: false` et des champs vides : identité de l’éditeur, directeur de publication, hébergement, responsable des traitements, conservation, droits et services tiers.

Action : fournir et faire valider ces informations avant publication. Les intégrations Google Maps/Agenda doivent être décrites selon leur utilisation réelle. Le contrôle effectué est éditorial et technique, pas une validation juridique.

### 5. À corriger — Le diagnostic technique ne reflète plus le parcours actuel

`/api/health` renvoie HTTP 503 et `degraded`. Il attend encore notamment les clés du compte de service Google, les réglages SumUp et une clé publique Supabase. Or l’initiation fonctionne maintenant avec un flux iCal privé et une demande par mail, sans paiement en ligne.

Conséquence : ce diagnostic peut annoncer des services manquants qui ne sont plus nécessaires. Inversement, il signale la messagerie comme configurée alors que Brevo refuse actuellement les appels.

Action : adapter `src/lib/ops/environment.ts` au fonctionnement réel. Ne pas configurer SumUp simplement pour rendre ce diagnostic vert ; le paiement en ligne n’est pas demandé.

### 6. À harmoniser — Horaires d’accueil contradictoires

Le nouveau site indique tous les jours 8 h–19 h dans `src/data/site.ts`. L’accueil public actuel indique 8 h 30–19 h en semaine et 8 h–20 h le week-end. Faire confirmer les horaires à afficher ; ne pas décider automatiquement qu’une des deux sources est correcte.

Source : [horaires sur l’accueil public](https://www.marcilly.com/).

### 7. Améliorations secondaires

- Les pages `/admin`, `/admin/competitions` (écran de connexion), `/payment/success` et `/payment/cancel` présentent deux éléments `main` imbriqués. Nettoyer la structure pour les technologies d’assistance.
- Les anciennes routes et pages de paiement et de réservation sont encore présentes. Documenter leur rôle ou retirer celles qui ne servent plus, en préservant les éventuelles anciennes réservations.
- Les fichiers de `public` totalisent environ 96 Mio ; plusieurs images sources approchent 3 Mio. Ce n’est pas le poids téléchargé d’une page, car Next optimise les images. Une optimisation des sources et une mesure de performance en production restent souhaitables.
- Les noms de l’équipe associative et certaines informations éditoriales restent à compléter avec le propriétaire.
- Les offres datées, notamment septembre, nécessitent un suivi éditorial afin de ne pas rester affichées après leur validité.

## Parcours d’initiation attendu et constaté

1. Le site lit le flux privé Google côté serveur.
2. Il propose les créneaux futurs dont le titre correspond à `DEC - VIDE`, sur six mois, avec les heures de Paris.
3. Le visiteur choisit une date, un horaire, une formule et ses coordonnées.
4. Le serveur revérifie que le créneau est toujours proposé avant l’envoi.
5. Un mail doit être envoyé au golf, avec l’adresse du visiteur en Reply-To.
6. L’équipe du golf doit répondre manuellement pour confirmer ; aucune place n’est bloquée automatiquement et aucune réservation n’est ajoutée à Google ou Supabase.

Les étapes de lecture et de sélection sont vérifiées. Les tests automatisés couvrent notamment les récurrences, exclusions, annulations, changements d’heure et données invalides. L’étape d’envoi réel reste bloquée par Brevo ; la réception et la réponse depuis Outlook restent à tester.

## Résumé à copier dans ChatGPT

> J’ai un site Golf de Marcilly en Next.js 16.2.6 / React 19 / TypeScript, commit 8474a6e sur main. Un audit local a validé 35 tests, TypeScript, ESLint, une compilation de production et 23 routes en HTTP 200. Les 19 pages publiques principales ont été contrôlées sur ordinateur et mobile sans débordement ni image cassée détectés. Les 19 liens internes relevés et 6 liens externes principaux répondent correctement. Le formulaire d’initiation lit les créneaux DEC - VIDE d’un Google Agenda privé, puis doit envoyer une demande par mail au golf ; l’équipe confirme manuellement par réponse, avec paiement sur place. Il ne faut pas réintroduire de réservation automatique dans Supabase ni de paiement SumUp. Points prioritaires : Brevo répond 401 pour une IP non autorisée, donc l’envoi réel n’est pas validé ; le domaine www.marcilly.com affiche encore l’ancien site ; la table Supabase association_events manque et bloque l’administration des compétitions ; les informations légales sont incomplètes ; /api/health vérifie encore des services devenus inutiles. Il faut aussi faire confirmer les horaires d’accueil, nettoyer les éléments main imbriqués et mesurer les performances sur l’hébergement définitif. Les secrets sont stockés localement et ne doivent pas être partagés. Aucun vrai mail, paiement ni réservation client n’a été déclenché lors de l’audit.

## Limites et livrables

- Tests navigateur Chromium, pas une campagne exhaustive sur Safari, Firefox ou appareils physiques.
- Pas de simulation de charge, pas de pentest, pas de score Lighthouse certifié.
- Pas de vérification complète du parcours de paiement sur les sites externes.
- Pas d’audit de l’hébergement distant du nouveau site, dont l’URL n’est pas identifiée.
- Résultats détaillés locaux conservés dans `.codex/site-audit.json`, `.codex/service-audit.json`, `.codex/forms-audit.json`, `.codex/production-audit.json` et `.codex/external-links-audit.json`. Ces fichiers de travail ne sont pas destinés au dépôt.
- Aucun code fonctionnel du site n’a été modifié pendant cet audit. Ce rapport n’est pas encore commité.
