import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'XOF' | 'XAF' | 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'MAD';

export interface Currency {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, Currency> = {
  USD: { code: 'USD', name: 'Dollar américain', symbol: '$', flag: 'US' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: 'EU' },
  GBP: { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: 'GB' },
  XOF: { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA', flag: 'SN' },
  XAF: { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA', flag: 'CM' },
  NGN: { code: 'NGN', name: 'Naira nigérian', symbol: '₦', flag: 'NG' },
  GHS: { code: 'GHS', name: 'Cedi ghanéen', symbol: '₵', flag: 'GH' },
  KES: { code: 'KES', name: 'Shilling kényan', symbol: 'KSh', flag: 'KE' },
  ZAR: { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', flag: 'ZA' },
  MAD: { code: 'MAD', name: 'Dirham marocain', symbol: 'DH', flag: 'MA' },
};

// Taux de change par rapport à USD (mis à jour périodiquement)
const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  XOF: 605,
  XAF: 605,
  NGN: 1550,
  GHS: 15.5,
  KES: 155,
  ZAR: 18.5,
  MAD: 10.2,
};

interface CurrencyState {
  selectedCurrency: SupportedCurrency;
  exchangeRates: Record<SupportedCurrency, number>;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;

  // Actions
  setCurrency: (currency: SupportedCurrency) => void;
  updateExchangeRates: () => Promise<void>;
  convertPrice: (amountUSD: number) => number;
  formatPrice: (amount: number, currency?: SupportedCurrency) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'XOF',
      exchangeRates: EXCHANGE_RATES,
      loading: false,
      error: null,
      lastUpdate: null,

      setCurrency: (currency: SupportedCurrency) => {
        set({ selectedCurrency: currency });
      },

      updateExchangeRates: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Fetch real exchange rates from API
          // For now, use static rates
          set({
            exchangeRates: EXCHANGE_RATES,
            loading: false,
            lastUpdate: new Date(),
          });
        } catch (error: any) {
          set({
            error: error.message || 'Échec de la mise à jour des taux de change',
            loading: false,
          });
        }
      },

      convertPrice: (amountUSD: number) => {
        const { selectedCurrency, exchangeRates } = get();
        const rate = exchangeRates[selectedCurrency] || 1;
        return amountUSD * rate;
      },

      formatPrice: (amount: number, currency?: SupportedCurrency) => {
        const { selectedCurrency } = get();
        const curr = currency || selectedCurrency;
        const currencyInfo = SUPPORTED_CURRENCIES[curr];
        
        // Format selon la devise
        if (curr === 'XOF' || curr === 'XAF') {
          return `${Math.round(amount).toLocaleString('fr-FR')} ${currencyInfo.symbol}`;
        } else if (curr === 'USD' || curr === 'EUR' || curr === 'GBP') {
          return `${currencyInfo.symbol}${amount.toFixed(2)}`;
        } else {
          return `${currencyInfo.symbol} ${amount.toFixed(2)}`;
        }
      },
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        lastUpdate: state.lastUpdate,
      }),
    }
  )
);
