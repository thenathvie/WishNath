# WishNath

> Tout ce qui me ferait plaisir, au même endroit

Liste de Noël **privée** : chaque personne se connecte avec son identifiant et ne voit que les cadeaux que tu lui as attribués. Elle peut en réserver un, anonymement. Toi seul vois les prix et qui a réservé quoi.

**Stack** : Vite + JavaScript (modules ES, sans framework) · Firebase Authentication · Firestore · Firebase Hosting.

---

## 1. Mise en route (≈ 15 min)

Prérequis : Node 18+ et un compte Google. Le projet Firebase `wishnath-20ba4` est déjà référencé dans `.firebaserc` et `src/firebaseConfig.js`.

```bash
npm install
npx firebase login
```

### a. Activer l'authentification
Console Firebase → **Authentication** → *Sign-in method* → activer **E-mail/Mot de passe**.

### b. Créer la base Firestore
Console Firebase → **Firestore Database** → *Créer une base* → mode **production**, région `eur3` (Europe) ou `europe-west9` (Paris).

### c. Déployer les règles de sécurité
```bash
npm run deploy:rules
```

### d. Créer ton compte administrateur (une seule fois)
Le premier admin se crée à la main, le reste se fait depuis l'application.

1. Console → **Authentication** → *Users* → **Ajouter un utilisateur** : ton adresse e-mail réelle + un mot de passe solide (une vraie adresse te permet de réinitialiser ton mot de passe).
2. Copie l'**UID** de l'utilisateur créé.
3. Console → **Firestore** → *Démarrer une collection* `users` → **ID du document = ton UID**, avec les champs :

| champ | type | valeur |
|---|---|---|
| `uid` | string | ton UID |
| `name` | string | `Nathan` |
| `username` | string | ton e-mail |
| `email` | string | ton e-mail |
| `role` | string | `admin` |
| `active` | boolean | `true` |

### e. Déployer le site
```bash
npm run deploy      # build + hosting + règles
```
Le site est publié sur `https://wishnath-20ba4.web.app`.

### f. Remplir la liste
Connecte-toi → **Personnes** → *Nouvelle personne* (un compte par proche) → **Cadeaux** → *Importer* et colle le contenu de `seed/liste-noel.txt` (ta liste actuelle, typos corrigées), en cochant les personnes concernées. Complète ensuite chaque cadeau (prix, lien, description…).

---

## 2. Utilisation

### Côté proches
- Connexion avec l'identifiant et le mot de passe donnés par toi.
- Ils voient uniquement leurs cadeaux : titre, description, lien d'achat, image, priorité, statut. **Jamais le prix.**
- **Je le réserve** : le cadeau passe à « Réservé » pour tous les autres, sans nom. Le réservant peut **annuler** ou noter **« Je l'ai acheté »**.
- Deux personnes ne peuvent pas réserver le même cadeau en même temps : l'écriture est atomique et refusée par les règles Firestore.

### Côté admin (rôle `admin`)
- **Tableau de bord** : répartition par statut, budget (liste / déjà pris / reste), activité par personne, dernières réservations, alertes (cadeaux visibles par personne, prioritaires encore libres).
- **Cadeaux** : ajouter, modifier, supprimer, choisir qui le voit, prix, statut, qui l'a réservé, libérer une réservation, import en masse. Le filtre « Vu par… » montre exactement ce que voit une personne.
- **Personnes** : créer un compte (le mot de passe est généré, à copier une fois), modifier, désactiver/réactiver, attribuer des cadeaux d'un coup depuis la fiche de la personne.

---

## 3. Modèle de données Firestore

```
users/{uid}
  uid, name, username, email, role: 'admin' | 'user', active: boolean, createdAt

gifts/{giftId}                     ← lisible par les destinataires (visibleTo) + admin
  title, description, purchaseLink, image,
  priority: 'low' | 'medium' | 'high' | null,
  status: 'available' | 'reserved' | 'purchased',
  visibleTo: [uid, …], createdAt, updatedAt

giftsPrivate/{giftId}              ← admin uniquement
  price: number | null, updatedAt

reservations/{giftId}              ← admin + la personne qui a réservé
  uid, reservedAt
```

