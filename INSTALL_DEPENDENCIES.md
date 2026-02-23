# 📦 Installation des dépendances - InterShop Mobile

## Dépendances à installer

Deux nouvelles dépendances ont été ajoutées au projet:

### 1. AsyncStorage
Pour la persistance du panier localement sur l'appareil.

### 2. React Icons
Pour les icônes (io5) utilisées dans toute l'application.

---

## 🚀 Installation automatique

### Méthode 1: Installation complète (recommandée)

```bash
cd interShop-mobile
npm install
```

Cette commande installera automatiquement toutes les dépendances listées dans `package.json`, y compris les nouvelles.

---

## 🔧 Installation manuelle (si nécessaire)

Si vous préférez installer les dépendances une par une:

### AsyncStorage
```bash
npm install @react-native-async-storage/async-storage@1.23.1
```

### React Icons
```bash
npm install react-icons@^5.3.0
```

---

## ✅ Vérification de l'installation

### Vérifier que les dépendances sont installées

```bash
# Vérifier AsyncStorage
npm list @react-native-async-storage/async-storage

# Vérifier React Icons
npm list react-icons
```

### Vérifier dans package.json

Ouvrir `package.json` et vérifier que ces lignes sont présentes dans `dependencies`:

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "react-icons": "^5.3.0"
  }
}
```

---

## 🐛 Résolution de problèmes

### Erreur: "Cannot find module '@react-native-async-storage/async-storage'"

**Solution:**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Nettoyer le cache Expo
npm start -- --clear
```

### Erreur: "Cannot find module 'react-icons'"

**Solution:**
```bash
# Réinstaller react-icons
npm install react-icons@^5.3.0

# Redémarrer Expo
npm start -- --clear
```

### Erreur: "Module not found" après installation

**Solution:**
```bash
# Arrêter Expo (Ctrl+C)
# Nettoyer et redémarrer
npm start -- --clear
```

---

## 📱 Utilisation dans le code

### AsyncStorage (Panier)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder
await AsyncStorage.setItem('cart', JSON.stringify(cartData));

// Charger
const cartData = await AsyncStorage.getItem('cart');
```

**Utilisé dans:** `src/store/cartStore.ts`

### React Icons (Icônes)

```typescript
import { 
  IoHome, 
  IoCart, 
  IoPerson 
} from 'react-icons/io5';

// Utilisation
<IoHome size={24} color="#10B981" />
```

**Utilisé dans:** Tous les écrans et la navigation

---

## 🔄 Après installation

### 1. Redémarrer Expo

```bash
# Arrêter Expo (Ctrl+C dans le terminal)
# Redémarrer
npm start
```

### 2. Nettoyer le cache (si problèmes)

```bash
npm start -- --clear
```

### 3. Tester l'application

- Scanner le QR code avec Expo Go
- Vérifier que l'app se charge sans erreur
- Tester la navigation (5 onglets)
- Tester le panier (persistance)

---

## 📋 Checklist d'installation

- [ ] `npm install` exécuté
- [ ] AsyncStorage installé (1.23.1)
- [ ] React Icons installé (^5.3.0)
- [ ] Pas d'erreurs dans le terminal
- [ ] Expo redémarré
- [ ] App testée sur appareil/émulateur
- [ ] Navigation fonctionne
- [ ] Icônes s'affichent correctement
- [ ] Panier persiste après fermeture

---

## 💡 Notes importantes

### AsyncStorage
- **Version**: 1.23.1 (compatible Expo 52)
- **Taille**: ~50KB
- **Usage**: Stockage local clé-valeur
- **Limite**: ~6MB sur iOS, ~10MB sur Android

### React Icons
- **Version**: ^5.3.0
- **Taille**: ~2MB (tree-shaking appliqué)
- **Usage**: Icônes io5 (Ionicons 5)
- **Avantage**: Pas besoin d'images, rendu vectoriel

---

## 🚀 Commandes utiles

```bash
# Installation complète
npm install

# Installation avec cache nettoyé
npm install --force

# Vérifier les dépendances
npm list

# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités
npm audit fix
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier la version de Node.js**
   ```bash
   node --version  # Doit être 18+
   ```

2. **Vérifier la version de npm**
   ```bash
   npm --version  # Doit être 9+
   ```

3. **Nettoyer complètement**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start -- --clear
   ```

4. **Consulter les logs**
   - Regarder le terminal Expo
   - Regarder les logs dans Expo Go
   - Vérifier la console du navigateur (si web)

---

## ✅ Installation réussie

Vous saurez que l'installation est réussie quand:

- ✅ Aucune erreur dans le terminal
- ✅ L'app se charge dans Expo Go
- ✅ Les 5 onglets s'affichent avec leurs icônes
- ✅ Le panier fonctionne et persiste
- ✅ Toutes les icônes sont visibles

---

**Bon développement! 🎉**
