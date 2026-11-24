# WishNath — mise en ligne sans Node.js

Tout le site tient dans **un seul fichier : `index.html`**. Pas d'installation, pas de compilation. Il suffit de le mettre sur GitHub Pages et de configurer Firebase depuis son interface web.

Fichiers fournis :
- `index.html` : le site complet (à publier)
- `firestore.rules` : les règles de sécurité (à copier dans la console Firebase)
- `liste-noel.txt` : ta liste actuelle, prête à être importée

---

## Étape 1 — Configurer Firebase (console web, ≈ 10 min)

Ouvre https://console.firebase.google.com › projet **wishnath-20ba4**.

### 1. Activer la connexion par mot de passe
**Authentication** › *Sign-in method* › **E-mail/Mot de passe** › Activer › Enregistrer.

### 2. Créer la base de données
**Firestore Database** › *Créer une base de données* › mode **production** › région `eur3` (Europe) ou `europe-west9` (Paris).

### 3. Coller les règles de sécurité (étape cruciale)
**Firestore Database** › onglet **Règles** › supprime tout le contenu › colle **tout** le contenu de `firestore.rules` › **Publier**.

Sans cette étape, personne ne peut rien lire (règles par défaut) ; avec de mauvaises règles, les cadeaux ne seraient pas protégés. Ce sont elles qui garantissent que chacun ne voit que ses cadeaux, que le prix reste caché et que le réservant reste anonyme.

### 4. Créer ton compte administrateur (une seule fois)
1. **Authentication** › *Users* › **Ajouter un utilisateur** : ton adresse e-mail réelle + un mot de passe solide.
2. Copie l'**UID** affiché dans la liste.
3. **Firestore Database** › *Données* › *Démarrer une collection* › ID de collection : `users` › **ID du document = ton UID** (colle-le), puis ajoute ces champs :

| Champ | Type | Valeur |
|---|---|---|
| `uid` | string | ton UID |
| `name` | string | `Nathan` |
| `username` | string | ton e-mail |
| `email` | string | ton e-mail |
| `role` | string | `admin` |
| `active` | boolean | `true` |

---

## Étape 2 — Publier sur GitHub Pages

1. Crée un dépôt GitHub (ex. `wishnath`) et envoie-y `index.html` **à la racine**. Le fichier doit s'appeler exactement `index.html`.
2. Dépôt › **Settings** › **Pages** › *Source* : **Deploy from a branch** › branche `main`, dossier `/ (root)` › Save.
3. Après une minute, le site est en ligne sur `https://TON-PSEUDO.github.io/wishnath/`.
4. Firebase Console › **Authentication** › *Settings* › **Authorized domains** › Ajouter `TON-PSEUDO.github.io` (nécessaire pour les e-mails de réinitialisation de mot de passe).

> Le dépôt peut être public : `index.html` ne contient que la configuration Firebase, publique par conception. Les cadeaux, prix et comptes sont dans Firestore, protégés par les règles.

---

## Étape 3 — Remplir la liste

1. Ouvre le site, connecte-toi avec ton compte admin.
2. **Personnes** › *Nouvelle personne* : un compte par proche (identifiant simple comme `maman`, mot de passe généré). Copie les accès avec le bouton prévu pour les leur envoyer : le mot de passe n'est plus consultable ensuite.
3. **Cadeaux** › *Importer* : colle le contenu de `liste-noel.txt` et coche les personnes qui peuvent les voir. Format d'une ligne : `Titre | prix | lien` (prix et lien facultatifs).
4. Ouvre chaque cadeau pour ajouter le prix, le lien, la description, la priorité, une image.

## Test de 5 minutes avant d'envoyer le lien à tout le monde

1. Crée deux comptes de test et attribue-leur des cadeaux différents.
2. Connecte-toi avec le compte A (fenêtre privée) : il ne doit voir que ses cadeaux, **sans prix**.
3. Réserve un cadeau commun avec A, puis connecte-toi avec B : le cadeau est « Déjà réservé », sans nom, et B ne peut pas le réserver.
4. Dans l'admin, vérifie que tu vois bien le prix et « par A ».
5. Désactive B : il ne doit plus pouvoir accéder à rien.

---

## Réglages dans `index.html`

En haut du fichier, le bloc `window.WISHNATH` contient : ton prénom (`ownerName`), le domaine technique des identifiants (`usernameDomain`) et la configuration Firebase. Le reste du fichier est le code de l'application : modifie-le seulement si tu sais ce que tu fais.

## Limites à connaître

- **Connexion internet obligatoire** : le SDK Firebase est chargé depuis le CDN de Google.
- **Mot de passe oublié** : sans serveur, tu ne peux pas imposer un nouveau mot de passe à quelqu'un. Pour un compte avec une vraie adresse, le bouton « Envoyer un e-mail de nouveau mot de passe » existe dans la fiche de la personne. Sinon : supprime le compte dans *Authentication* et recrée-le. Chacun peut changer son mot de passe via **son prénom › Mon compte**.
- **Images** : saisies par URL (Firebase Storage demande désormais un plan payant).
- Les règles Firestore et le site ont été vérifiés en lecture et avec un navigateur de test, mais **pas contre ton vrai projet Firebase** : fais le test de 5 minutes ci-dessus.