**Pourquoi `price` et `reservedBy` ne sont pas dans `gifts` ?** Firestore sécurise au niveau du *document* : on ne peut pas cacher un champ à un lecteur qui a le droit de lire le reste. Pour garantir que le prix et l'identité du réservant ne fuient jamais (même en ouvrant les outils développeur), ils vivent dans des collections séparées. Les trois documents partagent le même identifiant, et l'écran admin les recolle.

### Règles de sécurité (`firestore.rules`)
- Aucun droit sans profil `users/{uid}` **actif** : créer un compte Auth « sauvage » ne donne accès à rien.
- `users` : lecture de son propre profil ; tout le reste réservé à l'admin (impossible de se promouvoir).
- `gifts` : lecture si l'UID est dans `visibleTo`. Un proche ne peut modifier **que `status`**, et uniquement : réserver (`available → reserved` en créant sa réservation), annuler, ou marquer acheté / remettre en réservé **sur sa propre réservation**.
- `giftsPrivate` : admin uniquement.
- `reservations` : lecture par l'auteur ou l'admin ; création uniquement en même temps que le passage du cadeau à `reserved`.
- Tout le reste est refusé.

Tests des règles : `npm run test:rules` (émulateur Firestore, Java requis).

---

## 4. Architecture

```
src/
  main.js                 session + routage par hash (#/, #/admin…)
  config.js               nom du propriétaire, domaine des identifiants, libellés
  firebase.js             init Firebase (+ émulateurs en mode dev:emulators)
  firebaseConfig.js       configuration du projet (publique)
  services/
    auth.js               connexion, session + profil, changement de mot de passe
    gifts.js              côté proche : lecture, réserver / annuler
    adminStore.js         écoutes temps réel partagées de l'espace admin
    adminActions.js       écritures admin : cadeaux, comptes, import
  pages/
    login.js              connexion, compte bloqué, écran de chargement
    wishlist.js           liste d'un proche
    admin/                dashboard.js · gifts.js · users.js
  ui/                     giftTag (l'étiquette), shell (barre), feedback (modales, toasts)
  styles/                 base.css (tokens, formulaires) · tag.css · admin.css
firestore.rules · firestore.indexes.json · firebase.json · tests/rules.test.mjs
```

Choix techniques : pas de framework (le site est petit, le bundle reste léger), DOM construit avec des noeuds texte (aucune injection HTML possible depuis les données), pas d'index composite (tri côté client), polices auto-hébergées (aucun appel à Google Fonts), pas d'Analytics (site privé).

---

## 5. Comment fonctionnent les identifiants

Firebase Auth exige une adresse e-mail. Un identifiant simple (`maman`) est converti en `maman@wishnath.local` (réglable dans `src/config.js`). Tu peux aussi créer un compte avec une vraie adresse : elle sera utilisée telle quelle.

## 6. Limites connues (et pistes)

- **Mot de passe oublié** : sans Cloud Functions (plan payant), l'admin ne peut pas imposer un nouveau mot de passe à un compte. Solutions : le bouton « Envoyer un e-mail de nouveau mot de passe » (comptes avec vraie adresse), ou supprimer le compte dans *Authentication* et le recréer. Chacun peut changer son mot de passe via **son prénom › Mon compte**.
- **Images** : saisies par URL. Firebase Storage exige désormais le plan Blaze ; l'upload pourra s'ajouter si tu passes dessus.
- **`visibleTo`** contient des UID (opaques, sans nom) : un proche qui ouvre les outils développeur peut voir *combien* d'autres comptes ont accès à un cadeau, pas qui.
- **Évolutions faciles** : groupes de personnes (famille, amis), cadeaux à plusieurs (participations), commentaires privés, Firebase App Check, Cloud Function pour gérer les mots de passe.

## 7. Développement local

```bash
npm run dev                           # contre le vrai projet Firebase
npm run emulators                     # (terminal 1) émulateurs Auth + Firestore
npm run dev:emulators                 # (terminal 2) site branché sur les émulateurs
```
Avec les émulateurs, crée l'admin dans l'interface sur http://localhost:4000 (Auth puis document `users/{uid}`), comme à l'étape d.
