# 🚀 Guide de mise à jour vers Expo SDK 54

## Problème
Ton Expo Go est en version SDK 54, mais le projet utilise SDK 52.

## Solution rapide (Recommandée)

### Étape 1: Nettoyer le projet
```bash
cd intershop-mobile
rm -rf node_modules
rm package-lock.json
```

### Étape 2: Installer les dépendances
```bash
npm install
```

### Étape 3: Mettre à jour vers SDK 54
```bash
npx expo install expo@latest
```

### Étape 4: Corriger les dépendances
```bash
npx expo install --fix
```

### Étape 5: Lancer le projet
```bash
npx expo start
```

## Alternative: Utiliser un simulateur iOS avec SDK 52

Si tu préfères garder SDK 52:

1. Installe Xcode (Mac uniquement)
2. Lance le simulateur iOS
3. Dans le simulateur, installe Expo Go pour SDK 52
4. Lance ton projet: `npx expo start --ios`

## Vérification

Après la mise à jour, vérifie que `package.json` contient:
```json
{
  "dependencies": {
    "expo": "~54.0.0"
  }
}
```

## En cas de problème

Si tu as des erreurs après la mise à jour:

1. Supprime `.expo` et `node_modules`:
```bash
rm -rf .expo node_modules package-lock.json
```

2. Réinstalle tout:
```bash
npm install
```

3. Relance:
```bash
npx expo start --clear
```

## Notes importantes

- SDK 54 est compatible avec toutes les fonctionnalités que nous avons ajoutées
- Aucun changement de code n'est nécessaire
- Les stores et écrans fonctionneront exactement pareil
