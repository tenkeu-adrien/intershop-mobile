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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import type { PaymentMethod, FlexibleWithdrawalData } from '../../types';

interface FlexibleWithdrawalFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (data: FlexibleWithdrawalData) => Promise<void>;
  onCancel: () => void;
}

export default function FlexibleWithdrawalForm({
  paymentMethod,
  onSubmit,
  onCancel
}: FlexibleWithdrawalFormProps) {
  const { user } = useAuthStore();
  const { wallet, fetchWallet } = useWalletStore();
  
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWallet(user.id);
    }
  }, [user]);

  const getAccountNumberPlaceholder = () => {
    switch (paymentMethod.type) {
      case 'mobile_money':
      case 'mpesa':
        return 'Ex: +243 812 345 678';
      case 'crypto':
        return 'Ex: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      case 'bank_transfer':
        return 'Ex: 1234567890';
      default:
        return 'Entrez le numéro de compte';
    }
  };

  const getAccountNumberLabel = () => {
    switch (paymentMethod.type) {
      case 'mobile_money':
      case 'mpesa':
        return 'Votre numéro Mobile Money';
      case 'crypto':
        return 'Votre adresse wallet';
      case 'bank_transfer':
        return 'Votre numéro de compte';
      default:
        return 'Numéro de compte';
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);

    // Validations
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }

    if (!wallet) {
      Alert.alert('Erreur', 'Portefeuille non chargé');
      return;
    }

    if (numAmount > wallet.balance) {
      Alert.alert(
        'Erreur',
        `Solde insuffisant. Votre solde: ${wallet.balance.toLocaleString('fr-FR')} FCFA`
      );
      return;
    }

    if (!accountName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du compte');
      return;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le numéro de compte');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        paymentMethodId: paymentMethod.id,
        amount: numAmount,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim()
      });
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Erreur lors de la demande de retrait');
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
        <Text style={styles.title}>Retrait via {paymentMethod.name}</Text>

        {/* Solde disponible */}
        {wallet && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>
              {wallet.balance.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Instructions</Text>
          <Text style={styles.instructionsText}>{paymentMethod.instructions}</Text>
        </View>

        {/* Informations de la méthode */}
        {paymentMethod.accountDetails && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>ℹ️ Informations importantes</Text>
            <View style={styles.infoContent}>
              {paymentMethod.accountDetails.accountNumber && (
                <Text style={styles.infoText}>
                  • Le paiement sera effectué depuis: {paymentMethod.accountDetails.accountNumber}
                </Text>
              )}
              {paymentMethod.accountDetails.walletAddress && (
                <Text style={[styles.infoText, styles.monoText]}>
                  • Adresse: {paymentMethod.accountDetails.walletAddress}
                </Text>
              )}
              {paymentMethod.accountDetails.network && (
                <Text style={styles.infoText}>
                  • Réseau: {paymentMethod.accountDetails.network}
                </Text>
              )}
              {paymentMethod.accountDetails.bankName && (
                <Text style={styles.infoText}>
                  • Banque: {paymentMethod.accountDetails.bankName}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Montant */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Montant à retirer <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <Text style={styles.currency}>FCFA</Text>
            </View>
            {wallet && (
              <Text style={styles.hint}>
                Maximum: {wallet.balance.toLocaleString('fr-FR')} FCFA
              </Text>
            )}
          </View>

          {/* Nom du compte */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nom du compte <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.hint}>
              Le nom qui apparaîtra lors du transfert
            </Text>
          </View>

          {/* Numéro de compte */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {getAccountNumberLabel()} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={getAccountNumberPlaceholder()}
              placeholderTextColor="#9CA3AF"
              keyboardType={paymentMethod.type === 'bank_transfer' ? 'numeric' : 'default'}
            />
            <Text style={styles.hint}>
              Le numéro où vous souhaitez recevoir le paiement
            </Text>
          </View>

          {/* Avertissement */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Vérifiez bien le nom et le numéro de compte. Une erreur peut entraîner un retard ou une perte du paiement.
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
                <Text style={styles.submitButtonText}>Confirmer le retrait</Text>
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
  balanceContainer: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  instructionsContainer: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#FED7AA',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9A3412',
    marginBottom: 8,
  },
  infoContent: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#C2410C',
    lineHeight: 20,
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
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
    backgroundColor: '#EF4444',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
