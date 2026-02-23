import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useWalletStore } from '../../../src/store/walletStore';
import { PaymentMethodSelector, FlexibleDepositForm } from '../../../src/components/wallet';
import type { PaymentMethod, FlexibleDepositData } from '../../../src/types/index';

type Step = 'select' | 'form' | 'success';

function DepositPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('form');
  };

  const { initiateFlexibleDeposit } = useWalletStore();

  const handleSubmit = async (data: FlexibleDepositData) => {
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      await initiateFlexibleDeposit(user.id, data);
      setStep('success');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors du dépôt');
    }
  };

  const handleCancel = () => {
    setStep('select');
    setSelectedMethod(null);
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          
          <Text style={styles.successTitle}>Demande envoyée !</Text>
          
          <Text style={styles.successText}>
            Votre demande de dépôt a été envoyée avec succès.{'\n'}
            Un administrateur va la vérifier et valider votre paiement.
          </Text>
          
          <Text style={styles.successSubtext}>
            Vous serez notifié par email une fois votre dépôt validé.
          </Text>
          
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => router.push('/wallet/history')}
          >
            <Text style={styles.successButtonText}>Voir l'historique</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Déposer des fonds</Text>
      </View>

      {/* Indicateur d'étapes */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepRow}>
          <View style={[styles.stepItem, step === 'select' && styles.stepItemActive]}>
            <View style={[styles.stepCircle, step === 'select' && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, step === 'select' && styles.stepNumberActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step === 'select' && styles.stepLabelActive]}>
              Choisir la méthode
            </Text>
          </View>
          
          <View style={styles.stepLine} />
          
          <View style={[styles.stepItem, step === 'form' && styles.stepItemActive]}>
            <View style={[styles.stepCircle, step === 'form' && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, step === 'form' && styles.stepNumberActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, step === 'form' && styles.stepLabelActive]}>
              Confirmer le dépôt
            </Text>
          </View>
        </View>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {step === 'select' && (
          <PaymentMethodSelector
            onSelect={handleMethodSelect}
            type="deposit"
          />
        )}

        {step === 'form' && selectedMethod && (
          <FlexibleDepositForm
            paymentMethod={selectedMethod}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stepsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepItemActive: {
    // Active styling handled by child components
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#FBBF24',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#1F2937',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  content: {
    padding: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  successSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  successButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default DepositPage;
