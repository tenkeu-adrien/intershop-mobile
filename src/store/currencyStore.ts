import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'XOF' | 'XAF' | 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'MAD';

export interface Currency {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  flag: string;
  countries: string[]; // Codes pays ISO
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, Currency> = {
  USD: { code: 'USD', name: 'Dollar américain', symbol: '$', flag: 'US', countries: ['US'] },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: 'EU', countries: ['FR', 'DE', 'IT', 'ES', 'PT', 'BE', 'NL', 'AT', 'IE', 'FI', 'GR'] },
  GBP: { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: 'GB', countries: ['GB'] },
  XOF: { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA', flag: 'SN', countries: ['SN', 'CI', 'BJ', 'BF', 'TG', 'NE', 'ML', 'GW'] },
  XAF: { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA', flag: 'CM', countries: ['CM', 'GA', 'CG', 'TD', 'CF', 'GQ'] },
  NGN: { code: 'NGN', name: 'Naira nigérian', symbol: '₦', flag: 'NG', countries: ['NG'] },
  GHS: { code: 'GHS', name: 'Cedi ghanéen', symbol: '₵', flag: 'GH', countries: ['GH'] },
  KES: { code: 'KES', name: 'Shilling kényan', symbol: 'KSh', flag: 'KE', countries: ['KE'] },
  ZAR: { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', flag: 'ZA', countries: ['ZA'] },
  MAD: { code: 'MAD', name: 'Dirham marocain', symbol: 'DH', flag: 'MA', countries: ['MA'] },
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
  isAutoDetected: boolean; // Indique si la devise a été auto-détectée
  userCountry: string | null; // Code pays de l'utilisateur
  hasDetectedOnce: boolean; // Indique si la détection a déjà été faite

  // Getters
  currency: SupportedCurrency; // Alias pour selectedCurrency
  currencies: Currency[]; // Liste des devises disponibles

  // Actions
  setCurrency: (currency: SupportedCurrency, isManual?: boolean) => void;
  detectCurrencyFromLocation: () => Promise<void>;
  updateExchangeRates: () => Promise<void>;
  convertPrice: (amountUSD: number) => number;
  formatPrice: (amount: number, currency?: SupportedCurrency) => string;
  getCurrencyFromCountryCode: (countryCode: string) => SupportedCurrency;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'XOF',
      exchangeRates: EXCHANGE_RATES,
      loading: false,
      error: null,
      lastUpdate: null,
      isAutoDetected: false,
      userCountry: null,
      hasDetectedOnce: false,

      // Getters
      get currency() {
        return get().selectedCurrency;
      },
      get currencies() {
        return Object.values(SUPPORTED_CURRENCIES);
      },

      setCurrency: (currency: SupportedCurrency, isManual = true) => {
        set({ 
          selectedCurrency: currency,
          isAutoDetected: !isManual,
          hasDetectedOnce: true,
        });
      },

      getCurrencyFromCountryCode: (countryCode: string): SupportedCurrency => {
        // Chercher la devise correspondant au pays
        for (const [currencyCode, currency] of Object.entries(SUPPORTED_CURRENCIES)) {
          if (currency.countries.includes(countryCode)) {
            return currencyCode as SupportedCurrency;
          }
        }
        // Par défaut, retourner USD
        return 'USD';
      },

      detectCurrencyFromLocation: async () => {
        const { hasDetectedOnce } = get();
        
        // Ne pas détecter si déjà fait
        if (hasDetectedOnce) {
          console.log('⏭️ Détection déjà effectuée, skip');
          return;
        }

        set({ loading: true, error: null });
        try {
          // Demander la permission de localisation
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            console.log('Permission de localisation refusée');
            set({ loading: false, hasDetectedOnce: true });
            return;
          }

          // Obtenir la position actuelle
          const location = await Location.getCurrentPositionAsync({});
          
          // Obtenir le code pays via reverse geocoding
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address && address.isoCountryCode) {
            const countryCode = address.isoCountryCode;
            const detectedCurrency = get().getCurrencyFromCountryCode(countryCode);
            
            console.log(`📍 Pays détecté: ${countryCode}, Devise: ${detectedCurrency}`);
            
            set({
              selectedCurrency: detectedCurrency,
              userCountry: countryCode,
              isAutoDetected: true,
              hasDetectedOnce: true,
              loading: false,
            });
          } else {
            set({ loading: false, hasDetectedOnce: true });
          }
        } catch (error: any) {
          console.error('Erreur détection localisation:', error);
          set({
            error: error.message || 'Impossible de détecter la localisation',
            loading: false,
            hasDetectedOnce: true,
          });
        }
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
        isAutoDetected: state.isAutoDetected,
        userCountry: state.userCountry,
        hasDetectedOnce: state.hasDetectedOnce,
      }),
    }
  )
);
