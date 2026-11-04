# Contacter l’administrateur

Le bouton du pied de page ouvre un formulaire accessible avec dialogue natif (clavier, Échap, retour du focus), adapté aux petits écrans. Le navigateur transmet uniquement le type, le message, l’e-mail facultatif, le chemin de page sans paramètres ni fragment et les champs de protection.

Un accès flottant doré est affiché sur les pages jusqu’au 4 décembre 2026 inclus (heure de Paris), au-dessus des actions mobiles. Sa disparition est automatique, y compris sur une page restée ouverte ; le bouton permanent du pied de page est conservé. La date se règle dans `src/data/feedback-promotion.ts`.

## Configuration serveur

Dans **Vercel → projet website-golfmarcilly → Settings → Environment Variables**, définir `ADMIN_FEEDBACK_EMAIL_TO` avec la boîte destinataire indiquée par le propriétaire, pour **Production**, puis redéployer. Définir séparément la valeur de test pour Preview si nécessaire. Ne pas préfixer par `NEXT_PUBLIC_`.

Le service d’envoi existant est réutilisé :

- `EMAIL_FROM` : adresse d’expéditeur vérifiée dans Brevo (Senders/Domains), ou autorisée par le fournisseur SMTP ; `EMAIL_FROM_NAME` facultatif.
- Brevo : `MAIL_PROVIDER=brevo`, `BREVO_API_KEY` avec droit d’envoi transactionnel.
- SMTP : `MAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` selon le fournisseur (TLS requis).
- La protection partagée existante en production nécessite `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et la fonction `consume_public_rate_limit` déjà utilisée par les formulaires du site. Aucune nouvelle migration n’est nécessaire.
- `NEXT_PUBLIC_SITE_URL` doit correspondre au domaine public ; les domaines supplémentaires autorisés se règlent dans `FORM_ALLOWED_ORIGINS`.

Pour localhost, renseigner ces variables dans `.env.local`, puis redémarrer. Sans destinataire, fournisseur ou protection partagée opérationnels, aucune réussite n’est annoncée. Les clés et la destination ne sont ni renvoyées ni journalisées par cette route.

## Protections et comportement

Validation serveur : types autorisés, 1 à 4 000 caractères, e-mail facultatif de 254 caractères maximum, page interne de 512 caractères maximum, corps JSON limité à 20 000 octets. Aucun fichier n’est accepté. Contrôle d’origine, champ piège et délai de deux secondes ; cinq tentatives par IP sur dix minutes, quarante sur une heure pour l’ensemble du site. Une empreinte du contenu bloque les doublons pendant dix minutes. Les compteurs sont partagés via Supabase en production ; si ce service échoue, l’envoi est refusé.

L’expéditeur est toujours `EMAIL_FROM`. L’e-mail visiteur devient uniquement le Reply-To. Le courriel contient le type, le texte, l’e-mail facultatif, l’URL de page et la date UTC. Le succès est renvoyé après résolution de l’envoi par le fournisseur ; il ne garantit pas le classement dans la boîte de réception. Il n’y a aucune mise en file de secours annonçant un succès différé. Une erreur conserve le formulaire et libère la demande pour une nouvelle tentative ; une incertitude réseau après acceptation par le fournisseur ne permet pas de garantir un envoi exactement une fois.

Après configuration, effectuer un envoi réel depuis le formulaire et vérifier la réception, l’expéditeur vérifié et le Reply-To. Les tests automatisés emploient des transports de test et ne prouvent pas la livraison dans une boîte réelle.

Retour arrière : retirer `ADMIN_FEEDBACK_EMAIL_TO` pour suspendre les envois (réponse 503), ou revenir au déploiement précédent. Aucun changement de données du site n’est requis.
