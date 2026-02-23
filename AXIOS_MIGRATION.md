# Migration vers Axios

## ✅ Changements Effectués

Le service API a été migré de `fetch` vers `axios` pour une meilleure gestion des requêtes HTTP.

### Avantages d'Axios

1. **Intercepteurs** - Gestion automatique du token d'authentification
2. **Gestion d'erreurs améliorée** - Messages d'erreur plus clairs
3. **Timeout configuré** - 30 secondes par défaut
4. **Transformation automatique** - JSON automatiquement parsé
5. **Annulation de requêtes** - Support natif (si besoin futur)
6. **Meilleure compatibilité** - Fonctionne mieux avec React Native

### Installation

```bash
npm install axios --legacy-peer-deps
```

### Changements dans le Code

#### Avant (fetch)
```typescript
const response = await fetch(`${API_URL}${endpoint}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error);
}
```

#### Après (axios)
```typescript
const response = await axiosInstance.post(endpoint, data);
const result = response.data;
// Token ajouté automatiquement via intercepteur
// Erreurs gérées automatiquement
```

### Configuration Axios

```typescript
// Instance axios avec configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Erreur serveur
      const errorData: any = error.response.data;
      throw new Error(errorData?.error || 'Erreur serveur');
    } else if (error.request) {
      // Pas de réponse
      throw new Error('Impossible de contacter le serveur');
    } else {
      // Erreur de configuration
      throw new Error(error.message);
    }
  }
);
```

### Exemples d'Utilisation

#### GET Request
```typescript
// Avant
const response = await fetch(`${API_URL}/api/mobile/products?limit=10`);
const data = await response.json();

// Après
const response = await axiosInstance.get('/api/mobile/products', {
  params: { limit: 10 }
});
const data = response.data;
```

#### POST Request
```typescript
// Avant
const response = await fetch(`${API_URL}/api/mobile/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Après
const response = await axiosInstance.post('/api/mobile/auth/login', {
  email,
  password
});
```

#### PUT Request
```typescript
// Avant
const response = await fetch(`${API_URL}/api/mobile/chat/messages`, {
  method: 'PUT',
  body: JSON.stringify({ conversationId, userId })
});

// Après
const response = await axiosInstance.put('/api/mobile/chat/messages', {
  conversationId,
  userId
});
```

### Gestion des Erreurs

Axios gère automatiquement les erreurs et les transforme en exceptions JavaScript:

```typescript
try {
  const response = await api.auth.login(email, password);
  // Succès
} catch (error: any) {
  // error.message contient le message d'erreur
  console.error(error.message);
  Alert.alert('Erreur', error.message);
}
```

### Messages d'Erreur

Les erreurs sont maintenant plus claires:

- **Erreur serveur** - Message du serveur (ex: "Email ou mot de passe incorrect")
- **Pas de connexion** - "Impossible de contacter le serveur. Vérifiez votre connexion."
- **Timeout** - "Impossible de contacter le serveur. Vérifiez votre connexion."

### API Inchangée

L'interface publique de l'API reste identique:

```typescript
import api from '@/services/api';

// Toujours la même utilisation
await api.auth.login(email, password);
await api.products.getAll();
await api.wallet.getBalance(userId);
await api.chat.getConversations(userId);
```

### Configuration

Le fichier `.env` reste le même:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.187:3000
```

### Avantages pour le Développement

1. **Debugging plus facile** - Logs plus clairs dans la console
2. **Moins de code boilerplate** - Pas besoin de gérer manuellement les headers
3. **Meilleure performance** - Axios est optimisé pour React Native
4. **Support TypeScript** - Types intégrés pour une meilleure autocomplétion

### Compatibilité

✅ Compatible avec toutes les versions d'Expo
✅ Compatible avec React Native
✅ Fonctionne sur iOS et Android
✅ Support du web (Expo Web)

### Notes

- Le timeout est configuré à 30 secondes (peut être ajusté si nécessaire)
- Les intercepteurs s'exécutent automatiquement pour chaque requête
- Le token est ajouté automatiquement si disponible
- Les erreurs sont transformées en exceptions JavaScript standard

### Prochaines Améliorations Possibles

1. **Retry automatique** - Réessayer les requêtes échouées
2. **Cache** - Mettre en cache certaines réponses
3. **Annulation** - Annuler les requêtes en cours lors de la navigation
4. **Upload progress** - Suivre la progression des uploads de fichiers
5. **Offline mode** - Queue de requêtes pour mode hors ligne

## Conclusion

La migration vers axios améliore la robustesse et la maintenabilité du code API, tout en gardant la même interface pour les développeurs.
