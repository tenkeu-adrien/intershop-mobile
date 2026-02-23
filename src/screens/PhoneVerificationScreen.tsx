import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { IoCall, IoCheckmarkCircle } from 'react-icons/io5';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function PhoneVerificationScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<any[]>([]);

  useEffect(() => {
    if (step === 'code') {
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
  }, [step]);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement send SMS API call
      // await sendPhoneVerificationCode(user?.id, phoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('code');
      setTimer(120);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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
      // await verifyPhoneCode(user?.id, codeToVerify);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - navigate to dashboard or pending approval
      if (user?.role === 'fournisseur' || user?.role === 'marketiste') {
        navigation.replace('PendingApproval');
      } else {
        navigation.replace('Main');
      }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimer(120);
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
          <IoCall size={64} color="white" />
        </View>
        <Text style={styles.title}>Vérification Téléphone</Text>
        <Text style={styles.subtitle}>
          {step === 'phone'
            ? 'Entrez votre numéro de téléphone'
            : 'Entrez le code reçu par SMS'}
        </Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {step === 'phone' ? (
          // Phone Number Input
          <>
            <Text style={styles.instruction}>Numéro de téléphone</Text>
            
            <View style={styles.phoneContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇨🇲 +237</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="6 XX XX XX XX"
                keyboardType="phone-pad"
                maxLength={9}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSendCode}
              disabled={loading}
              style={styles.sendButton}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.sendText}>Envoyer le code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Vous recevrez un code de vérification par SMS
            </Text>
          </>
        ) : (
          // Code Input
          <>
            <Text style={styles.instruction}>Code de vérification</Text>
            <Text style={styles.phoneDisplay}>+237 {phoneNumber}</Text>

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

            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Code expire dans {formatTime(timer)}
                </Text>
              ) : (
                <Text style={styles.expiredText}>Code expiré</Text>
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

            <TouchableOpacity
              onPress={() => setStep('phone')}
              style={styles.changeNumberButton}
            >
              <Text style={styles.changeNumberText}>Changer de numéro</Text>
            </TouchableOpacity>
          </>
        )}
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
    textAlign: 'center',
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
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  countryCode: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
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
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sendGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 16,
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
  changeNumberButton: {
    padding: 12,
    alignItems: 'center',
  },
  changeNumberText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
