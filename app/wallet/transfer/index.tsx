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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../src/store/authStore';
import { useWalletStore } from '../../../src/store/walletStore';
import api from '../../../src/services/api';
import type { User } from '../../../src/types';

type Step = 'search' | 'confirm' | 'pin' | 'success';

function TransferPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, processPayment, verifyPIN, fetchWallet } = useWalletStore();

  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWallet(user.id);
  }, [user, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      Alert.alert('Erreur', 'Entrez au moins 2 caractères pour rechercher');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setSearching(true);
    try {
      console.log('🔍 [Transfer] Searching users:', searchQuery);
      const response = await api.users.search(searchQuery.trim(), user.id);
      
      if (response.success) {
        setSearchResults(response.users);
        console.log(`✅ [Transfer] Found ${response.users.length} users`);
        
        if (response.users.length === 0) {
          Alert.alert('Aucun résultat', 'Aucun utilisateur trouvé');
        }
      } else {
        throw new Error(response.error || 'Erreur lors de la recherche');
      }
    } catch (error: any) {
      console.error('❌ [Transfer] Search error:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleContinueToConfirm = () => {
    if (!selectedUser) {
      Alert.alert('Erreur', 'Sélectionnez un destinataire');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }

    if (!wallet || amountNum > wallet.balance) {
      Alert.alert('Erreur', 'Solde insuffisant');
      return;
    }

    setStep('confirm');
  };

  const handleContinueToPin = () => {
    setStep('pin');
  };

  const handleTransfer = async () => {
    if (!user || !selectedUser) return;

    const amountNum = parseFloat(amount);

    setLoading(true);
    try {
      // Vérifier le PIN
      await verifyPIN(user.id, pin);

      // Effectuer le transfert
      await processPayment(user.id, {
        toUserId: selectedUser.id,
        amount: amountNum,
        description: description || `Transfert vers ${selectedUser.displayName}`,
        pin
      });

      setStep('success');
      Alert.alert('Succès', 'Transfert effectué avec succès!');
    } catch (error: any) {
      console.error('Error transferring:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransfer = () => {
    setStep('search');
    setSelectedUser(null);
    setAmount('');
    setPin('');
    setDescription('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
      {/* Header */}
      <LinearGradient
        colors={['#FBBF24', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="swap-horizontal" size={32} color="#1F2937" />
          <Text style={styles.headerTitle}>Transférer des fonds</Text>
          <Text style={styles.headerSubtitle}>
            Envoyez de l'argent à un autre utilisateur
          </Text>
        </View>
      </LinearGradient>

      {/* Solde disponible */}
      {wallet && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>
            {wallet.balance.toLocaleString('fr-FR')} FCFA
          </Text>
        </View>
      )}

      {/* Étapes */}
      <View style={styles.content}>
        {/* Étape 1: Recherche */}
        {step === 'search' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Rechercher le destinataire</Text>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Email ou numéro de téléphone"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                onPress={handleSearch}
                disabled={searching}
                style={styles.searchButton}
              >
                {searching ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    onPress={() => handleSelectUser(result)}
                    style={styles.resultItem}
                  >
                    <View style={styles.resultAvatar}>
                      <Text style={styles.resultAvatarText}>
                        {result.displayName?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{result.displayName}</Text>
                      <Text style={styles.resultEmail}>{result.email}</Text>
                      {result.phoneNumber && (
                        <Text style={styles.resultPhone}>{result.phoneNumber}</Text>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Utilisateur sélectionné */}
            {selectedUser && (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserHeader}>
                  <View style={styles.selectedUserAvatar}>
                    <Text style={styles.selectedUserAvatarText}>
                      {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.selectedUserInfo}>
                    <Text style={styles.selectedUserName}>
                      {selectedUser.displayName}
                    </Text>
                    <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedUser(null)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Montant */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Montant (FCFA)</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  {wallet && (
                    <Text style={styles.hint}>
                      Maximum: {wallet.balance.toLocaleString('fr-FR')} FCFA
                    </Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ex: Remboursement, Cadeau..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleContinueToConfirm}
                  style={styles.continueButton}
                >
                  <Text style={styles.continueButtonText}>Continuer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Étape 2: Confirmation */}
        {step === 'confirm' && selectedUser && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Confirmer le transfert</Text>

            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Vérifiez les informations</Text>
                <Text style={styles.warningText}>
                  Assurez-vous que toutes les informations sont correctes avant de continuer.
                </Text>
              </View>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Destinataire</Text>
                <Text style={styles.summaryValue}>{selectedUser.displayName}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email</Text>
                <Text style={styles.summaryValue}>{selectedUser.email}</Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
                <Text style={styles.summaryLabel}>Montant</Text>
                <Text style={styles.summaryValueHighlight}>
                  {parseFloat(amount).toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              {description && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Description</Text>
                  <Text style={styles.summaryValue}>{description}</Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nouveau solde</Text>
                <Text style={styles.summaryValue}>
                  {((wallet?.balance || 0) - parseFloat(amount)).toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setStep('search')}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinueToPin}
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Étape 3: PIN */}
        {step === 'pin' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Sécurité</Text>

            <View style={[styles.warningBox, styles.securityBox]}>
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, styles.securityTitle]}>
                  Code PIN requis
                </Text>
                <Text style={[styles.warningText, styles.securityText]}>
                  Pour votre sécurité, veuillez entrer votre code PIN pour confirmer ce transfert.
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Code PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setStep('confirm')}
                disabled={loading}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTransfer}
                disabled={loading || !pin}
                style={[styles.button, styles.confirmButton]}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Transférer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Étape 4: Succès */}
        {step === 'success' && selectedUser && (
          <View style={styles.card}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>

              <Text style={styles.successTitle}>Transfert réussi!</Text>
              <Text style={styles.successText}>
                Votre transfert a été effectué avec succès
              </Text>

              <View style={styles.successSummary}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Montant transféré</Text>
                  <Text style={styles.successAmount}>
                    {parseFloat(amount).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Destinataire</Text>
                  <Text style={styles.successValue}>{selectedUser.displayName}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Nouveau solde</Text>
                  <Text style={styles.successValue}>
                    {(wallet?.balance || 0).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleNewTransfer}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Nouveau transfert</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/wallet')}
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={styles.confirmButtonText}>Retour au portefeuille</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#1F2937',
    opacity: 0.8,
    marginTop: 4,
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  resultPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedUserContainer: {
    marginTop: 20,
  },
  selectedUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedUserAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedUserEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
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
  amountInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
  pinInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityBox: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  securityTitle: {
    color: '#1E3A8A',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  securityText: {
    color: '#1E40AF',
  },
  summaryContainer: {
    gap: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  summaryRowHighlight: {
    backgroundColor: '#D1FAE5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryValueHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  buttonRow: {
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
  confirmButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  successSummary: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  successAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  successValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default TransferPage;
