# InterShop Mobile

Application mobile React Native (Expo) pour la plateforme InterShop.

## Fonctionnalités

- 🏠 **Accueil**: Produits, restaurants, hôtels, profils de rencontre
- 📂 **Catégories**: Navigation par catégories de produits et services
- 💬 **Messagerie**: Chat en temps réel avec vendeurs et utilisateurs
- 🛒 **Panier**: Gestion du panier d'achats
- 👤 **Mon InterShop**: Profil, portefeuille, commandes, paramètres

## Technologies

- **React Native** avec Expo
- **Firebase** (Firestore, Auth, Storage)
- **Zustand** pour la gestion d'état
- **React Navigation** pour la navigation
- **TypeScript** pour le typage

## Installation

\`\`\`bash
npm install
\`\`\`

## Démarrage

\`\`\`bash
# Démarrer le serveur de développement
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
\`\`\`

## Configuration Firebase

Créez un fichier `.env` à la racine avec vos credentials Firebase:

\`\`\`
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## Structure du projet

\`\`\`
intershop-mobile/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── screens/         # Écrans de l'application
│   ├── navigation/      # Configuration de navigation
│   ├── store/           # Stores Zustand
│   ├── lib/             # Utilitaires et services
│   │   ├── firebase/    # Services Firebase
│   │   └── utils/       # Fonctions utilitaires
│   ├── types/           # Types TypeScript
│   └── constants/       # Constantes
├── assets/              # Images et ressources
└── App.tsx              # Point d'entrée
\`\`\`
