# Guide de Test - API avec Axios

## 🚀 Démarrage

### 1. Démarrer le Backend (alibaba-clone)
```bash
cd alibaba-clone
npm run dev
```
✅ Le serveur doit démarrer sur `http://localhost:3000`

### 2. Vérifier l'URL dans .env
```bash
cd intershop-mobile
cat .env
```
Doit contenir:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.187:3000
```
⚠️ Remplacer par votre IP locale si différente

### 3. Démarrer l'App Mobile
```bash
npm start
```

## 🧪 Tests à Effectuer

### Test 1: Authentication ✅

#### Login
```typescript
import api from '@/services/api';

try {
  const response = await api.auth.login(
    'test@example.com',
    'password123'
  );
  console.log('✅ Login réussi:', response.user);
} catch (error: any) {
  console.error('❌ Erreur login:', error.message);
}
```

**Résultat attendu:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "client"
  }
}
```

#### Register
```typescript
try {
  const response = await api.auth.register(
    'newuser@example.com',
    'password123',
    'New User',
    'client'
  );
  console.log('✅ Inscription réussie:', response.user);
} catch (error: any) {
  console.error('❌ Erreur inscription:', error.message);
}
```

### Test 2: Products ✅

#### Liste des produits
```typescript
try {
  const response = await api.products.getAll({
    limit: 10,
    category: 'electronics'
  });
  console.log('✅ Produits chargés:', response.products.length);
} catch (error: any) {
  console.error('❌ Erreur produits:', error.message);
}
```

#### Détails d'un produit
```typescript
try {
  const response = await api.products.getById('product_id');
  console.log('✅ Produit:', response.product.name);
} catch (error: any) {
  console.error('❌ Erreur produit:', error.message);
}
```

#### Produits en vedette
```typescript
try {
  const response = await api.products.getFeatured(5);
  console.log('✅ Produits vedette:', response.products.length);
} catch (error: any) {
  console.error('❌ Erreur vedette:', error.message);
}
```

### Test 3: Wallet ✅

#### Récupérer le solde
```typescript
try {
  const response = await api.wallet.getBalance('user_id');
  console.log('✅ Solde:', response.wallet.balance, 'XAF');
} catch (error: any) {
  console.error('❌ Erreur solde:', error.message);
}
```

#### Définir le PIN
```typescript
try {
  const response = await api.wallet.setPin('user_id', '1234');
  console.log('✅ PIN défini');
} catch (error: any) {
  console.error('❌ Erreur PIN:', error.message);
}
```

#### Initier un dépôt
```typescript
try {
  const response = await api.wallet.deposit(
    'user_id',
    10000,
    'orange',
    '+237690000000',
    '1234'
  );
  console.log('✅ Dépôt initié:', response.transaction.reference);
} catch (error: any) {
  console.error('❌ Erreur dépôt:', error.message);
}
```

#### Historique des transactions
```typescript
try {
  const response = await api.wallet.getTransactions('user_id');
  console.log('✅ Transactions:', response.transactions.length);
} catch (error: any) {
  console.error('❌ Erreur transactions:', error.message);
}
```

### Test 4: Chat ✅

#### Liste des conversations
```typescript
try {
  const response = await api.chat.getConversations('user_id');
  console.log('✅ Conversations:', response.conversations.length);
} catch (error: any) {
  console.error('❌ Erreur conversations:', error.message);
}
```

#### Créer une conversation
```typescript
try {
  const response = await api.chat.createConversation(
    'user1_id',
    'user2_id',
    { name: 'User 1', role: 'client' },
    { name: 'User 2', role: 'fournisseur' }
  );
  console.log('✅ Conversation créée:', response.conversationId);
} catch (error: any) {
  console.error('❌ Erreur création:', error.message);
}
```

#### Envoyer un message
```typescript
try {
  const response = await api.chat.sendMessage({
    conversationId: 'conversation_id',
    senderId: 'user_id',
    senderName: 'John Doe',
    receiverId: 'user2_id',
    content: 'Bonjour!',
    type: 'text'
  });
  console.log('✅ Message envoyé:', response.messageId);
} catch (error: any) {
  console.error('❌ Erreur message:', error.message);
}
```

