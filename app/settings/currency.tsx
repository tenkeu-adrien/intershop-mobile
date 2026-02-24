import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCurrencyStore, SUPPORTED_CURRENCIES, SupportedCurrency } from '../../src/store/currencyStore';

export default function CurrencySettingsPage() {
  const router = useRouter();
  const {
    selectedCurrency,
    setCurrency,
    detectCurrencyFromLocation,
    loading,
    userCountry,
    isAutoDetected,
  } = useCurrencyStore();

  const handleSelectCurrency = (currency: SupportedCurrency) => {
    setCurrency(currency, true); // true = manuel
    router.back();
  };

  const handleAutoDetect = async () => {
    await detectCurrencyFromLocation();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devise</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Auto-detect Button */}
        <TouchableOpacity
          style={styles.autoDetectButton}
          onPress={handleAutoDetect}
          disabled={loading}
        >
          <View style={styles.autoDetectContent}>
            <Ionicons name="location" size={24} color="#3b82f6" />
            <View style={styles.autoDetectText}>
              <Text style={styles.autoDetectTitle}>Détecter automatiquement</Text>
              <Text style={styles.autoDetectSubtitle}>
                Basé sur votre localisation
                {userCountry && ` (${userCountry})`}
              </Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator color="#3b82f6" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          )}
        </TouchableOpacity>

        {/* Currency List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devises disponibles</Text>
          
          {Object.entries(SUPPORTED_CURRENCIES).map(([code, currency]) => {
            const isSelected = selectedCurrency === code;
            
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.currencyItem,
                  isSelected && styles.currencyItemSelected,
                ]}
                onPress={() => handleSelectCurrency(code as SupportedCurrency)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <View style={styles.currencyDetails}>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                    <Text style={styles.currencyCode}>
                      {currency.code} ({currency.symbol})
                    </Text>
                  </View>
                </View>
                
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Les prix sont convertis automatiquement selon la devise sélectionnée.
            Les taux de change sont mis à jour régulièrement.
          </Text>
        </View>

        {isAutoDetected && (
          <View style={styles.autoDetectedBadge}>
            <Ionicons name="location" size={16} color="#10b981" />
            <Text style={styles.autoDetectedText}>
              Devise détectée automatiquement
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  autoDetectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  autoDetectText: {
    flex: 1,
  },
  autoDetectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  autoDetectSubtitle: {
    fontSize: 14,
    color: '#3b82f6',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  currencyFlag: {
    fontSize: 32,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  autoDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  autoDetectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});
