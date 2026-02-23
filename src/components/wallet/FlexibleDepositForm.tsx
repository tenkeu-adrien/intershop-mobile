import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import type { PaymentMethod, FlexibleDepositData } from '../../types';

interface FlexibleDepositFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (data: FlexibleDepositData) => Promise<void>;
  onCancel: () => void;
}

export default function FlexibleDepositForm({
  paymentMethod,
  onSubmit,
  onCancel
}: FlexibleDepositFormProps) {
  const { user } = useAuthStore();
  
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setClientName(user.displayName);
    }
  }, [user]);

  const handleSubmit = async () => {
    // Validation
    if (!clientName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un nombre positif');
      return;
    }
    
    setLoading(true);
    
    try {
      const data: FlexibleDepositData = {
        paymentMethodId: paymentMethod.id,
        clientName: clientName.trim(),
        amount: amountNum
      };
      
      await onSubmit(data);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
        <Text style={styles.title}>Dépôt via {paymentMethod.name}</Text>
        
        {/* Instructions de paiement */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Instructions de paiement</Text>
          <Text style={styles.instructionsText}>{paymentMethod.instructions}</Text>
          
          {/* Détails du compte */}
          {paymentMethod.accountDetails && (
            <View style={styles.accountDetails}>
              <Text style={styles.accountDetailsTitle}>Détails du compte</Text>
              
              {paymentMethod.accountDetails.accountNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Numéro:</Text>
                  <View style={styles.detailValueContainer}>
                    <Text style={styles.detailValue}>
                      {paymentMethod.accountDetails.accountNumber}
                    </Text>
                  </View>
                </View>
              )}
              
              {paymentMethod.accountDetails.accountName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nom:</Text>
                  <Text style={styles.detailValue}>
                    {paymentMethod.accountDetails.accountName}
                  </Text>
                </View>
              )}
              
              {paymentMethod.accountDetails.bankName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Banque:</Text>
                  <Text style={styles.detailValue}>
                    {paymentMethod.accountDetails.bankName}
                  </Text>
                </View>
              )}
              
              {paymentMethod.accountDetails.walletAddress && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Adresse:</Text>
                  <Text style={[styles.detailValue, styles.monoText]} numberOfLines={2}>
                    {paymentMethod.accountDetails.walletAddress}
                  </Text>
                </View>
              )}
              
              {paymentMethod.accountDetails.network && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Réseau:</Text>
                  <Text style={styles.detailValue}>
                    {paymentMethod.accountDetails.network}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Formulaire */}
        <View style={styles.form}>
          {/* Nom du client */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Votre nom <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Entrez votre nom"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.hint}>
              Ce nom sera utilisé pour identifier votre paiement
            </Text>
          </View>
          
          {/* Montant */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Montant (FCFA) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 10000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          
          {/* Avertissement */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ <Text style={styles.warningBold}>Important:</Text> Effectuez d'abord le paiement selon les instructions ci-dessus, 
              puis revenez ici pour confirmer votre dépôt. L'administrateur vérifiera manuellement 
              la réception du paiement avant de créditer votre portefeuille.
            </Text>
          </View>
          
          {/* Boutons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.button, styles.submitButton]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Confirmer le dépôt</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  accountDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#93C5FD',
  },
  accountDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    width: 80,
  },
  detailValueContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#FBBF24',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
