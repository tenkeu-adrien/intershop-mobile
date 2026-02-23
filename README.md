# InterShop Mobile 📱

Application mobile React Native (Expo) pour la plateforme InterShop - Clone d'Alibaba pour l'Afrique.

## 🚀 Fonctionnalités

### Navigation par onglets (5 onglets)
1. **🏠 Accueil** - Produits en vedette, catégories rapides, recherche
2. **📂 Catégories** - E-commerce, Restaurants, Hôtels, Rencontres
3. **💬 Messagerie** - Chat en temps réel avec vendeurs
4. **🛒 Panier** - Gestion du panier d'achats
5. **👤 Mon InterShop** - Profil, portefeuille, commandes, paramètres

### Technologies utilisées
- **React Native** avec Expo
- **Firebase** (Auth, Firestore, Storage)
- **Zustand** pour la gestion d'état
- **React Navigation** pour la navigation
- **React Icons** (io5) pour les icônes
- **Expo Linear Gradient** pour les dégradés
- **Date-fns** pour les dates

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- Compte Firebase

### Étapes

1. **Cloner le projet**
```bash
cd interShop-mobile
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Firebase**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos clés Firebase
```

4. **Lancer l'application**
```bash
# Démarrer Expo
npm start

# Ou directement sur Android
npm run android

# Ou directement sur iOS
npm run ios

# Ou sur le web
npm run web
```

## 🏗️ Structure du projet

```
interShop-mobile/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Configuration Firebase
│   ├── navigation/
│   │   └── TabNavigator.tsx     # Navigation par onglets
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Écran d'accueil
│   │   ├── CategoriesScreen.tsx # Écran des catégories
│   │   ├── ChatScreen.tsx       # Écran de messagerie
│   │   ├── CartScreen.tsx       # Écran du panier
│   │   └── ProfileScreen.tsx    # Écran de profil
│   ├── store/
│   │   ├── authStore.ts         # Store d'authentification
│   │   ├── cartStore.ts         # Store du panier
│   │   ├── chatStore.ts         # Store de chat
│   │   └── productsStore.ts     # Store des produits
│   └── types/
│       └── index.ts             # Types TypeScript
├── App.tsx                      # Point d'entrée
├── package.json
└── .env.example
```

## 🎨 Design

### Couleurs principales
- **Jaune**: `#FBBF24` - Header, accents
- **Vert**: `#10B981` - Boutons principaux, prix
- **Bleu**: `#3B82F6` - E-commerce
- **Orange**: `#F59E0B` - Restaurants
- **Violet**: `#8B5CF6` - Hôtels
- **Rose**: `#EC4899` - Rencontres

### Icônes
Utilisation de **React Icons (io5)** pour toutes les icônes:
- `IoHome` - Accueil
- `IoGrid` - Catégories
- `IoChatbubbles` - Messagerie
- `IoCart` - Panier
- `IoPerson` - Profil

## 🔥 Firebase

### Collections Firestore
- `users` - Utilisateurs
- `products` - Produits (tous types)
- `conversations` - Conversations de chat
- `messages` - Messages
- `orders` - Commandes
- `wallets` - Portefeuilles
- `transactions` - Transactions

### Règles de sécurité
Assurez-vous de configurer les règles Firestore appropriées pour sécuriser vos données.

## 📱 Fonctionnalités détaillées

### Accueil
- Barre de recherche avec gradient
- Catégories rapides (4 types)
- Produits en vedette (top 6)
- Bannière promotionnelle
- Pull-to-refresh

### Catégories
- Filtrage par catégorie
- Recherche de produits
- Grille de produits (2 colonnes)
- Badges de catégorie colorés
- Informations produit (prix, rating, MOQ)

### Messagerie
- Liste des conversations
- Badges de messages non lus
- Types de conversation colorés
- Avatars des participants
- Timestamps relatifs

### Panier
- Liste des articles
- Contrôles de quantité (+/-)
- Suppression d'articles
- Résumé de commande
- Frais de livraison
- Bouton commander avec gradient

### Mon InterShop
- Profil utilisateur avec avatar
- Statistiques (commandes, favoris, solde)
- Menu avec icônes colorées:
  - Portefeuille
  - Commandes
  - Favoris
  - Notifications
  - Paramètres
  - Sécurité
  - Aide & Support
- Bouton de déconnexion

## 🔐 Authentification

L'application utilise Firebase Authentication avec:
- Inscription par email/mot de passe
- Connexion
- Déconnexion
- Gestion de session automatique

## 💾 Gestion d'état (Zustand)

### Stores disponibles
- **authStore**: Authentification et utilisateur
- **cartStore**: Panier (persisté avec AsyncStorage)
- **chatStore**: Conversations et messages (temps réel)
- **productsStore**: Produits et recherche

## 🚧 À développer

- [ ] Écrans de détail produit
- [ ] Écran de chat détaillé
- [ ] Écran de checkout
- [ ] Écran de portefeuille
- [ ] Écran de commandes
- [ ] Écran de paramètres
- [ ] Notifications push
- [ ] Géolocalisation
- [ ] Paiement mobile money
- [ ] Système de rating/reviews

## 📄 Licence

Ce projet est un clone éducatif d'Alibaba adapté pour le marché africain.

## 👨‍💻 Développement

Pour contribuer au projet:
1. Créer une branche feature
2. Faire vos modifications
3. Tester sur iOS et Android
4. Soumettre une pull request

## 🐛 Bugs connus

Aucun pour le moment.

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2024
