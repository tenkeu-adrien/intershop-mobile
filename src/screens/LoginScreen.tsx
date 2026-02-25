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
import LanguageSelector from '../components/LanguageSelector';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    clearError();

    // Validation
    if (!email || !password) {
      setLocalError(t('common.error_fields_required', 'Veuillez remplir tous les champs'));
      return;
    }

    if (!email.includes('@')) {
      setLocalError(t('auth.invalid_email', 'Email invalide'));
      return;
    }

    try {
      await signIn(email.trim().toLowerCase(), password);
      // Rediriger vers l'accueil après connexion réussie
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage = err.message || t('common.error_occurred', 'Erreur de connexion');
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
          {/* Language Selector */}
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector compact />
          </View>

          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.title}>InterShop</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle_login', 'Connectez-vous à votre compte')}</Text>
        </LinearGradient>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
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
              placeholder={t('auth.password')}
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

          {/* Mot de passe oublié */}
          <TouchableOpacity
            onPress={() => Alert.alert(t('common.info'), t('common.coming_soon', 'Fonctionnalité à venir'))}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>{t('auth.forgot_password')}</Text>
          </TouchableOpacity>

          {/* Erreur */}
          {(localError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          {/* Bouton de connexion */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Lien d'inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t('auth.no_account')} </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupLink}>{t('auth.register')}</Text>
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
    paddingTop: 80,
    alignItems: 'center',
    position: 'relative',
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
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
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

