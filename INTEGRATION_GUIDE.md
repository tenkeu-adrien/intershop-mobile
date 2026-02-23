# 🚀 Guide d'intégration - Nouvelles fonctionnalités

## Installation des dépendances

```bash
npm install expo-location @react-native-async-storage/async-storage
```

## Configuration Firebase

Ajoutez ces règles Firestore dans `firestore.rules`:

```javascript
// Wallets
match /wallets/{walletId} {
  allow read, write: if request.auth.uid == walletId;
}

// Transactions
match /transactions/{transactionId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
}

// Dating Profiles
match /datingProfiles/{profileId} {
  allow read: if resource.data.isActive == true;
  allow write: if request.auth.uid == resource.data.fournisseurId;
}

// Licenses (read-only for all)
match /licenses/{licenseId} {
  allow read: if true;
}
```

## Utilisation des nouveaux stores

### WalletStore
```typescript
import { useWalletStore } from '../store/walletStore';

const MyComponent = () => {
  const { wallet, fetchWallet, initiateDeposit } = useWalletStore();
  
  useEffect(() => {
    fetchWallet(userId);
  }, [userId]);
  
  const handleDeposit = async () => {
    await initiateDeposit(userId, 10000, 'mtn', '+237670000000');
  };
};
```

### GeolocationStore
```typescript
import { useGeolocationStore } from '../store/geolocationStore';

const MyComponent = () => {
  const { requestLocation, calculateDistance } = useGeolocationStore();
  
  const getLocation = async () => {
    await requestLocation();
  };
  
  const distance = calculateDistance(lat, lng);
};
```

### CurrencyStore
```typescript
import { useCurrencyStore } from '../store/currencyStore';

const MyComponent = () => {
  const { convertPrice, formatPrice, setCurrency } = useCurrencyStore();
  
  const priceInXAF = convertPrice(100); // 100 USD → 60000 XAF
  const formatted = formatPrice(60000); // "60 000 FCFA"
};
```

## Navigation

Ajoutez les nouveaux écrans dans votre navigateur:

```typescript
<Stack.Screen name="Wallet" component={WalletScreen} />
<Stack.Screen name="Dating" component={DatingScreen} />
<Stack.Screen name="Deals" component={DealsScreen} />
```

## Prochaines étapes

1. Tester les nouveaux écrans
2. Configurer les permissions dans app.json
3. Ajouter les écrans de détail
4. Implémenter les notifications push
