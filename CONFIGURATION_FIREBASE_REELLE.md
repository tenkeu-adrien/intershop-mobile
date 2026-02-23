# Configuration Firebase Réelle

## Étapes pour Connecter à Votre Firebase

### 1. Copier les Clés Firebase d'Alibaba-Clone

Ouvrez `alibaba-clone/.env.local` et copiez toutes les valeurs Firebase.

### 2. Mettre à Jour intershop-mobile/.env

Remplacez le contenu de `intershop-mobile/.env` par vos vraies clés:

```env
# Copiez ces valeurs depuis alibaba-clone/.env.local
EXPO_PUBLIC_FIREBASE_API_KEY=votre_vraie_clé
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 3. Redémarrer l'App

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer avec cache vidé
npm start -c
```

### 4. Vérifier la Connexion

Une fois l'app redémarrée:
- Les produits de votre Firestore s'afficheront automatiquement
- Les produits de démo ne s'afficheront que si aucun produit n'existe dans Firebase
- Vous pourrez vous connecter avec vos comptes existants

## Produits de Démonstration

Les produits de démo sont un **fallback** qui s'active seulement si:
1. Firebase n'est pas configuré OU
2. Aucun produit n'existe dans votre Firestore

Dès que vous ajoutez vos vraies clés Firebase, l'app utilisera automatiquement vos vraies données.

## Dashboards

Les 3 dashboards sont implémentés:
- ✅ Dashboard Admin
- ✅ Dashboard Fournisseur  
- ✅ Dashboard Marketiste

Ils se connecteront automatiquement à votre Firestore une fois les clés configurées.

## Corrections à Appliquer

Les dashboards utilisent encore `react-icons/io5` - je vais les corriger maintenant.
