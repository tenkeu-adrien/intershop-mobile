# 🔧 Dépannage - InterShop Mobile

## Problèmes résolus

### ✅ 1. Firebase Auth "Component auth has not been registered yet"

**Problème:** Firebase Auth essaie de s'initialiser plusieurs fois.

**Solution:** Utiliser try-catch dans `src/config/firebase.ts`:
```typescript
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}
```

### ✅ 2. Routes manquant d'exports par défaut

**Problème:** Les fichiers dans `app/` doivent exporter un composant React par défaut.

**Solution:** Tous les fichiers de route exportent maintenant leurs composants:
- `app/(tabs)/_layout.tsx` ✅
- `app/(tabs)/index.tsx` ✅
- `app/(tabs)/cart.tsx` ✅
- `app/(tabs)/categories.tsx` ✅
- `app/(tabs)/chat.tsx` ✅
- `app/(tabs)/profile.tsx` ✅
- `app/login.tsx` ✅
- `app/register.tsx` ✅
- `app/dating.tsx` ✅
- `app/deals.tsx` ✅
- `app/wallet.tsx` ✅

### ⚠️ 3. Warning Linking scheme

**Problème:** Expo Router a besoin d'un scheme pour le deep linking.

**Solution:** Ajouter dans `app.json`:
```json
{
  "expo": {
    "scheme": "intershop"
  }
}
```

## Configuration requise

### Variables d'environnement

Créer un fichier `.env` à la racine:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Dépendances installées

```bash
npm install --legacy-peer-deps
```

## Commandes utiles

### Démarrer le projet
```bash
npx expo start --clear
```

### Réinitialiser complètement
```bash
rm -rf node_modules .expo
npm install --legacy-peer-deps
npx expo start --clear
```

### Vérifier les erreurs TypeScript
```bash
npx tsc --noEmit
```

## Problèmes connus

### 1. Warnings TypeScript dans l'éditeur
- **Cause:** Configuration TypeScript stricte
- **Impact:** Aucun, l'app fonctionne
- **Solution:** Ignorer ou configurer `tsconfig.json`

### 2. Warnings de dépendances
- **Cause:** Conflits de versions entre packages
- **Impact:** Aucun avec `--legacy-peer-deps`
- **Solution:** Utiliser toujours `--legacy-peer-deps`

## Support

Si tu rencontres d'autres erreurs:
1. Vérifie que toutes les variables d'environnement sont définies
2. Redémarre le serveur Expo avec `--clear`
3. Vérifie que tu utilises Expo Go SDK 54
4. Consulte les logs dans le terminal
