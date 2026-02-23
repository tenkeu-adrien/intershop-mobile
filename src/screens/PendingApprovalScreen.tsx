import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { IoHourglass, IoLogOut } from 'react-icons/io5';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function PendingApprovalScreen({ navigation }: any) {
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBBF24', '#10B981', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.iconContainer}>
          <IoHourglass size={80} color="white" />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>En attente d'approbation</Text>
        
        <Text style={styles.message}>
          Votre compte {user?.role === 'fournisseur' ? 'fournisseur' : 'marketiste'} est en cours de vérification par notre équipe.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Prochaines étapes:</Text>
          <Text style={styles.infoText}>
            • Notre équipe vérifie vos informations{'\n'}
            • Vous recevrez un email de confirmation{'\n'}
            • Délai: 24-48 heures ouvrables{'\n'}
            • Vous pourrez ensuite accéder à votre dashboard
          </Text>
        </View>

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>💬 Besoin d'aide?</Text>
          <Text style={styles.contactText}>
            Contactez-nous: support@intershop.com
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <IoLogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 22,
  },
  contactBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#78350F',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    borderRadius: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
