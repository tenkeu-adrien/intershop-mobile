# Structure du Projet InterShop Mobile

## Vue d'ensemble

Application mobile React Native (Expo) répliquant toutes les fonctionnalités d'alibaba-clone avec une interface mobile optimisée.

## 🎯 Architecture Complète

### Navigation (Bottom Tabs) - 5 Onglets

#### 1. 🏠 **Accueil** (HomeScreen)
- **Header avec gradient** (jaune-vert)
  - Salutation personnalisée
  - Bouton de localisation
  - Barre de recherche
- **Catégories rapides** (scroll horizontal)
  - E-commerce 🛍️
  - Restaurants 🍽️
  - Hôtels 🏨
  - Rencontres 💕
- **Produits en vedette** (grille 2 colonnes)
  - Top 6 produits par rating
  - Image, nom, prix, rating
- **Bannière promotionnelle** avec gradient
- **Pull-to-refresh**

#### 2. 📂 **Catégories** (CategoriesScreen)
- **Barre de recherche** + bouton filtre
- **Chips de catégories** (scroll horizontal)
  - Tous, E-commerce, Restaurants, Hôtels, Rencontres
  - Couleurs distinctes par catégorie
- **Grille de produits** (2 colonnes)
  - Badge de catégorie coloré
  - Image, nom, rating, localisation
  - Prix, MOQ
- **Filtrage dynamique** par catégorie
- **Recherche** de produits

#### 3. 💬 **Messagerie** (ChatScreen)
- **Liste des conversations**
  - Avatar du participant
  - Badge de messages non lus
  - Dernier message
  - Timestamp relatif (date-fns)
  - Badge type de conversation (coloré)
- **Types de conversations**:
  - Commande (bleu)
  - Produit (vert)
  - Rencontre (rose)
  - Hôtel (violet)
  - Restaurant (orange)
  - Général (gris)
  - Support (rouge)
- **Temps réel** avec Firebase listeners
- **Compteur de messages non lus** global

#### 4. 🛒 **Panier** (CartScreen)
- **Liste des articles**
  - Image produit
  - Nom, prix
  - Contrôles de quantité (+/-)
  - Bouton supprimer
- **Résumé de commande**
  - Sous-total
  - Frais de livraison (2000 FCFA)
  - Total
- **Bouton commander** (gradient vert)
  - Affiche le total
  - Vérifie l'authentification
- **État vide** avec CTA
- **Persistance** avec AsyncStorage

#### 5. 👤 **Mon InterShop** (ProfileScreen)
- **Header profil** (gradient jaune-vert)
  - Avatar (photo ou initiale)
  - Nom, email
  - Badge de rôle (Client, Fournisseur, etc.)
  - Bouton "Modifier"
- **Statistiques rapides** (3 cartes)
  - Nombre de commandes
  - Nombre de favoris
  - Solde du portefeuille
- **Menu principal** (7 options)
  - 💰 Mon Portefeuille
  - 🧾 Mes Commandes
  - ⭐ Mes Favoris
  - 🔔 Notifications
  - ⚙️ Paramètres
  - 🛡️ Sécurité
  - ❓ Aide & Support
- **Bouton déconnexion**
- **Version de l'app**
- **État non connecté** avec CTA connexion/inscription

## 🗂️ Structure des fichiers

```
interShop-mobile/
├── src/
│   ├── config/
│   │   └── firebase.ts              # Configuration Firebase
│   │
│   ├── navigation/
│   │   └── TabNavigator.tsx         # Navigation 5 onglets
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx           # ✅ Accueil
│   │   ├── CategoriesScreen.tsx    # ✅ Catégories
│   │   ├── ChatScreen.tsx           # ✅ Messagerie
│   │   ├── CartScreen.tsx           # ✅ Panier
│   │   └── ProfileScreen.tsx        # ✅ Mon InterShop
│   │
│   ├── store/ (Zustand)
│   │   ├── authStore.ts             # ✅ Authentification
│   │   ├── cartStore.ts             # ✅ Panier (AsyncStorage)
│   │   ├── chatStore.ts             # ✅ Chat (temps réel)
│   │   └── productsStore.ts         # ✅ Produits
│   │
│   └── types/
│       └── index.ts                 # ✅ Types TypeScript
│
├── App.tsx                          # ✅ Point d'entrée
├── package.json                     # ✅ Dépendances
├── .env.example                     # ✅ Config Firebase
└── README.md                        # ✅ Documentation

```

## 🎨 Design System

### Palette de couleurs

