# Test de Connexion API

## Problème Actuel

```
ERROR: Network Error
Impossible de contacter le serveur. Vérifiez votre connexion.
```

## Solutions à Tester

### 1. Vérifier l'URL dans .env

✅ **CORRIGÉ** - Enlevé le slash final
```env
# AVANT (INCORRECT)
EXPO_PUBLIC_API_URL=http://192.168.1.187:3000/

# APRÈS (CORRECT)
EXPO_PUBLIC_API_URL=http://192.168.1.187:3000
```

### 2. Redémarrer l'App Mobile

⚠️ **IMPORTANT:** Après avoir modifié `.env`, vous DEVEZ redémarrer l'app:

```bash
# Arrêter l'app (Ctrl+C)
# Puis redémarrer
npm start
```

### 3. Vérifier que le Serveur Tourne

```bash
cd alibaba-clone
npm run dev
```

Devrait afficher:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.187:3000
```

### 4. Tester l'URL dans le Navigateur

Ouvrir dans votre navigateur:
```
http://192.168.1.187:3000/api/mobile/products
```

Devrait afficher du JSON (même si erreur, c'est bon signe).

### 5. Vérifier l'IP de votre Machine

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Chercher l'adresse IPv4 de votre réseau local (ex: 192.168.1.187)

### 6. Vérifier que Mobile et PC sont sur le Même Réseau

- Le téléphone/émulateur doit être sur le même WiFi que votre PC
- Pas de VPN actif
- Pas de pare-feu bloquant le port 3000

### 7. Tester avec localhost (Émulateur Android)

Si vous utilisez l'émulateur Android, essayez:

```env
# Pour émulateur Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Pour émulateur iOS
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 8. Tester avec l'IP de Tunnel Expo

Si rien ne fonctionne, utilisez le tunnel Expo:

```bash
# Démarrer avec tunnel
npx expo start --tunnel
```

Puis utiliser l'URL du tunnel dans `.env`.

## Test Manuel dans l'App

Créer un fichier de test `intershop-mobile/test-api.ts`:

```typescript
import axios from 'axios';

const testAPI = async () => {
  const API_URL = 'http://192.168.1.187:3000';
  
  console.log('🔍 Test 1: Ping serveur...');
  try {
    const response = await axios.get(`${API_URL}/api/mobile/products`);
    console.log('✅ Serveur accessible!', response.status);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.request) console.error('Request:', error.request);
  }
  
  console.log('\n🔍 Test 2: Avec timeout court...');
  try {
    const response = await axios.get(`${API_URL}/api/mobile/products`, {
      timeout: 5000
    });
    console.log('✅ Réponse reçue!');
  } catch (error: any) {
    console.error('❌ Timeout ou erreur:', error.message);
  }
};

testAPI();
```

Exécuter:
```bash
npx ts-node test-api.ts
```

## Vérifications Réseau

### Test 1: Ping depuis le Terminal
```bash
# Windows
ping 192.168.1.187

# Mac/Linux
ping -c 4 192.168.1.187
```

### Test 2: Curl depuis le Terminal
```bash
curl http://192.168.1.187:3000/api/mobile/products
```

### Test 3: Telnet (vérifier port ouvert)
```bash
telnet 192.168.1.187 3000
```

## Configuration Next.js

Vérifier que Next.js écoute sur toutes les interfaces:

```bash
# Dans alibaba-clone/package.json
"dev": "next dev -H 0.0.0.0"
```

Ou démarrer avec:
```bash
next dev -H 0.0.0.0 -p 3000
```

## Pare-feu Windows

Si vous êtes sur Windows, autoriser le port 3000:

1. Ouvrir "Pare-feu Windows Defender"
2. "Paramètres avancés"
3. "Règles de trafic entrant"
4. "Nouvelle règle..."
5. Type: Port
6. Port: 3000
7. Autoriser la connexion

## Configuration Axios (Debugging)

Ajouter des logs dans `src/services/api.ts`:

```typescript
// Avant l'intercepteur de requête
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    console.log('📤 BaseURL:', config.baseURL);
    console.log('📤 Full URL:', `${config.baseURL}${config.url}`);
    
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse avec plus de logs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.message);
    console.error('❌ Error Code:', error.code);
    console.error('❌ Error Config:', error.config?.url);
    
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    } else if (error.request) {
      console.error('❌ No Response Received');
      console.error('❌ Request:', error.request);
    }
    
    // ... reste du code
  }
);
```

## Checklist de Diagnostic

- [ ] Slash enlevé de l'URL dans .env
- [ ] App mobile redémarrée (npm start)
- [ ] Serveur Next.js tourne (npm run dev)
- [ ] URL testée dans navigateur
- [ ] IP vérifiée (ipconfig/ifconfig)
- [ ] Mobile et PC sur même WiFi
- [ ] Pas de VPN actif
- [ ] Pare-feu autorise port 3000
- [ ] Logs axios ajoutés pour debugging

## Solution Rapide (Si Rien ne Marche)

Utiliser localhost avec tunnel:

```bash
# Terminal 1: Démarrer le serveur
cd alibaba-clone
npm run dev

# Terminal 2: Démarrer l'app avec tunnel
cd intershop-mobile
npx expo start --tunnel
```

Puis dans `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Résultat Attendu

Après correction, vous devriez voir:
```
📤 Request: GET /api/mobile/products
📤 BaseURL: http://192.168.1.187:3000
📤 Full URL: http://192.168.1.187:3000/api/mobile/products
✅ Response: 200 /api/mobile/products
```

Au lieu de:
```
❌ Response Error: Network Error
❌ Error Code: ERR_NETWORK
```