### Test 5: Payment Methods ✅

```typescript
try {
  const response = await api.paymentMethods.getActive();
  console.log('✅ Méthodes de paiement:', response.paymentMethods.length);
} catch (error: any) {
  console.error('❌ Erreur méthodes:', error.message);
}
```

### Test 6: Verification ✅

#### Envoyer code email
```typescript
try {
  const response = await api.verification.sendEmailCode(
    'user_id',
    'user@example.com',
    'John Doe'
  );
  console.log('✅ Code envoyé');
} catch (error: any) {
  console.error('❌ Erreur envoi:', error.message);
}
```

#### Vérifier code email
```typescript
try {
  const response = await api.verification.verifyEmailCode(
    'user_id',
    '123456'
  );
  console.log('✅ Code vérifié:', response.verified);
} catch (error: any) {
  console.error('❌ Erreur vérification:', error.message);
}
```

## 🔍 Tests d'Erreurs

### Test 1: Sans Connexion Internet
1. Désactiver le WiFi/données
2. Essayer une requête
3. **Résultat attendu:** "Impossible de contacter le serveur. Vérifiez votre connexion."

### Test 2: Serveur Éteint
1. Arrêter le serveur Next.js
2. Essayer une requête
3. **Résultat attendu:** "Impossible de contacter le serveur. Vérifiez votre connexion."

### Test 3: Mauvais Credentials
```typescript
try {
  await api.auth.login('wrong@email.com', 'wrongpass');
} catch (error: any) {
  console.log('✅ Erreur attendue:', error.message);
  // Devrait afficher: "Email ou mot de passe incorrect"
}
```

### Test 4: Token Expiré
1. Modifier manuellement le token dans AsyncStorage
2. Essayer une requête authentifiée
3. **Résultat attendu:** Erreur d'authentification

### Test 5: Timeout
1. Ajouter un délai artificiel dans l'API
2. Attendre 30 secondes
3. **Résultat attendu:** Timeout après 30s

## 📊 Vérifications

### Console Logs
Vérifier que les logs axios apparaissent:
```
✅ Request: GET /api/mobile/products
✅ Response: 200 OK
❌ Error: Impossible de contacter le serveur
```

### Network Tab (Chrome DevTools)
1. Ouvrir Chrome DevTools
2. Onglet Network
3. Vérifier les requêtes HTTP
4. Vérifier les headers (Authorization)

### AsyncStorage
Vérifier que le token est bien stocké:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('@intershop_token');
console.log('Token:', token);
```

## ✅ Checklist de Test

- [ ] Login fonctionne
- [ ] Register fonctionne
- [ ] Token est stocké
- [ ] Token est ajouté aux requêtes
- [ ] Liste des produits charge
- [ ] Détails produit charge
- [ ] Solde wallet s'affiche
- [ ] Dépôt peut être initié
- [ ] Conversations chargent
- [ ] Messages peuvent être envoyés
- [ ] Méthodes de paiement chargent
- [ ] Code email peut être envoyé
- [ ] Erreurs sont bien gérées
- [ ] Messages d'erreur sont clairs
- [ ] Timeout fonctionne (30s)
- [ ] Pas de connexion gère bien

## 🐛 Debugging

### Problème: "Network Error"
**Solution:** Vérifier l'URL dans `.env` et que le serveur est démarré

### Problème: "Timeout"
**Solution:** Augmenter le timeout dans `api.ts`:
```typescript
const axiosInstance = axios.create({
  timeout: 60000, // 60 secondes
});
```

### Problème: "Token not found"
**Solution:** Se reconnecter pour obtenir un nouveau token

### Problème: "CORS Error"
**Solution:** Vérifier la configuration CORS dans Next.js

## 📝 Notes

- Les intercepteurs axios s'exécutent automatiquement
- Le token est ajouté à chaque requête si disponible
- Les erreurs sont transformées en exceptions JavaScript
- Le timeout par défaut est de 30 secondes
- Les logs sont automatiques en mode développement

## 🎉 Succès

Si tous les tests passent, l'API avec axios fonctionne correctement! 🚀
