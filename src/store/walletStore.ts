import { create } from 'zustand';
import api from '../services/api';
import type { FlexibleDepositData, FlexibleWithdrawalData, TransferData } from '../types';

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  status: 'active' | 'suspended' | 'closed';
  pin?: string;
  pinAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  fees: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  mobileMoneyTransactionId?: string;
  reference: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchWallet: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  initiateDeposit: (userId: string, amount: number, provider: string, phoneNumber: string) => Promise<Transaction>;
  initiateWithdrawal: (userId: string, amount: number, provider: string, phoneNumber: string, pin: string) => Promise<Transaction>;
  initiateFlexibleDeposit: (userId: string, data: FlexibleDepositData) => Promise<void>;
  initiateFlexibleWithdrawal: (userId: string, data: FlexibleWithdrawalData) => Promise<void>;
  processPayment: (userId: string, data: TransferData) => Promise<void>;
  verifyPIN: (userId: string, pin: string) => Promise<void>;
  createPIN: (userId: string, pin: string) => Promise<void>;
  updatePIN: (userId: string, currentPin: string, newPin: string) => Promise<void>;
  getBalance: () => number;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  loading: false,
  error: null,

  fetchWallet: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.wallet.getBalance(userId);
      
      if (response.success) {
        set({ 
          wallet: response.wallet,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération du portefeuille');
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchTransactions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.wallet.getTransactions(userId);
      
      if (response.success) {
        set({ transactions: response.transactions, loading: false });
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des transactions');
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      set({ error: error.message, loading: false });
    }
  },

  initiateDeposit: async (userId: string, amount: number, provider: string, phoneNumber: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.wallet.deposit(userId, amount, provider, phoneNumber, pin);
      
      if (response.success) {
        // Refresh wallet and transactions
        await get().fetchWallet(userId);
        await get().fetchTransactions(userId);
        
        set({ loading: false });
        return response.transaction;
      } else {
        throw new Error(response.error || 'Erreur lors du dépôt');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initiateWithdrawal: async (userId: string, amount: number, provider: string, phoneNumber: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.wallet.withdraw(userId, amount, provider, phoneNumber, pin);
      
      if (response.success) {
        // Refresh wallet and transactions
        await get().fetchWallet(userId);
        await get().fetchTransactions(userId);
        
        set({ loading: false });
        return response.transaction;
      } else {
        throw new Error(response.error || 'Erreur lors du retrait');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getBalance: () => {
    return get().wallet?.balance || 0;
  },

  initiateFlexibleDeposit: async (userId: string, data: FlexibleDepositData) => {
    set({ loading: true, error: null });
    try {
      console.log('💰 [Wallet] Initiating deposit...', data);
      const response = await api.wallet.flexibleDeposit(
        userId,
        data.paymentMethodId,
        data.clientName,
        data.amount
      );
      
      if (response.success) {
        console.log('✅ [Wallet] Deposit initiated');
        // Refresh wallet and transactions
        await get().fetchWallet(userId);
        await get().fetchTransactions(userId);
      } else {
        throw new Error(response.error || 'Erreur lors du dépôt');
      }
      
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ [Wallet] Deposit error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initiateFlexibleWithdrawal: async (userId: string, data: FlexibleWithdrawalData) => {
    set({ loading: true, error: null });
    try {
      console.log('💸 [Wallet] Initiating withdrawal...', data);
      const response = await api.wallet.flexibleWithdraw(
        userId,
        data.paymentMethodId,
        data.amount,
        data.accountName,
        data.accountNumber
      );
      
      if (response.success) {
        console.log('✅ [Wallet] Withdrawal initiated');
        // Refresh wallet and transactions
        await get().fetchWallet(userId);
        await get().fetchTransactions(userId);
      } else {
        throw new Error(response.error || 'Erreur lors du retrait');
      }
      
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ [Wallet] Withdrawal error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  processPayment: async (userId: string, data: TransferData) => {
    set({ loading: true, error: null });
    try {
      console.log('💱 [Wallet] Processing transfer...', data);
      const response = await api.wallet.transfer(
        userId,
        data.toUserId,
        data.amount,
        data.description,
        data.pin
      );
      
      if (response.success) {
        console.log('✅ [Wallet] Transfer completed');
        // Refresh wallet and transactions
        await get().fetchWallet(userId);
        await get().fetchTransactions(userId);
      } else {
        throw new Error(response.error || 'Erreur lors du transfert');
      }
      
      set({ loading: false });
    } catch (error: any) {
      console.error('❌ [Wallet] Transfer error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  verifyPIN: async (userId: string, pin: string) => {
    const { wallet } = get();
    
    if (!wallet?.pin) {
      throw new Error('Aucun PIN configuré');
    }
    
    // TODO: Replace with actual API call for secure PIN verification
    // const response = await api.wallet.verifyPIN(userId, pin);
    
    // Simulate PIN verification (NOT SECURE - for development only)
    if (wallet.pin !== pin) {
      throw new Error('PIN incorrect');
    }
  },

  createPIN: async (userId: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      // Vérifier d'abord si un PIN existe déjà
      const wallet = get().wallet;
      if (wallet?.pin) {
        throw new Error('Un PIN existe déjà. Utilisez la fonction de modification ou réinitialisation.');
      }

      // Appeler l'API pour créer le PIN (sera hashé côté serveur)
      const response = await api.wallet.setPin(userId, pin);
      
      if (response.success) {
        // Rafraîchir le wallet
        await get().fetchWallet(userId);
        set({ loading: false });
      } else {
        throw new Error(response.error || 'Erreur lors de la création du PIN');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePIN: async (userId: string, currentPin: string, newPin: string) => {
    set({ loading: true, error: null });
    try {
      // Vérifier qu'un PIN existe
      const wallet = get().wallet;
      if (!wallet?.pin) {
        throw new Error('Aucun PIN configuré. Veuillez d\'abord créer un PIN.');
      }

      // Vérifier d'abord le PIN actuel
      const verifyResponse = await api.wallet.verifyPin(userId, currentPin);
      
      if (!verifyResponse.success) {
        throw new Error('PIN actuel incorrect');
      }
      
      // Définir le nouveau PIN
      const response = await api.wallet.setPin(userId, newPin);
      
      if (response.success) {
        // Rafraîchir le wallet
        await get().fetchWallet(userId);
        set({ loading: false });
      } else {
        throw new Error(response.error || 'Erreur lors de la modification du PIN');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      wallet: null,
      transactions: [],
      loading: false,
      error: null
    });
  }
}));



