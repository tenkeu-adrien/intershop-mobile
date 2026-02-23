# 🔧 Correction React Icons → Expo Vector Icons

## ❌ Problème
`react-icons` n'est pas compatible avec React Native. Erreur :
```
View config getter callback for component `rect` must be a function
```

## ✅ Solution
Remplacer tous les imports `react-icons` par `@expo/vector-icons/Ionicons`

---

## 📝 Mapping des Icônes

### Wallet / Finance
- `IoWalletOutline` → `wallet-outline`
- `IoAddCircleOutline` → `add-circle-outline`
- `IoRemoveCircleOutline` → `remove-circle-outline`
- `IoSwapHorizontalOutline` → `swap-horizontal-outline`
- `IoTimeOutline` → `time-outline`

### Navigation / Actions
- `IoSearchOutline` → `search-outline`
- `IoFilterOutline` → `filter-outline`
- `IoArrowBack` → `arrow-back`
- `IoCheckmarkCircle` → `checkmark-circle`
- `IoCloseCircleOutline` → `close-circle-outline`

### Social / Dating
- `IoHeartOutline` → `heart-outline`
- `IoLocationOutline` → `location-outline`
- `IoStar` → `star`
- `IoStarOutline` → `star-outline`

### E-commerce
- `IoCartOutline` → `cart-outline`
- `IoTagOutline` → `pricetag-outline`
- `IoTrendingDownOutline` → `trending-down-outline`

### Communication
- `IoMail` → `mail`
- `IoCall` → `call`
- `IoNotifications` → `notifications`

### Hotels / Restaurants
- `IoRestaurantOutline` → `restaurant-outline`
- `IoBedOutline` → `bed-outline`
- `IoWifiOutline` → `wifi-outline`
- `IoCarOutline` → `car-outline`

### Dashboard
- `IoHourglassOutline` → `hourglass-outline`
- `IoLogOut` → `log-out`

### Product
- `IoAddOutline` → `add-outline`
- `IoRemoveOutline` → `remove-outline`
- `IoTrash` → `trash`
- `IoAdd` → `add`
- `IoRemove` → `remove`

---

## 🔄 Remplacement Automatique

### Étape 1 : Import
**Avant** :
```typescript
import { IoWalletOutline, IoAddCircleOutline } from 'react-icons/io5';
```

**Après** :
```typescript
import { Ionicons } from '@expo/vector-icons';
```

### Étape 2 : Utilisation
**Avant** :
```tsx
<IoWalletOutline size={32} color="#FBBF24" />
```

**Après** :
```tsx
<Ionicons name="wallet-outline" size={32} color="#FBBF24" />
```

---

## 📁 Fichiers à Corriger

1. ✅ `src/screens/WalletScreen.tsx` - CORRIGÉ
2. ✅ `src/screens/DatingScreen.tsx` - CORRIGÉ
3. ✅ `src/screens/DealsScreen.tsx` - CORRIGÉ
4. ⏳ `src/screens/EmailVerificationScreen.tsx`
5. ⏳ `src/screens/ForgotPasswordScreen.tsx`
6. ⏳ `src/screens/ClientDashboardScreen.tsx`
7. ⏳ `src/screens/HotelsScreen.tsx`
8. ⏳ `src/screens/HomeScreen.tsx`
9. ⏳ `src/screens/PendingApprovalScreen.tsx`
10. ⏳ `src/screens/CategoriesScreen.tsx`
11. ⏳ `src/screens/PhoneVerificationScreen.tsx`
12. ⏳ `src/screens/ProductsScreen.tsx`
13. ⏳ `src/screens/CartScreen.tsx`
14. ⏳ `src/screens/ProductDetailScreen.tsx`
15. ⏳ `src/screens/ProfileScreen.tsx`
16. ⏳ `src/screens/RestaurantsScreen.tsx`

---

## 🚀 Test Rapide

Après correction, tester :
```bash
cd intershop-mobile
npm start

# Aller dans l'app
# Cliquer sur Profil → Mon Portefeuille
# Vérifier que les icônes s'affichent
```

---

**Note** : Les fichiers dans `src/screens/` ne sont plus utilisés car l'app utilise Expo Router avec les fichiers dans `app/`. Seuls les fichiers dans `app/` sont actifs.
