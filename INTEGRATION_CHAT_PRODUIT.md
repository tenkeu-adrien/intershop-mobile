# Intégration Chat depuis Page Produit

## 🎯 Objectif

Permettre aux utilisateurs de contacter directement le vendeur depuis la page de détails d'un produit.

## 📝 Implémentation

### 1. Bouton "Contacter le vendeur" dans la page produit

Le bouton est déjà implémenté dans `app/products/[id].tsx`:

```typescript
<TouchableOpacity
  style={styles.contactSellerButton}
  onPress={handleContactSeller}
>
  <Ionicons name="chatbubble-ellipses" size={20} color="#10B981" />
  <Text style={styles.contactSellerText}>Contacter le vendeur</Text>
</TouchableOpacity>
```

### 2. Handler pour créer/ouvrir la conversation

```typescript
const handleContactSeller = () => {
  if (!product) return;
  
  // Rediriger vers le chat avec les paramètres du produit
  router.push(`/chat?productId=${product.id}&fournisseurId=${product.fournisseurId}`);
};
```

### 3. Créer une page intermédiaire pour gérer la création

**Fichier**: `app/chat/index.tsx` (À CRÉER)

```typescript
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useProductsStore } from '../../src/store/productsStore';
import { getOrCreateConversation } from '../../src/services/chatService';
import { ConversationContext } from '../../src/types/chat';

export default function ChatInitScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProductById } = useProductsStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (params.productId && params.fournisseurId) {
      createProductConversation();
    }
  }, [user, params]);

  const createProductConversation = async () => {
    if (!user || !params.productId || !params.fournisseurId) return;

    try {
      // Charger le produit
      const product = await fetchProductById(params.productId as string);
      if (!product) {
        router.back();
        return;
      }

      // Créer le contexte
      const context: ConversationContext = {
        type: 'product_inquiry',
        productId: product.id,
        metadata: {
          productName: product.name,
        },
      };

      // Créer ou récupérer la conversation
      const conversationId = await getOrCreateConversation(
        user.id,
        params.fournisseurId as string,
        {
          name: user.displayName,
          photo: user.photoURL,
          role: user.role,
        },
        {
          name: 'Vendeur', // À améliorer: charger les infos du fournisseur
          role: 'fournisseur',
        },
        context,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          productPrice: product.prices[0].price,
          productCurrency: 'FCFA',
        }
      );

      // Rediriger vers la conversation
      router.replace(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
```

## 🔄 Flux Complet

```
Page Produit
    ↓
Clic "Contacter le vendeur"
    ↓
/chat?productId=xxx&fournisseurId=yyy
    ↓
Créer/Récupérer conversation
    ↓
/chat/[conversationId]
    ↓
Interface de chat avec contexte produit
```

## 🎨 Interface

### Page Produit
```
┌─────────────────────────────────────┐
│  [Image Produit]                    │
│                                     │
│  Smartphone Samsung Galaxy          │
│  150,000 FCFA                       │
│                                     │
│  [💬 Contacter le vendeur]          │ ← Bouton vert
│                                     │
│  Description...                     │
└─────────────────────────────────────┘
```

### Page Chat avec Contexte
```
┌─────────────────────────────────────┐
│  [← Retour]  [Avatar] Vendeur       │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ 📦 Smartphone Samsung Galaxy  │ │ ← Bannière contexte
│  │ Voir le produit →             │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│                                     │
│  Messages...                        │
│                                     │
├─────────────────────────────────────┤
│  [📷] [📎] [Input] [Envoyer]        │
└─────────────────────────────────────┘
```

## 📦 Fonctionnalités Supplémentaires

### 1. Envoyer le produit dans le premier message

Modifier `app/chat/index.tsx` pour envoyer automatiquement un message avec le produit:

```typescript
// Après avoir créé la conversation
await sendTextMessage(
  conversationId,
  user.id,
  user.displayName,
  user.photoURL,
  params.fournisseurId as string,
  'Bonjour, je suis intéressé par ce produit',
  'product',
  undefined,
  undefined,
  undefined,
  undefined,
  {
    productId: product.id,
    productName: product.name,
    productImage: product.images[0],
    productPrice: product.prices[0].price,
    productCurrency: 'FCFA',
  }
);
```

### 2. Bouton "Demander un devis"

Ajouter un bouton séparé pour demander un devis:

```typescript
<TouchableOpacity
  style={styles.quoteButton}
  onPress={handleRequestQuote}
>
  <Ionicons name="document-text" size={20} color="#FBBF24" />
  <Text style={styles.quoteButtonText}>Demander un devis</Text>
</TouchableOpacity>

const handleRequestQuote = () => {
  if (!product) return;
  router.push(`/chat?productId=${product.id}&fournisseurId=${product.fournisseurId}&action=quote`);
};
```

Puis dans `app/chat/index.tsx`:

```typescript
if (params.action === 'quote') {
  await sendTextMessage(
    conversationId,
    user.id,
    user.displayName,
    user.photoURL,
    params.fournisseurId as string,
    `Pouvez-vous me faire un devis pour ce produit ?`,
    'quote_request',
    undefined,
    undefined,
    undefined,
    undefined,
    {
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
    }
  );
}
```

### 3. Charger les infos du fournisseur

Améliorer en chargeant les vraies infos du fournisseur:

```typescript
// Dans app/chat/index.tsx
import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '../../src/config/firebase';

const loadFournisseurData = async (fournisseurId: string) => {
  const db = getDbInstance();
  const docRef = doc(db, 'users', fournisseurId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      name: data.displayName || data.shopName || 'Vendeur',
      photo: data.photoURL || data.shopLogo,
      role: data.role || 'fournisseur',
    };
  }
  
  return {
    name: 'Vendeur',
    role: 'fournisseur',
  };
};

// Utiliser dans createProductConversation
const fournisseurData = await loadFournisseurData(params.fournisseurId as string);

const conversationId = await getOrCreateConversation(
  user.id,
  params.fournisseurId as string,
  {
    name: user.displayName,
    photo: user.photoURL,
    role: user.role,
  },
  fournisseurData,
  context,
  productReference
);
```

## ✅ Checklist d'Implémentation

- [x] Bouton "Contacter le vendeur" dans page produit
- [x] Handler pour rediriger vers le chat
- [ ] Créer `app/chat/index.tsx` pour gérer la création
- [ ] Charger les infos du fournisseur
- [ ] Envoyer le premier message automatiquement (optionnel)
- [ ] Ajouter bouton "Demander un devis" (optionnel)
- [ ] Tester le flux complet

## 🎯 Résultat Attendu

Quand l'utilisateur clique sur "Contacter le vendeur":
1. ✅ Une conversation est créée (ou récupérée si elle existe)
2. ✅ Le contexte produit est attaché à la conversation
3. ✅ L'utilisateur est redirigé vers l'interface de chat
4. ✅ La bannière du produit est affichée en haut
5. ✅ L'utilisateur peut cliquer sur la bannière pour retourner au produit
6. ✅ Les messages sont envoyés en temps réel
7. ✅ Le vendeur reçoit une notification (à implémenter)

## 📝 Notes

- Le système utilise `getOrCreateConversation()` pour éviter les doublons
- Si une conversation existe déjà entre ces 2 utilisateurs, elle est réutilisée
- Le contexte produit est mis à jour à chaque fois
- Les messages sont stockés dans une collection séparée `messages`
- Les conversations sont stockées dans la collection `conversations`

**Status**: ✅ Prêt à implémenter
