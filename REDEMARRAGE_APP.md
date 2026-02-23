# Guide de Redémarrage - intershop-mobile

## 🚀 Comment Redémarrer l'App

---

## ⚠️ IMPORTANT

Les corrections Firebase ont été appliquées. Vous devez redémarrer l'app pour que les changements prennent effet.

---

## 📋 Étapes de Redémarrage

### 1. Arrêter l'App Actuelle

Dans le terminal où l'app tourne:
```bash
# Appuyer sur Ctrl+C pour arrêter
```

### 2. Nettoyer le Cache (Recommandé)

```bash
cd intershop-mobile
npm start -- --clear
```

**OU** si vous êtes déjà dans le dossier:
```bash
npm start -- --clear
```

### 3. Démarrage Normal (Alternative)

Si vous ne voulez pas nettoyer le cache:
```bash
cd intershop-mobile
npm start
```

---

## ✅ Vérifications au Démarrage

### Logs Attendus (Succès)

Vous devriez voir:
```
✅ Firebase App initialized
✅ Firebase Auth initialized with SecureStore
✅ Firestore initialized
✅ Firebase Storage initialized
✅ Firebase initialized successfully
```

### Logs à NE PAS Voir (Erreurs Corrigées)

Ces erreurs ne devraient PLUS apparaître:
```
❌ WARN  @firebase/auth: Auth without AsyncStorage
❌ ERROR Firebase initialization error
❌ ERROR Error fetching featured products
❌ ERROR Error initializing auth listener
```

---

## 🧪 Tests Rapides

### Test 1: Page d'Accueil
1. L'app démarre
2. Onglet "Accueil" s'affiche
3. ✅ Produits se chargent (ou message "produits de démonstration")

### Test 2: Page Produit
1. Cliquer sur un produit
2. Page produit s'affiche
3. ✅ Boutons "Discuter avec le vendeur" et "Demander un devis" visibles

### Test 3: Chat (Si Connecté)
1. Cliquer "Discuter avec le vendeur"
2. ✅ Conversation créée
3. ✅ Redirection vers chat

---

## 🐛 Si Problèmes Persistent

### Option 1: Rebuild Complet

```bash
cd intershop-mobile
rm -rf node_modules
npm install --legacy-peer-deps
npm start -- --clear
```

### Option 2: Vérifier .env

Ouvrir `intershop-mobile/.env` et vérifier:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDPFVSTkhfnewg18vtD6jK9qXf_5XvPfmg
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=interappshop.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=interappshop
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=interappshop.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=745680512693
EXPO_PUBLIC_FIREBASE_APP_ID=1:745680512693:web:e9939e06d8cae5820800fc
```

### Option 3: Vérifier Firebase Console

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner projet: `interappshop`
3. Vérifier:
   - ✅ Authentication activé
   - ✅ Firestore créé
   - ✅ Storage configuré

---

## 📱 Tester sur Device

### iOS (avec Expo Go)
1. Installer Expo Go depuis App Store
2. Scanner le QR code avec l'app Camera
3. L'app s'ouvre dans Expo Go

### Android (avec Expo Go)
1. Installer Expo Go depuis Play Store
2. Scanner le QR code avec Expo Go
3. L'app s'ouvre

---

## 📚 Documentation

### Si Erreurs Firebase
📄 Consulter: `FIREBASE_ASYNCSTORAGE_FIX.md`

### Si Problèmes Chat
📄 Consulter: `GUIDE_TEST_CHAT_PRODUIT.md`

### Comparaison avec alibaba-clone
📄 Consulter: `COMPARAISON_VISUELLE_PRODUIT.md`

### Résumé Complet
📄 Consulter: `TRAVAIL_ACCOMPLI_FINAL.md`

---

## ✅ Checklist de Validation

Après redémarrage, vérifier:

- [ ] App démarre sans erreurs
- [ ] Logs Firebase propres
- [ ] Page d'accueil s'affiche
- [ ] Produits se chargent
- [ ] Page produit fonctionne
- [ ] Boutons chat visibles
- [ ] Pas d'erreurs console

---

## 🎯 Résumé des Corrections

### Ce Qui a Été Corrigé
1. ✅ AsyncStorage installé
2. ✅ Firebase Auth avec persistance
3. ✅ Firestore avec long polling
4. ✅ .env corrigé
5. ✅ Gestion erreurs robuste

### Ce Qui Devrait Fonctionner
1. ✅ Auth persistante (reste connecté)
2. ✅ Chargement produits
3. ✅ Chat avec vendeur
4. ✅ Demande de devis
5. ✅ Toutes les fonctionnalités produit

---

## 🚀 Commande Rapide

**Pour redémarrer rapidement**:
```bash
cd intershop-mobile && npm start -- --clear
```

---

## 📞 Support

### Logs à Partager (Si Problème)
```bash
# Copier les logs du terminal
# Chercher les lignes avec "ERROR" ou "WARN"
# Consulter la documentation appropriée
```

### Fichiers à Vérifier
1. `src/config/firebase.ts` - Configuration Firebase
2. `.env` - Variables d'environnement
3. `package.json` - Dépendances

---

## 🎉 Prêt!

Une fois l'app redémarrée avec succès:
- ✅ Firebase fonctionnel
- ✅ Chat intégré
- ✅ Toutes les fonctionnalités disponibles

**Bon test!** 🚀

---

**Date**: 2026-02-20
**Version**: 1.0.0
