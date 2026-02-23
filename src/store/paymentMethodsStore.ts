import { create } from 'zustand';
import { PaymentMethod } from '../types';
import api from '../services/api';

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchActivePaymentMethods: () => Promise<void>;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  paymentMethods: [],
  loading: false,
  error: null,
  lastFetch: null,

  fetchActivePaymentMethods: async () => {
    const { lastFetch, paymentMethods } = get();
    const now = Date.now();

    // Utiliser le cache si disponible et pas expiré
    if (lastFetch && paymentMethods.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      console.log('📦 [PaymentMethods] Using cached data');
      return;
    }

    set({ loading: true, error: null });
    
    try {
      console.log('🔄 [PaymentMethods] Fetching from API...');
      const response = await api.paymentMethods.getActive();
      
      if (response.success) {
        console.log(`✅ [PaymentMethods] Loaded ${response.paymentMethods.length} methods`);
        set({ 
          paymentMethods: response.paymentMethods, 
          loading: false,
          lastFetch: now
        });
      } else {
        throw new Error(response.error || 'Erreur lors du chargement');
      }
    } catch (error: any) {
      console.error('❌ [PaymentMethods] Error:', error);
      set({ error: error.message || 'Erreur lors du chargement', loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      paymentMethods: [],
      loading: false,
      error: null,
      lastFetch: null
    });
  }
}));
