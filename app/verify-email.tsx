import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import EmailVerification from '../src/components/auth/EmailVerification';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();

  useEffect(() => {
    // Rediriger si pas d'utilisateur
    if (!user) {
      router.push('/login');
      return;
    }

    // Rediriger si email déjà vérifié
    if (user.emailVerified) {
      router.push('/(tabs)');
    }
  }, [user, router]);

  const handleSuccess = async () => {
    if (!user) return;

    // Recharger les données utilisateur
    await refreshUser();

    // Rediriger vers l'accueil
    router.push('/(tabs)');
  };

  if (!user) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <EmailVerification
        userId={user.id}
        email={user.email}
        displayName={user.displayName}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1FAE5',
  },
});
