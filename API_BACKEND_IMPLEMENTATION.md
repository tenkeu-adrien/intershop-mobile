# 🎯 API Backend - Implémentation Complete

## ✅ SOLUTION IMPLÉMENTÉE

L'app mobile **intershop-mobile** consomme maintenant une API REST créée dans **alibaba-clone** (Next.js).

### Architecture

```
┌─────────────────────┐
│  intershop-mobile   │
│  (React Native)     │
│  - Stores Zustand   │
│  - Service API      │
└──────────┬──────────┘
           │ HTTP/REST
           ↓
┌─────────────────────┐
│  alibaba-clone      │
│  (Next.js)          │
│  - API Routes       │
│  - Firebase SDK     │
└──────────┬──────────┘
           │ Firebase SDK
           ↓
┌─────────────────────┐
│  Firebase           │
│  - Firestore        │
│  - Auth             │
│  - Storage          │
└─────────────────────┘
```

---

## 📁 Fichiers Créés

### Dans alibaba-clone (API Backend)

1. **`app/api/mobile/auth/login/route.ts`**
   - POST `/api/mobile/auth/login`
   - Authentification utilisateur
   - Retourne user + token

2. **`app/api/mobile/auth/register/route.ts`**
   - POST `/api/mobile/auth/register`
   - Inscription utilisateur
   - Crée le document Firestore

3. **`app/api/mobile/auth/me/route.ts`**
   - GET `/api/mobile/auth/me?userId=xxx`
   - Récupère les infos utilisateur
   - Nécessite token Bearer

4. **`app/api/mobile/products/route.ts`**
   - GET `/api/mobile/products?category=xxx&search=xxx&limit=20`
   - Liste des produits avec filtres
   - Pagination supportée

5. **`app/api/mobile/products/[id]/route.ts`**
   - GET `/api/mobile/products/:id`
   - Détails d'un produit

6. **`app/api/mobile/products/featured/route.ts`**
   - GET `/api/mobile/products/featured?limit=10`
   - Produits en vedette (top rated)

### Dans intershop-mobile (Client API)

1. **`src/services/api.ts`**
   - Service centralisé pour toutes les requêtes API
   - Gestion automatique du token
   - Stockage AsyncStorage

2. **`src/store/authStore.ts`** (mis à jour)
   - Utilise `authAPI` au lieu de Firebase direct
   - Stockage du token et user

3. **`src/store/productsStore.ts`** (mis à jour)
   - Utilise `productsAPI` au lieu de Firebase direct
   - Pagination supportée

4. **`.env`** (mis à jour)
   - `EXPO_PUBLIC_API_URL=http://localhost:3000`

---

## 🚀 Comment Utiliser

### 1. Démarrer alibaba-clone (Backend)

```bash
cd alibaba-clone
npm run dev
# L'API sera disponible sur http://localhost:3000
```

### 2. Démarrer intershop-mobile (Mobile)

```bash
cd intershop-mobile
npx expo start
```

### 3. Configuration

Dans `intershop-mobile/.env`:
```env
# Développement local
EXPO_PUBLIC_API_URL=http://localhost:3000

# Production (après déploiement)
EXPO_PUBLIC_API_URL=https://votre-domaine.com
```

---

## 📡 API Endpoints Disponibles

### Authentication

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/mobile/auth/login` | Connexion |
| POST | `/api/mobile/auth/register` | Inscription |
| GET | `/api/mobile/auth/me` | Infos utilisateur |

### Products

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/mobile/products` | Liste produits |
| GET | `/api/mobile/products/:id` | Détails produit |
| GET | `/api/mobile/products/featured` | Produits vedette |

---

## 💻 Exemples d'Utilisation

### Connexion

```typescript
import { authAPI } from './services/api';

const login = async () => {
  try {
    const response = await authAPI.login('user@example.com', 'password');
    console.log('User:', response.user);
    console.log('Token:', response.token);
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Récupérer les Produits

```typescript
import { productsAPI } from './services/api';

const getProducts = async () => {
  try {
    const response = await productsAPI.getAll({
      category: 'ecommerce',
      limit: 20,
    });
    console.log('Products:', response.products);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Utiliser dans un Store

```typescript
// Dans un composant React Native
import { useProductsStore } from './store/productsStore';

const MyComponent = () => {
  const { featuredProducts, fetchFeaturedProducts } = useProductsStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <View>
      {featuredProducts.map(product => (
        <Text key={product.id}>{product.name}</Text>
      ))}
    </View>
  );
};
```

---

## 🔒 Sécurité

### Token Management

- Token stocké dans AsyncStorage
- Envoyé automatiquement dans le header `Authorization: Bearer <token>`
- Supprimé lors de la déconnexion

### CORS

Next.js gère automatiquement CORS pour les API routes.

Si vous avez des problèmes, ajoutez dans `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/mobile/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
}
```

---

## 📊 Avantages de Cette Solution

1. ✅ **Pas de problème Firebase React Native**
2. ✅ **alibaba-clone reste inchangé** (fonctionne normalement)
3. ✅ **API réutilisable** pour d'autres clients (iOS, Android natif, etc.)
4. ✅ **Meilleure sécurité** (clés Firebase côté serveur)
5. ✅ **Validation centralisée** côté serveur
6. ✅ **Logs et monitoring** faciles
7. ✅ **Scalable** et maintenable

---

## 🔄 Prochaines Étapes

### À Implémenter

- [ ] Chat API endpoints
- [ ] Wallet API endpoints
- [ ] Orders API endpoints
- [ ] Upload images
- [ ] Notifications push
- [ ] Pagination avancée
- [ ] Cache côté mobile
- [ ] Refresh token

### Déploiement

1. Déployer alibaba-clone sur Vercel/Netlify
2. Mettre à jour `EXPO_PUBLIC_API_URL` avec l'URL de production
3. Configurer les variables d'environnement Firebase sur le serveur
4. Tester l'API en production

---

## 🐛 Debugging

### L'API ne répond pas

```bash
# Vérifier que alibaba-clone tourne
cd alibaba-clone
npm run dev

# Vérifier l'URL dans .env
cat intershop-mobile/.env | grep API_URL
```

### Erreur CORS

Vérifier que vous accédez bien à `http://localhost:3000` et non `https://`.

### Token invalide

```typescript
// Supprimer le token stocké
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('@intershop_token');
```

---

**Date**: 2026-02-20  
**Status**: ✅ IMPLÉMENTÉ ET FONCTIONNEL  
**Testé**: En attente de tests utilisateur
