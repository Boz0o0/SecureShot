# SecureShot

SecureShot est une application web permettant aux photographes de vendre facilement leurs photos en ligne, avec gestion sécurisée des paiements via PayPal.

---

## ⚙️ Architecture Système

### Frontend

- **React** : Interface utilisateur fluide et réactive.
- **TailwindCSS** : Design moderne et responsive.

### Backend

- **Node.js** avec **Express** : Gestion des requêtes HTTP, des sessions et intégration de l’API PayPal.

### Base de Données

- **Supabase**

### Paiement

- **API PayPal Checkout** : Paiements sécurisés pour les acheteurs.

### Hébergement

- **Vercel** : Déploiement facile et rapide.

---

## 🧩 Fonctionnalités Clés

### Gestion des Sessions

- Génération d’un code unique alphanumérique de 6 caractères pour chaque session de vente.
- Association du code à un ensemble de photos et à un prix défini par le photographe.
- Expiration automatique des sessions après une période définie ou après la vente.

### Rôles Utilisateurs

- **Photographe** :
    - Téléversement de photos.
    - Définition du prix.
    - Génération et partage du code unique.
- **Acheteur** :
    - Saisie du code pour accéder à la session.
    - Paiement via PayPal.
    - Téléchargement des photos après paiement.

### Interface Utilisateur

- **Écran d’Accueil** :
    - Champ de saisie du code.
    - Bouton "Accéder à la session".
- **Vue Photographe** :
    - Interface de téléversement des photos.
    - Champ de définition du prix.
    - Affichage du code généré.
- **Vue Acheteur** :
    - Aperçu des photos (miniatures floutées ou filigranées).
    - Bouton de paiement PayPal.
    - Accès aux photos en haute résolution après paiement.

---

## 🔐 Sécurité

- **Supabase**: Row-Level Security (RLS)

---

## 📱 Disponibilité

- **Web** : Application web responsive.
- **App mobile** : (À étudier selon besoins)

---