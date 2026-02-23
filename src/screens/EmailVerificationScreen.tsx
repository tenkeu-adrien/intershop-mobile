import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { IoMail, IoCheckmarkCircle } from 'react-icons/io5';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmailVerificationScreen({ navigation, route }: any) {
  const { user } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(240); // 4 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<any[]>([]);

  useEffect(() => {
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
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newCode.every(c => c !== '') && text) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement verification API call
      // await verifyEmailCode(user?.id, codeToVerify);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - navigate to phone verification or dashboard
      navigation.replace('PhoneVerification');
    } catch (err: any) {
      setError(err.message || 'Code incorrect');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      // TODO: Implement resend API call
      // await resendEmailCode(user?.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimer(240);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FBBF24', '#10B981', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.iconContainer}>
          <IoMail size={64} color="white" />
        </View>
        <Text style={styles.title}>Vérification Email</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code à 6 chiffres à
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      {/* Code Input */}
      <View style={styles.content}>
        <Text style={styles.instruction}>Entrez le code de vérification</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              Code expire dans {formatTime(timer)}
            </Text>
          ) : (
            <Text style={styles.expiredText}>Code expiré</Text>
          )}
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Resend Button */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={!canResend || loading}
          style={[
            styles.resendButton,
            (!canResend || loading) && styles.resendButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#10B981" />
          ) : (
            <Text
              style={[
                styles.resendText,
                (!canResend || loading) && styles.resendTextDisabled,
              ]}
            >
              {canResend ? 'Renvoyer le code' : `Renvoyer dans ${formatTime(timer)}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={() => handleVerify()}
          disabled={loading || code.some(c => !c)}
          style={styles.verifyButton}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.verifyGradient,
              (loading || code.some(c => !c)) && styles.verifyGradientDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <IoCheckmarkCircle size={24} color="white" />
                <Text style={styles.verifyText}>Vérifier</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Vous n'avez pas reçu le code? Vérifiez vos spams ou cliquez sur "Renvoyer"
        </Text>
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
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: -20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  codeInputFilled: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  codeInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  expiredText: {
    fontSize: 14,
    color: '#EF4444',
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
  resendButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#9CA3AF',
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  verifyGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyGradientDisabled: {
    opacity: 0.5,
  },
  verifyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
