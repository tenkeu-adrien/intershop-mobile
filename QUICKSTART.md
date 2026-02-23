# 🚀 Guide de Démarrage Rapide - InterShop Mobile

## Installation en 5 minutes

### 1. Prérequis ✅

Assurez-vous d'avoir installé:
- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 2. Installation 📦

```bash
# Naviguer dans le dossier
cd interShop-mobile

# Installer les dépendances
npm install
```

### 3. Configuration Firebase 🔥

#### A. Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer **Authentication** (Email/Password)
4. Créer une base de données **Firestore**
5. Activer **Storage**

#### B. Obtenir les clés
1. Dans Firebase Console → Paramètres du projet → Applications
2. Ajouter une application Web
3. Copier les clés de configuration

#### C. Configurer l'app
```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Éditer `.env` avec vos clés:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Lancer l'application 🎉

```bash
# Démarrer Expo
npm start
```

Vous verrez un QR code dans le terminal.

#### Sur téléphone:
1. Ouvrir **Expo Go**
2. Scanner le QR code
3. L'app se charge automatiquement!

#### Sur émulateur:
```bash
# Android
npm run android

# iOS (Mac uniquement)
npm run ios
```

#### Sur navigateur:
```bash
npm run web
```

## 🎯 Premiers pas

### Créer un compte
1. Ouvrir l'app
2. Aller sur l'onglet **Mon InterShop**
3. Cliquer sur **Créer un compte**
4. Remplir le formulaire
5. Se connecter

### Explorer l'app
- **Accueil**: Voir les produits en vedette
- **Catégories**: Filtrer par type (E-commerce, Restaurants, etc.)
- **Panier**: Ajouter des produits (depuis les détails produit)
- **Messagerie**: Contacter les vendeurs
- **Mon InterShop**: Gérer votre profil

## 🔧 Commandes utiles

```bash
# Démarrer l'app
npm start

# Nettoyer le cache
npm start -- --clear

# Voir les logs
npm start -- --dev-client

# Build pour production
expo build:android
expo build:ios
```

## 📱 Tester sur appareil physique

### Android
1. Activer le **mode développeur**
2. Activer le **débogage USB**
3. Connecter le téléphone
4. `npm run android`

### iOS (Mac uniquement)
1. Connecter l'iPhone
2. Faire confiance à l'ordinateur
3. `npm run ios`

## 🐛 Résolution de problèmes

### Erreur: "Unable to resolve module"
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
npm start -- --clear
```

### Erreur Firebase
- Vérifier que les clés dans `.env` sont correctes
- Vérifier que Authentication est activé dans Firebase
- Vérifier que Firestore est créé

### App ne se charge pas
```bash
# Redémarrer Expo
npm start -- --clear

# Vérifier que le téléphone et l'ordinateur sont sur le même réseau WiFi
```

### Erreur "Network request failed"
- Vérifier la connexion internet
- Vérifier les règles Firestore
- Vérifier que Firebase est bien configuré

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Zustand](https://zustand-demo.pmnd.rs/)
- [Documentation React Navigation](https://reactnavigation.org/)

## 🎨 Personnalisation

### Changer les couleurs
Éditer les couleurs dans les fichiers de screens:
- Jaune: `#FBBF24`
- Vert: `#10B981`
- Bleu: `#3B82F6`

### Ajouter des fonctionnalités
1. Créer un nouveau screen dans `src/screens/`
2. Ajouter la route dans `TabNavigator.tsx`
3. Créer un store si nécessaire dans `src/store/`

## ✅ Checklist de démarrage

- [ ] Node.js installé
- [ ] Dépendances installées (`npm install`)
- [ ] Projet Firebase créé
- [ ] Fichier `.env` configuré
- [ ] Authentication activé dans Firebase
- [ ] Firestore créé
- [ ] App lancée (`npm start`)
- [ ] QR code scanné avec Expo Go
- [ ] Compte créé dans l'app
- [ ] Navigation testée (5 onglets)

## 🚀 Prochaines étapes

1. **Ajouter des produits** dans Firestore
2. **Tester le panier** et les commandes
3. **Configurer le chat** en temps réel
4. **Personnaliser le design**
5. **Ajouter des fonctionnalités**

## 💡 Conseils

- Utilisez **Expo Go** pour le développement rapide
- Testez sur **appareil réel** pour les performances
- Utilisez **React DevTools** pour le débogage
- Consultez les **logs** en cas d'erreur
- Rejoignez la **communauté Expo** pour de l'aide

## 📞 Support

En cas de problème:
1. Vérifier les logs dans le terminal
2. Vérifier la console Expo
3. Consulter la documentation
4. Demander de l'aide à l'équipe

---

**Bon développement! 🎉**
