# 📋 Plan d'Implémentation - Wallet Complet & Vérification Email

## 🎯 Objectifs

### 1. ✅ Badge Panier Corrigé
- Afficher le nombre de produits (items.length)
- Pas la quantité totale

### 2. ✅ Erreur WalletScreen Corrigée  
- Gestion de `createdAt` (Date vs Timestamp)

### 3. ⏳ Système Wallet Complet
- Page principale wallet
- Dépôt (deposit)
- Retrait (withdrawal)
- Transfert (transfer)
- Historique (history)
- Détails transaction

### 4. ⏳ Harmonisation Inscription
- Mêmes champs qu'alibaba-clone
- Validation identique

### 5. ⏳ Vérification Email
- Envoi de code par email
- Vérification du code
- Activation du compte

---

## 📁 Structure à Créer

```
intershop-mobile/
├── app/
│   ├── wallet/
│   │   ├── deposit/
│   │   │   └── page.tsx          ⏳ À créer
│   │   ├── withdraw/
│   │   │   └── page.tsx          ⏳ À créer
│   │   ├── transfer/
│   │   │   └── page.tsx          ⏳ À créer
│   │   ├── history/
│   │   │   └── page.tsx          ⏳ À créer
│   │   ├── transaction/
│   │   │   └── [id]/
│   │   │       └── page.tsx      ⏳ À créer
│   │   └── settings/
│   │       └── page.tsx          ⏳ À créer
│   ├── verify-email/
│   │   └── page.tsx              ⏳ À créer
│   └── register.tsx              ⏳ À mettre à jour
├── src/
│   ├── components/
│   │   └── wallet/
│   │       ├── DepositModal.tsx  ⏳ À créer
│   │       ├── WithdrawModal.tsx ⏳ À créer
│   │       └── TransferModal.tsx ⏳ À créer
│   └── services/
│       ├── walletService.ts      ⏳ À créer
│       └── verificationService.ts ⏳ À créer
```

---

## 🔧 Corrections Appliquées

### 1. Badge Panier ✅

**Fichier** : `src/store/cartStore.ts`

**Avant** :
```typescript
getItemCount: () => {
  return get().items.reduce((count, item) => count + item.quantity, 0);
  // Retourne la quantité totale (ex: 25)
},
```

**Après** :
```typescript
getItemCount: () => {
  // Retourner le nombre de produits différents, pas la quantité totale
  return get().items.length;
  // Retourne le nombre de produits (ex: 3)
},
```

---

### 2. Erreur WalletScreen ✅

**Fichier** : `src/screens/WalletScreen.tsx`

**Problème** : `transaction.createdAt.toLocaleDateString is not a function`

**Cause** : `createdAt` peut être un Timestamp Firestore, pas une Date

**Solution** :
```typescript
<Text style={styles.transactionDate}>
  {transaction.createdAt instanceof Date 
    ? transaction.createdAt.toLocaleDateString('fr-FR')
    : transaction.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
</Text>
```

---

## 📚 Référence alibaba-clone

### Pages Wallet Existantes

1. **`app/wallet/page.tsx`** - Page principale
   - Solde disponible
   - Solde en attente
   - Boutons d'action (Dépôt, Retrait, Transfert)
   - Historique récent

2. **`app/wallet/deposit/page.tsx`** - Dépôt
   - Sélection du montant
   - Choix du moyen de paiement (Mobile Money)
   - Saisie du numéro de téléphone
   - Confirmation avec PIN

3. **`app/wallet/withdraw/page.tsx`** - Retrait
   - Saisie du montant
   - Choix du moyen de retrait
   - Numéro de téléphone
   - Confirmation avec PIN

4. **`app/wallet/transfer/page.tsx`** - Transfert
   - Recherche du destinataire
   - Montant à transférer
   - Message optionnel
   - Confirmation avec PIN

5. **`app/wallet/history/page.tsx`** - Historique
   - Liste complète des transactions
   - Filtres (type, date, statut)
   - Pagination

6. **`app/wallet/transaction/[id]/page.tsx`** - Détails
   - Informations complètes
   - Statut
   - Reçu téléchargeable

---

## 🎨 Design & Couleurs

### Palette de Couleurs (alibaba-clone)

```typescript
const colors = {
  // Primaires
  yellow: '#FBBF24',    // Jaune principal
  green: '#10B981',     // Vert succès
  
  // Actions
  deposit: '#10B981',   // Vert pour dépôt
  withdraw: '#EF4444',  // Rouge pour retrait
  transfer: '#3B82F6',  // Bleu pour transfert
  
  // États
  pending: '#FBBF24',   // Jaune pour en attente
  completed: '#10B981', // Vert pour complété
  failed: '#EF4444',    // Rouge pour échoué
  
  // Neutres
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};
```

