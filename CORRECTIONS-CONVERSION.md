# Lot 2 — Offres, formulaires et demandes restaurant

## Google Maps

L'iframe commune à l'accueil et au contact utilise `https://www.google.com/maps?q=Golf%20de%20Marcilly&z=13&output=embed`.
La directive CSP `frame-src` autorisait uniquement `'self'` et `https://calendar.google.com`.
La correction ajoute uniquement `https://www.google.com/maps` à cette directive. Aucune autorisation globale de domaines Google, de scripts ou de connexions n'a été ajoutée. `frame-ancestors 'none'` et `X-Frame-Options: DENY` sont conservés : ils protègent l'intégration de notre site dans un autre site et ne bloquent pas notre iframe Maps.

Cette intégration ne demande pas de clé API. Elle dépend de l'accès du navigateur à Google Maps. Une politique CSP ajoutée par l'hébergeur doit également autoriser ce chemin : plusieurs politiques se cumulent de manière restrictive.

## Offres

La modale expose `actionLabel` et `actionHref` de l'offre sélectionnée. Un seul lien d'action est présent, pour éviter les liens invisibles au clavier. La modale est rendue dans le corps de la page et défile sur petit écran. La hauteur du texte suit son contenu ; les boutons ne le recouvrent pas. Les liens externes conservent le comportement du composant CTA existant.

## Contact

Le bouton est désactivé pendant l'envoi et un verrou synchrone empêche deux soumissions simultanées, même avant le prochain rendu React. Les réponses API brutes ne sont jamais affichées. Les erreurs publiques sont en français et les champs sont conservés en cas d'échec. Une réponse HTTP réussie sans `{ ok: true }` ne suffit pas pour annoncer un succès.

Le verrou couvre le formulaire ouvert, pas des requêtes provenant de plusieurs onglets ou des reprises après une perte réseau. Une réception incertaine invite à appeler le golf avant de renouveler la demande. La file de secours email préexistante reste locale : sa persistance et son exploitation dépendent de l'hébergement.

## Restaurant

Le bouton « Réserver une table » ouvre le composant dédié préexistant, désormais raccordé à la page. Il recueille date, horaire souhaité, nombre de personnes, nom, email, téléphone facultatif et message. Le formulaire général reste disponible pour les groupes et privatisations, et sur la page Contact.

Il s'agit d'une **demande par email, pas d'une réservation confirmée ni d'une disponibilité en temps réel**. Les dates suivent Europe/Paris, y compris pour les visiteurs et serveurs situés dans un autre fuseau. Le périmètre existant est conservé : les sept prochains jours, horaires de 12h00 à 14h30 toutes les trente minutes, préavis de trente minutes et groupes de 1 à 30 personnes. Les jours d'ouverture et exceptions doivent être vérifiés par l'équipe lors de la confirmation ; aucun agenda de tables n'est connecté.

L'API envoie d'abord la demande au restaurant, puis un accusé de réception au client. Si le premier envoi échoue, aucun succès n'est annoncé. Si seul l'accusé échoue, la demande reste signalée comme transmise, avec un avertissement explicite et sans invitation à la renvoyer. L'ancien en-tête `X-Idempotency-Key`, ignoré par le serveur et contenant les coordonnées, a été retiré.

## Configuration externe encore requise

Pour le contact : `EMAIL_TO` et un fournisseur d'envoi fonctionnel.

Pour le restaurant : `RESTAURANT_RESERVATION_EMAIL_TO=golf@marcilly.com`. En l'absence de cette variable, le destinataire reste `golf@marcilly.com`, indépendamment du contact général. Les noms de destinataires sont facultatifs : `RESTAURANT_RESERVATION_EMAIL_TO_NAME`, `EMAIL_TO_NAME`.

Choisir le fournisseur avec `MAIL_PROVIDER` et configurer :

- SMTP : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` ; `SMTP_SECURE` selon le serveur.
- Ou Brevo : `BREVO_API_KEY`, `EMAIL_FROM` ; `EMAIL_FROM_NAME` facultatif. L'expéditeur doit être autorisé chez le fournisseur.
- `NEXT_PUBLIC_SITE_URL` doit correspondre à l'origine publique effectivement utilisée, car les routes contrôlent l'origine des formulaires. Les autres domaines réellement utilisés doivent être déclarés dans `FORM_ALLOWED_ORIGINS` (origines complètes séparées par des virgules, sans joker). Le contrôle compare protocole, domaine et port. Seul le mode développement autorise aussi l'origine locale de la requête (`localhost`, `127.0.0.1`, `::1`).

### Demande restaurant : activation de l'envoi

Le message après acceptation de l'email par le fournisseur est : « Votre demande a bien été envoyée. Nous revenons vers vous rapidement pour confirmer votre réservation. » Il ne confirme pas la table ni la remise finale en boîte de réception. Un échec d'envoi reste une erreur ; l'échec du seul accusé client ne déclenche pas de nouvel envoi au restaurant.

Le texte de refus observé dans la capture correspond au statut 403 du contrôle d'origine. La configuration locale pointe vers `https://millionnaire-chi-ochre.vercel.app`, ce qui refusait une page ouverte sur localhost. La correction locale ne désactive pas la protection en production. Pour un autre domaine de production, renseigner son origine exacte comme indiqué ci-dessus.

Les identifiants SMTP et la clé Brevo sont toujours vides dans l'environnement local inspecté. Renseigner les secrets directement dans l'environnement de l'hébergeur (et dans `.env.local` pour un développement autorisé), jamais dans Git ni dans une conversation. Avec SMTP, renseigner hôte, port, utilisateur, mot de passe et expéditeur autorisé ; avec Brevo, sélectionner `MAIL_PROVIDER=brevo`, renseigner la clé et l'expéditeur autorisé. Redémarrer ou redéployer après configuration. Aucun email réel n'est envoyé pendant les tests automatisés.

Inspection locale sans affichage des secrets : `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` et `BREVO_API_KEY` sont absents ou vides. Les adresses d'expéditeur/destinataires et `SMTP_PORT` sont présents, mais leur validité n'a pas été vérifiée. **L'envoi réel d'emails n'est donc pas validé.** Les intégrations initiation, paiement et calendrier restent hors de ce lot.

## Vérifications

- Tests unitaires : validation des dates et du nombre de personnes, limite de préavis, changement d'heure à Paris, erreurs françaises, échec d'envoi principal et échec de l'accusé client. Les tests d'envoi utilisent exclusivement des fonctions factices sans accès réseau.
- Essais navigateur : Maps, liens de chaque offre, parcours restaurant, double soumission, erreur serveur, erreur réseau et reprise du formulaire. Les POST vers les API sont interceptés et ne parviennent jamais au serveur. Les scénarios de succès contrôlés vérifient seulement le comportement de l'interface.
- Contrôles du projet : `pnpm.cmd lint`, `pnpm.cmd typecheck`, `pnpm.cmd test`, `pnpm.cmd build`.

Aucun email, paiement ou réservation réelle n'est déclenché pendant ces vérifications. Une recette d'envoi réelle reste nécessaire dans un environnement explicitement prévu à cet effet après configuration.
