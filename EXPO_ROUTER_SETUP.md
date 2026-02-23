# ✅ Configuration Expo Router - InterShop Mobile

## Structure du projet

```
intershop-mobile/
├── app/                          # Routes Expo Router
│   ├── _layout.tsx              # Layout racine
│   ├── (tabs)/                  # Groupe de tabs
│   │   ├── _layout.tsx         # Layout des tabs
│   │   ├── index.tsx           # Accueil (/)
│   │   ├── categories.tsx      # Catégories
│   │   ├── chat.tsx            # Messagerie
│   │   ├── cart.tsx            # Panier
│   │   └── profile.tsx         # Profil
│   ├── login.tsx               # Connexion
│   ├── register.tsx            # Inscription
│   ├── dating.tsx              # Rencontres
│   ├── deals.tsx               # Offres
│   └── wallet.tsx              # Portefeuille
└── src/                         # Code source
    ├── screens/                 # Écrans réutilisables
    ├── store/                   # Stores Zustand
    ├── config/                  # Configuration
    └── types/                   # Types TypeScript
```

## Configuration

### package.json
```json
{
  "main": "expo-router/entry",
  "dependencies": {
    "expo-router": "~6.0.23"
  }
}
```

### Firebase avec AsyncStorage
Le fichier `src/config/firebase.ts` est configuré pour utiliser AsyncStorage:
```typescript
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

## Navigation

### Utiliser useRouter
```typescript
import { useRouter } from 'expo-router';

const MyComponent = () => {
  const router = useRouter();
  
  // Navigation simple
  router.push('/dating');
  
  // Navigation avec paramètres
  router.push(`/products/${productId}`);
  
  // Retour
  router.back();
};
```

### Routes disponibles
- `/` - Accueil
- `/categories` - Catégories
- `/chat` - Messagerie
- `/cart` - Panier
- `/profile` - Profil
- `/login` - Connexion
- `/register` - Inscription
- `/dating` - Rencontres
- `/deals` - Offres
- `/wallet` - Portefeuille

## Lancer le projet

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Lancer le serveur
npx expo start

# Scanner le QR code avec Expo Go (SDK 54)
```

## Avantages d'Expo Router

1. **File-based routing** - Les routes sont basées sur la structure des fichiers
2. **Type-safe** - Navigation typée avec TypeScript
3. **Deep linking** - Support natif des liens profonds
4. **Layouts partagés** - Réutilisation facile des layouts
5. **Code splitting** - Chargement optimisé des écrans

## Prochaines étapes

1. Créer les écrans de détail manquants
2. Ajouter les routes dynamiques ([id])
3. Implémenter les modals
4. Configurer les deep links
