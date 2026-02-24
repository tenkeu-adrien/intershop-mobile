import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useCartStore } from '../src/store/cartStore';
import { useAuthStore } from '../src/store/authStore';
import { useCurrencyStore } from '../src/store/currencyStore';
// Firebase is initialized automatically when imported
import '../src/config/firebase';
// i18n - Internationalisation (doit être importé tôt)
import '../src/i18n';

export default function RootLayout() {
  const { loadCart } = useCartStore();
  const { initAuthListener } = useAuthStore();
  const { detectCurrencyFromLocation } = useCurrencyStore();

  useEffect(() => {
    // 1. Firebase is already initialized (synchronous at module load)

    // 2. Charger les données locales
    loadCart();

    // 3. Initialiser le listener d'authentification
    initAuthListener();

    // 4. Détecter la devise selon la localisation (seulement au premier lancement)
    // La logique hasDetectedOnce est gérée dans le store
    detectCurrencyFromLocation().catch(err => {
      console.log('Détection automatique de devise échouée:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
