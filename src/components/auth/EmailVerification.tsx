import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface EmailVerificationProps {
  userId: string;
  email: string;
  displayName: string;
  onSuccess: () => void;
}

export default function EmailVerification({
  userId,
  email,
  displayName,
  onSuccess,
}: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(240); // 4 minutes
  const [canResend, setCanResend] = useState(false);

  // Timer pour l'expiration du code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gérer la saisie du code (seulement des chiffres)
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  // Vérifier le code
  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code à 6 chiffres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/mobile/verification/email/verify', {
        userId,
        code,
      });

      if (response.data.success) {
        Alert.alert('Succès', 'Email vérifié avec succès ! 🎉', [
          { text: 'OK', onPress: onSuccess },
        ]);
      } else {
        Alert.alert('Erreur', response.data.error || 'Code incorrect');
        setCode('');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.error || 'Code de vérification incorrect'
      );
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResend = async () => {
    setResending(true);

    try {
      const response = await api.post('/api/mobile/verification/email/send', {
        userId,
        email,
        displayName,
      });

      if (response.data.success) {
        Alert.alert('Succès', 'Un nouveau code a été envoyé à votre email');
        setTimer(240);
        setCanResend(false);
        setCode('');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.error || "Erreur lors de l'envoi du code"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Icône et titre */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={40} color="#10B981" />
        </View>
        <Text style={styles.title}>Vérifiez votre email</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code de vérification à
        </Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Ionicons name="time" size={20} color="#3B82F6" />
        <Text style={styles.timerText}>
          {timer > 0 ? `Code expire dans ${formatTime(timer)}` : 'Code expiré'}
        </Text>
      </View>

      {/* Input du code */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code de vérification</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={handleCodeChange}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          editable={!loading && timer > 0}
          textAlign="center"
        />
        <Text style={styles.hint}>Entrez le code à 6 chiffres</Text>
      </View>

      {/* Bouton de vérification */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          (loading || code.length !== 6 || timer === 0) &&
            styles.verifyButtonDisabled,
        ]}
        onPress={handleVerify}
        disabled={loading || code.length !== 6 || timer === 0}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.verifyButtonText}>Vérifier</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Bouton de renvoi */}
      <TouchableOpacity
        style={[
          styles.resendButton,
          (resending || !canResend) && styles.resendButtonDisabled,
        ]}
        onPress={handleResend}
        disabled={resending || !canResend}
      >
        {resending ? (
          <ActivityIndicator color="#6B7280" />
        ) : (
          <>
            <Ionicons name="refresh" size={20} color="#6B7280" />
            <Text style={styles.resendButtonText}>
              {canResend ? 'Renvoyer le code' : `Renvoyer (${formatTime(timer)})`}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Aide */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Vous ne recevez pas le code ?</Text>
        <Text style={styles.helpText}>
          • Vérifiez votre dossier spam/courrier indésirable
        </Text>
        <Text style={styles.helpText}>
          • Assurez-vous que l'adresse email est correcte
        </Text>
        <Text style={styles.helpText}>
          • Attendez quelques minutes avant de renvoyer
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
});
