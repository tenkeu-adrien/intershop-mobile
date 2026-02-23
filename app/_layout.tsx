import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useCartStore } from '../src/store/cartStore';
import { useAuthStore } from '../src/store/authStore';
// Firebase is initialized automatically when imported
import '../src/config/firebase';

export default function RootLayout() {
  const { loadCart } = useCartStore();
  const { initAuthListener } = useAuthStore();

  useEffect(() => {
    // 1. Firebase is already initialized (synchronous at module load)
    
    // 2. Charger les données locales
    loadCart();
    
    // 3. Initialiser le listener d'authentification
    initAuthListener();
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
