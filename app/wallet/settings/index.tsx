import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useWalletStore } from '../../../src/store/walletStore';
import api from '../../../src/services/api';

type ResetStep = 'idle' | 'email-sent' | 'code-verified';

function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, createPIN, updatePIN, fetchWallet, loading } = useWalletStore();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // États pour la réinitialisation du PIN
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('idle');
  const [resetCode, setResetCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWallet(user.id);
  }, [user]);

  const handleSetPIN = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      setError('Le code PIN doit contenir entre 4 et 6 chiffres');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('Le code PIN ne doit contenir que des chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    if (!user) return;

    try {
      // Rafraîchir le wallet pour avoir l'état le plus récent
      await fetchWallet(user.id);
      const currentWallet = useWalletStore.getState().wallet;

      // Si un PIN existe déjà
      if (currentWallet?.pin) {
        // En mode reset (code vérifié), on peut créer un nouveau PIN
        if (resetStep === 'code-verified') {
          await createPIN(user.id, newPin);
        } else {
          // Sinon, il faut vérifier l'ancien PIN
          if (!currentPin) {
            setError('Veuillez entrer votre code PIN actuel ou utiliser "PIN oublié"');
            return;
          }
          await updatePIN(user.id, currentPin, newPin);
        }
      } else {
        // Aucun PIN n'existe, on peut en créer un
        await createPIN(user.id, newPin);
      }

      setSuccess(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setResetStep('idle');
      setShowResetModal(false);
      
      await fetchWallet(user.id);
      Alert.alert('Succès', 'Code PIN configuré avec succès!');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    }
  };

  const handleSendResetCode = async () => {
    if (!user) return;

    setSendingCode(true);
    setError('');

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/wallet/pin/send-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          displayName: user.displayName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du code');
      }

      setResetStep('email-sent');
      Alert.alert('Succès', 'Code envoyé par email!');

      // En dev, afficher le code
      if (data.code) {
        console.log('🔑 Code de réinitialisation:', data.code);
        Alert.alert('Code (dev)', data.code);
      }

    } catch (err: any) {
      setError(err.message);
      Alert.alert('Erreur', err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyResetCode = async () => {
    if (!user || !resetCode) return;

    setVerifyingCode(true);
    setError('');

    try {
      const response = await fetch(`${api.defaults.baseURL}/api/wallet/pin/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          code: resetCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code incorrect');
      }

      setResetStep('code-verified');
      setShowResetModal(false);
      Alert.alert('Succès', 'Code vérifié! Vous pouvez maintenant définir un nouveau PIN.');

    } catch (err: any) {
      setError(err.message);
      Alert.alert('Erreur', err.message);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
    setResetStep('idle');
    setResetCode('');
    setError('');
  };

  if (loading && !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FBBF24" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Paramètres du portefeuille</Text>
            <Text style={styles.headerSubtitle}>
              Gérez la sécurité de votre portefeuille
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Statut du PIN */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Code PIN</Text>
            </View>

            <View style={styles.statusRow}>
              {wallet?.pin ? (
                <View style={styles.statusContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusText}>Code PIN configuré</Text>
                </View>
              ) : (
                <View style={[styles.statusContainer, styles.statusWarning]}>
                  <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                  <Text style={[styles.statusText, styles.statusTextWarning]}>
                    Aucun code PIN configuré
                  </Text>
                </View>
              )}
              
              {wallet?.pin && resetStep !== 'code-verified' && (
                <TouchableOpacity
                  onPress={() => setShowResetModal(true)}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotButtonText}>PIN oublié?</Text>
                </TouchableOpacity>
              )}
            </View>

            {resetStep === 'code-verified' && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.successBannerText}>
                  Code vérifié! Vous pouvez maintenant définir un nouveau code PIN.
                </Text>
              </View>
            )}

            <Text style={styles.description}>
              Le code PIN est requis pour effectuer des retraits et des paiements importants.
              Il doit contenir entre 4 et 6 chiffres.
            </Text>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* PIN actuel */}
              {wallet?.pin && resetStep !== 'code-verified' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Code PIN actuel</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={currentPin}
                      onChangeText={(text) => setCurrentPin(text.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showCurrentPin}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPin(!showCurrentPin)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showCurrentPin ? 'eye-off' : 'eye'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Nouveau PIN */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {wallet?.pin ? 'Nouveau code PIN' : 'Code PIN'} (4-6 chiffres)
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newPin}
                    onChangeText={(text) => setNewPin(text.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPin}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPin(!showNewPin)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPin ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {newPin && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${(newPin.length / 6) * 100}%`,
                            backgroundColor:
                              newPin.length < 4
                                ? '#EF4444'
                                : newPin.length === 4
                                ? '#F59E0B'
                                : '#10B981',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.strengthText}>{newPin.length}/6</Text>
                  </View>
                )}
              </View>

              {/* Confirmer PIN */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le code PIN</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmPin}
                    onChangeText={(text) => setConfirmPin(text.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPin}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPin(!showConfirmPin)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPin ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPin && newPin && (
                  <Text
                    style={[
                      styles.matchText,
                      { color: confirmPin === newPin ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {confirmPin === newPin
                      ? '✓ Les codes PIN correspondent'
                      : '✗ Les codes PIN ne correspondent pas'}
                  </Text>
                )}
              </View>

              {/* Messages */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {success && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.successText}>
                    Code PIN {wallet?.pin ? 'modifié' : 'configuré'} avec succès !
                  </Text>
                </View>
              )}

              {/* Bouton */}
              <TouchableOpacity
                onPress={handleSetPIN}
                disabled={loading || !newPin || newPin.length < 4 || newPin !== confirmPin}
                style={[
                  styles.submitButton,
                  (loading || !newPin || newPin.length < 4 || newPin !== confirmPin) &&
                    styles.submitButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {wallet?.pin ? 'Modifier le code PIN' : 'Définir le code PIN'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Conseils de sécurité */}
          <View style={styles.securityCard}>
            <Text style={styles.securityTitle}>🔒 Conseils de sécurité</Text>
            <View style={styles.securityList}>
              <Text style={styles.securityItem}>
                • Ne partagez jamais votre code PIN avec qui que ce soit
              </Text>
              <Text style={styles.securityItem}>
                • Utilisez un code PIN unique que vous seul connaissez
              </Text>
              <Text style={styles.securityItem}>
                • Évitez les codes PIN évidents (1234, 0000, etc.)
              </Text>
              <Text style={styles.securityItem}>
                • Après 3 tentatives incorrectes, votre compte sera bloqué pendant 30 minutes
              </Text>
              <Text style={styles.securityItem}>
                • Changez régulièrement votre code PIN pour plus de sécurité
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de réinitialisation du PIN */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelReset}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color="#FBBF24" />
              <Text style={styles.modalTitle}>Réinitialiser le PIN</Text>
            </View>

            {resetStep === 'idle' && (
              <>
                <Text style={styles.modalText}>
                  Nous allons vous envoyer un code de vérification par email pour réinitialiser votre code PIN.
                </Text>

                <View style={styles.emailBanner}>
                  <Ionicons name="mail" size={20} color="#F59E0B" />
                  <View style={styles.emailBannerContent}>
                    <Text style={styles.emailBannerTitle}>Email de vérification</Text>
                    <Text style={styles.emailBannerText}>
                      Le code sera envoyé à: {user?.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleCancelReset}
                    disabled={sendingCode}
                    style={[styles.modalButton, styles.modalButtonCancel]}
                  >
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendResetCode}
                    disabled={sendingCode}
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                  >
                    {sendingCode ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="mail" size={20} color="white" />
                        <Text style={styles.modalButtonTextConfirm}>Envoyer</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {resetStep === 'email-sent' && (
              <>
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View>
                    <Text style={styles.successBannerTitle}>Code envoyé!</Text>
                    <Text style={styles.successBannerText}>
                      Vérifiez votre boîte email et entrez le code ci-dessous.
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Code de vérification (6 chiffres)</Text>
                  <TextInput
                    style={styles.codeInput}
                    value={resetCode}
                    onChangeText={(text) => setResetCode(text.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <Text style={styles.codeHint}>
                    Le code expire dans 10 minutes
                  </Text>
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleCancelReset}
                    disabled={verifyingCode}
                    style={[styles.modalButton, styles.modalButtonCancel]}
                  >
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleVerifyResetCode}
                    disabled={verifyingCode || resetCode.length !== 6}
                    style={[
                      styles.modalButton,
                      styles.modalButtonConfirm,
                      (verifyingCode || resetCode.length !== 6) && styles.submitButtonDisabled
                    ]}
                  >
                    {verifyingCode ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.modalButtonTextConfirm}>Vérifier</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSendResetCode}
                  disabled={sendingCode}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>Renvoyer le code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusWarning: {
    // No additional styles needed
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statusTextWarning: {
    color: '#F59E0B',
  },
  forgotButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  forgotButtonText: {
    fontSize: 14,
    color: '#FBBF24',
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  successBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  successBannerText: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 8,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  matchText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  securityCard: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 16,
    padding: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  securityList: {
    gap: 8,
  },
  securityItem: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  emailBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  emailBannerContent: {
    flex: 1,
  },
  emailBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  emailBannerText: {
    fontSize: 14,
    color: '#92400E',
  },
  codeInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#1F2937',
  },
  codeHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalButtonConfirm: {
    backgroundColor: '#10B981',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default SettingsPage;
