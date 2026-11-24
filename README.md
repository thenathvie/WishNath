WishNath — mise en ligne sans Node.js

Tout le site tient dans un seul fichier : index.html. Pas d'installation, pas de compilation. Il suffit de le mettre sur GitHub Pages et de configurer Firebase depuis son interface web.

Fichiers fournis :

index.html : le site complet (à publier)
firestore.rules : les règles de sécurité (à copier dans la console Firebase)
liste-noel.txt : ta liste actuelle, prête à être importée
Étape 1 — Configurer Firebase (console web, ≈ 10 min)

Ouvre https://console.firebase.google.com › projet wishnath-20ba4.

1. Activer la connexion par mot de passe

Authentication › Sign-in method › E-mail/Mot de passe › Activer › Enregistrer.

2. Créer la base de données

Firestore Database › Créer une base de données › mode production › région eur3 (Europe) ou europe-west9 (Paris).

3. Coller les règles de sécurité (étape cruciale)

Firestore Database › onglet Règles › supprime tout le contenu › colle tout le contenu de firestore.rules › Publier.

Si tu avais déjà collé une ancienne version des règles, remplace-la par celle-ci. Sans cette étape, personne ne peut rien lire (règles par défaut) ; avec de mauvaises règles, les cadeaux ne seraient pas protégés. Ce sont elles qui garantissent que chacun ne voit que ses cadeaux, que le réservant reste anonyme, et que ton compte « surprise » ne puisse jamais lire les réservations. Le prix est affiché sur chaque cadeau, pour toi et pour les personnes qui le voient.

4. Créer ton compte administrateur (une seule fois)
Authentication › Users › Ajouter un utilisateur : ton adresse e-mail réelle + un mot de passe solide.
Copie l'UID affiché dans la liste.
Firestore Database › Données › Démarrer une collection › ID de collection : users › ID du document = ton UID (colle-le), puis ajoute ces champs :
Champ	Type	Valeur
uid	string	ton UID
name	string	Nathan
username	string	ton e-mail
email	string	ton e-mail
role	string	admin
active	boolean	true
5. Ton compte « surprise » (pour ne rien spoiler)

Le compte administrateur voit qui a réservé quoi. Pour ajouter des cadeaux sans spoiler ton Noël, crée-toi un second compte au rôle Gestionnaire (mode surprise) :

Connecte-toi une première fois avec le compte administrateur.
Personnes › Nouvelle personne › rôle Gestionnaire (mode surprise) (ex. identifiant nathan-surprise) › copie les accès.
Déconnecte-toi, puis utilise ce compte au quotidien. Garde le compte administrateur de côté pour après Noël.

Avec le compte surprise tu peux : ajouter, modifier, supprimer des cadeaux, choisir qui les voit, voir les prix, créer et désactiver les comptes des proches. Tu ne vois ni statuts, ni réservations, ni qui a réservé : ni dans les listes, ni dans le tableau de bord, et les règles Firestore lui interdisent aussi de lire les réservations. Il ne peut pas modifier le compte administrateur ni se donner plus de droits.

Étape 2 — Publier sur GitHub Pages
Crée un dépôt GitHub (ex. wishnath) et envoie-y index.html à la racine. Le fichier doit s'appeler exactement index.html.
Dépôt › Settings › Pages › Source : Deploy from a branch › branche main, dossier / (root) › Save.
Après une minute, le site est en ligne sur https://TON-PSEUDO.github.io/wishnath/.
Firebase Console › Authentication › Settings › Authorized domains › Ajouter TON-PSEUDO.github.io (nécessaire pour les e-mails de réinitialisation de mot de passe).

Le dépôt peut être public : index.html ne contient que la configuration Firebase, publique par conception. Les cadeaux, prix et comptes sont dans Firestore, protégés par les règles.

Étape 3 — Remplir la liste
Ouvre le site, connecte-toi avec ton compte admin.
Personnes › Nouvelle personne : un compte par proche (identifiant simple comme maman, mot de passe généré). Copie les accès avec le bouton prévu pour les leur envoyer : le mot de passe n'est plus consultable ensuite.
Cadeaux › Importer : colle le contenu de liste-noel.txt et coche les personnes qui peuvent les voir. Format d'une ligne : Titre | prix | lien (prix et lien facultatifs).
Ouvre chaque cadeau pour ajouter le prix, le lien, la description, la priorité, une image.
Test de 5 minutes avant d'envoyer le lien à tout le monde
Crée deux comptes de test et attribue-leur des cadeaux différents.
Connecte-toi avec le compte A (fenêtre privée) : il ne doit voir que ses cadeaux, avec leur prix.
Réserve un cadeau commun avec A, puis connecte-toi avec B : le cadeau est « Déjà réservé », sans nom, et B ne peut pas le réserver.
Avec le compte administrateur, vérifie que tu vois bien « par A ». Avec le compte surprise, vérifie que tu ne vois aucun statut ni nom de réservant.
Désactive B : il ne doit plus pouvoir accéder à rien.
Réglages dans index.html

En haut du fichier, le bloc window.WISHNATH contient : ton prénom (ownerName), le domaine technique des identifiants (usernameDomain) et la configuration Firebase. Le reste du fichier est le code de l'application : modifie-le seulement si tu sais ce que tu fais.

Limites à connaître
Connexion internet obligatoire : le SDK Firebase est chargé depuis le CDN de Google.
Mot de passe oublié : sans serveur, tu ne peux pas imposer un nouveau mot de passe à quelqu'un. Pour un compte avec une vraie adresse, le bouton « Envoyer un e-mail de nouveau mot de passe » existe dans la fiche de la personne. Sinon : supprime le compte dans Authentication et recrée-le. Chacun peut changer son mot de passe via son prénom › Mon compte.
Mode surprise : le masquage est garanti pour les réservations (qui a réservé). Le simple statut d'un cadeau (« réservé ») est caché par l'interface ; un développeur qui fouillerait les outils du navigateur pourrait le lire. Pour toi, c'est suffisant pour garder la surprise.
Images : saisies par URL (Firebase Storage demande désormais un plan payant).
Les règles Firestore et le site ont été vérifiés en lecture et avec un navigateur de test, mais pas contre ton vrai projet Firebase : fais le test de 5 minutes ci-dessus.
