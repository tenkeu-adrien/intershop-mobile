import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const ROLES = [
    { value: 'client', label: t('auth.role_client', 'Client'), icon: '👤', description: t('auth.role_client_desc', 'Acheter des produits') },
    { value: 'fournisseur', label: t('auth.role_vendor', 'Fournisseur'), icon: '🏪', description: t('auth.role_vendor_desc', 'Vendre des produits') },
    { value: 'marketiste', label: t('auth.role_marketer', 'Marketiste'), icon: '📊', description: t('auth.role_marketer_desc', 'Codes marketing') },
  ];

  const handleRegister = async () => {
    setLocalError('');
    clearError();

    // Validation
    if (!displayName || !email || !password || !confirmPassword) {
      setLocalError(t('common.error_fields_required', 'Veuillez remplir tous les champs'));
      return;
    }

    if (!email.includes('@')) {
      setLocalError(t('auth.invalid_email', 'Email invalide'));
      return;
    }

    if (password.length < 6) {
      setLocalError(t('auth.error_password_too_short', 'Le mot de passe doit contenir au moins 6 caractères'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.error_passwords_mismatch', 'Les mots de passe ne correspondent pas'));
      return;
    }

    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim(), role);

      // Envoyer le code de vérification email
      const { user } = useAuthStore.getState();
      if (user) {
        try {
          await api.verification.sendEmailCode(user.id, user.email, user.displayName);
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
          // Continue même si l'envoi échoue
        }
      }

      Alert.alert(
        t('auth.success_registration_title', 'Inscription réussie!'),
        t('auth.success_registration_message', 'Vérifiez votre email pour activer votre compte.'),
        [
          {
            text: 'OK',
            onPress: () => router.replace('/verify-email'),
          },
        ]
      );
    } catch (err: any) {
      const errorMessage = err.message || t('auth.error_registration', 'Erreur lors de l\'inscription');
      setLocalError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#FBBF24', '#10B981', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle_register', "Rejoignez InterShop aujourd'hui")}</Text>
        </LinearGradient>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Nom complet */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="person" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('auth.name', 'Nom complet')}
              placeholderTextColor="#9CA3AF"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email', 'Email')}
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('auth.password', 'Mot de passe')}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirm_password', 'Confirmer le mot de passe')}
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Sélection du rôle */}
          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>{t('auth.iam_a', 'Je suis un:')}</Text>
            <View style={styles.rolesContainer}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={[
                    styles.roleCard,
                    role === r.value && styles.roleCardActive,
                  ]}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text
                    style={[
                      styles.roleLabel,
                      role === r.value && styles.roleLabelActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                  <Text style={styles.roleDescription}>{r.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Erreur */}
          {(localError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          {/* Bouton d'inscription */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Lien de connexion */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.already_account')} </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 40,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#1F2937',
    opacity: 0.8,
  },
  form: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: -20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  roleLabelActive: {
    color: '#10B981',
  },
  roleDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  registerGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