### Composants Réutilisables

1. **Balance Card** - Carte de solde
2. **Action Button** - Bouton d'action coloré
3. **Transaction Item** - Élément de transaction
4. **Status Badge** - Badge de statut
5. **Amount Display** - Affichage de montant

---

## 🔐 Vérification Email

### Flux (alibaba-clone)

1. **Inscription** :
   - Utilisateur remplit le formulaire
   - Compte créé avec `emailVerified: false`
   - Code de vérification envoyé par email

2. **Vérification** :
   - Utilisateur reçoit un code à 6 chiffres
   - Saisie du code dans l'app
   - Validation côté serveur
   - Compte activé si code correct

3. **Rappel** :
   - Banner sur la page d'accueil si non vérifié
   - Possibilité de renvoyer le code
   - Limite de 3 tentatives par heure

### API Endpoints

```typescript
// Envoyer le code
POST /api/verification/send-code
Body: { email: string, type: 'email' }

// Vérifier le code
POST /api/verification/verify-code
Body: { email: string, code: string }

// Renvoyer le code
POST /api/verification/resend-code
Body: { email: string }
```

---

## 📝 Champs d'Inscription

### alibaba-clone (référence)

```typescript
interface RegisterForm {
  // Informations personnelles
  displayName: string;        // Nom complet
  email: string;              // Email
  password: string;           // Mot de passe
  confirmPassword: string;    // Confirmation
  
  // Informations professionnelles
  role: 'client' | 'fournisseur' | 'marketiste';
  
  // Pour fournisseur/marketiste
  shopName?: string;          // Nom de la boutique
  phoneNumber?: string;       // Téléphone
  country?: string;           // Pays
  city?: string;              // Ville
  address?: string;           // Adresse
  
  // Acceptation
  acceptTerms: boolean;       // CGU
}
```

### intershop-mobile (à harmoniser)

Actuellement manquant :
- `shopName` pour fournisseurs
- `phoneNumber`
- `country`, `city`, `address`
- `acceptTerms`

---

## 🚀 Prochaines Étapes

### Phase 1 : Wallet Pages ⏳

1. Créer `app/wallet/deposit/page.tsx`
2. Créer `app/wallet/withdraw/page.tsx`
3. Créer `app/wallet/transfer/page.tsx`
4. Créer `app/wallet/history/page.tsx`
5. Créer `app/wallet/transaction/[id]/page.tsx`

### Phase 2 : Wallet Components ⏳

1. `DepositModal.tsx` - Modal de dépôt
2. `WithdrawModal.tsx` - Modal de retrait
3. `TransferModal.tsx` - Modal de transfert
4. `PaymentMethodSelector.tsx` - Sélecteur de moyen de paiement

### Phase 3 : Services ⏳

1. `walletService.ts` - Service wallet
2. `verificationService.ts` - Service vérification

### Phase 4 : Vérification Email ⏳

1. Créer `app/verify-email/page.tsx`
2. Mettre à jour `app/register.tsx`
3. Ajouter banner de vérification
4. Implémenter l'envoi de code

### Phase 5 : Tests ⏳

1. Tester le flux complet de dépôt
2. Tester le flux complet de retrait
3. Tester le flux complet de transfert
4. Tester la vérification email

---

## 📊 Estimation

| Tâche | Temps estimé | Priorité |
|-------|--------------|----------|
| Badge panier | ✅ Fait | Haute |
| Erreur WalletScreen | ✅ Fait | Haute |
| Pages wallet | 2-3 heures | Haute |
| Components wallet | 1-2 heures | Haute |
| Services wallet | 1 heure | Haute |
| Vérification email | 1-2 heures | Moyenne |
| Harmonisation inscription | 30 min | Moyenne |
| Tests | 1 heure | Haute |

**Total estimé** : 6-10 heures

---

## ✅ Checklist

- [x] Badge panier corrigé
- [x] Erreur WalletScreen corrigée
- [ ] Page wallet/deposit
- [ ] Page wallet/withdraw
- [ ] Page wallet/transfer
- [ ] Page wallet/history
- [ ] Page wallet/transaction/[id]
- [ ] DepositModal component
- [ ] WithdrawModal component
- [ ] TransferModal component
- [ ] walletService
- [ ] verificationService
- [ ] Page verify-email
- [ ] Mise à jour register
- [ ] Tests complets

---

**Date** : 2026-02-20
**Version** : 2.0.0
**Statut** : 🚧 En cours - Phase 1 commencée