#### Couleurs principales
- **Jaune**: `#FBBF24` - Headers, accents
- **Vert**: `#10B981` - Boutons CTA, prix, succès
- **Gris foncé**: `#1F2937` - Texte principal
- **Gris moyen**: `#6B7280` - Texte secondaire
- **Gris clair**: `#F9FAFB` - Arrière-plans

#### Couleurs par catégorie
- **E-commerce**: `#3B82F6` (Bleu)
- **Restaurants**: `#F59E0B` (Orange)
- **Hôtels**: `#8B5CF6` (Violet)
- **Rencontres**: `#EC4899` (Rose)

#### Couleurs système
- **Succès**: `#10B981` (Vert)
- **Erreur**: `#EF4444` (Rouge)
- **Avertissement**: `#FBBF24` (Jaune)
- **Info**: `#3B82F6` (Bleu)

### Typographie
- **Titres**: Bold, 20-24px
- **Sous-titres**: SemiBold, 16-18px
- **Corps**: Regular, 14-16px
- **Petits textes**: Regular, 12-13px

### Espacements
- **Padding écrans**: 16-20px
- **Marges cartes**: 8-12px
- **Gaps grilles**: 12px
- **Border radius**: 12px (cartes), 20-24px (boutons)

### Icônes (React Icons - io5)
- **Taille standard**: 20-24px
- **Taille grande**: 32-48px
- **Taille badges**: 14-16px

## 🔥 Firebase

### Collections Firestore

#### users
```typescript
{
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'client' | 'fournisseur' | 'marketiste' | 'admin';
  accountStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### products
```typescript
{
  id: string;
  fournisseurId: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  serviceCategory: 'ecommerce' | 'restaurant' | 'hotel' | 'dating';
  prices: PriceTier[];
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  location?: { latitude, longitude, address, city, country };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### conversations
```typescript
{
  id: string;
  participants: string[];
  participantsData: {
    [userId]: { name, photo, role }
  };
  type: 'order' | 'product_inquiry' | 'dating_inquiry' | 'hotel_inquiry' | 'restaurant_inquiry' | 'general' | 'support';
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  unreadCount: { [userId]: number };
  createdAt: Timestamp;
}
```

#### messages
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

## 📦 Dépendances principales

### Core
- `react-native`: 0.76.5
- `expo`: ~52.0.0
- `typescript`: ^5.3.3

### Navigation
- `@react-navigation/native`: ^6.1.18
- `@react-navigation/bottom-tabs`: ^6.6.1
- `@react-navigation/native-stack`: ^6.11.0
- `react-native-screens`: ~4.2.0
- `react-native-safe-area-context`: 4.12.0

### Firebase
- `firebase`: ^10.13.0

### State Management
- `zustand`: ^4.5.5
- `@react-native-async-storage/async-storage`: 1.23.1

### UI/UX
- `react-icons`: ^5.3.0
- `expo-linear-gradient`: ~14.0.1
- `@expo/vector-icons`: ^14.0.4

### Utilitaires
- `date-fns`: ^3.6.0
- `expo-image-picker`: ~16.0.3
- `expo-location`: ~18.0.4

## 🚀 Commandes

```bash
# Installation
npm install

# Démarrage
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## ✅ Fonctionnalités implémentées

- [x] Navigation par onglets (5 onglets)
- [x] Écran Accueil avec produits vedettes
- [x] Écran Catégories avec filtrage
- [x] Écran Messagerie avec temps réel
- [x] Écran Panier avec persistance
- [x] Écran Profil avec menu complet
- [x] Store d'authentification (Zustand + Firebase)
- [x] Store de panier (Zustand + AsyncStorage)
- [x] Store de chat (Zustand + Firebase listeners)
- [x] Store de produits (Zustand + Firestore)
- [x] Types TypeScript complets
- [x] Configuration Firebase
- [x] Design system cohérent
- [x] Icônes React Icons (io5)
- [x] Gradients avec expo-linear-gradient

## 🚧 À développer

- [ ] Écrans de détail (produit, chat, commande)
- [ ] Écran de checkout
- [ ] Écran de portefeuille
- [ ] Écran de paramètres
- [ ] Notifications push
- [ ] Géolocalisation
- [ ] Upload d'images
- [ ] Paiement mobile money
- [ ] Système de reviews

## 📱 Compatibilité

- ✅ iOS
- ✅ Android
- ✅ Web (Expo)

## 🔐 Sécurité

- Authentification Firebase
- Règles Firestore à configurer
- Variables d'environnement (.env)
- Validation côté client et serveur

---

**Status**: ✅ Structure de base complète  
**Version**: 1.0.0  
**Dernière mise à jour**: 2024