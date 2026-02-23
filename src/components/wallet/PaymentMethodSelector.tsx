import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { usePaymentMethodsStore } from '../../store/paymentMethodsStore';
import type { PaymentMethod } from '../../types';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
  type: 'deposit' | 'withdrawal';
}

// Icônes par type de méthode
const getMethodIcon = (type: string) => {
  switch (type) {
    case 'mobile_money':
      return '📱';
    case 'mpesa':
      return '💳';
    case 'crypto':
      return '₿';
    case 'bank_transfer':
      return '🏦';
    default:
      return '💰';
  }
};

// Couleur par type
const getMethodColor = (type: string) => {
  switch (type) {
    case 'mobile_money':
      return '#D1FAE5';
    case 'mpesa':
      return '#DBEAFE';
    case 'crypto':
      return '#E9D5FF';
    case 'bank_transfer':
      return '#FED7AA';
    default:
      return '#F3F4F6';
  }
};

const getMethodBorderColor = (type: string) => {
  switch (type) {
    case 'mobile_money':
      return '#10B981';
    case 'mpesa':
      return '#3B82F6';
    case 'crypto':
      return '#A855F7';
    case 'bank_transfer':
      return '#F97316';
    default:
      return '#D1D5DB';
  }
};

export default function PaymentMethodSelector({
  onSelect,
  selectedMethodId,
  type
}: PaymentMethodSelectorProps) {
  const { paymentMethods, loading, error, fetchActivePaymentMethods } = usePaymentMethodsStore();

  useEffect(() => {
    fetchActivePaymentMethods();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FBBF24" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😕</Text>
        <Text style={styles.emptyTitle}>
          Aucune méthode de paiement disponible
        </Text>
        <Text style={styles.emptyText}>
          Veuillez réessayer plus tard ou contacter le support.
        </Text>
      </View>
    );
  }

  // Grouper par type
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  const typeLabels: Record<string, string> = {
    mobile_money: 'Mobile Money',
    mpesa: 'M-Pesa',
    crypto: 'Cryptomonnaie',
    bank_transfer: 'Virement Bancaire',
    other: 'Autres'
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {type === 'deposit' 
            ? 'Choisissez votre méthode de dépôt' 
            : 'Choisissez votre méthode de retrait'}
        </Text>
        <Text style={styles.subtitle}>
          Sélectionnez la méthode de paiement que vous souhaitez utiliser
        </Text>
      </View>

      {Object.entries(groupedMethods).map(([methodType, methodsList]) => (
        <View key={methodType} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{getMethodIcon(methodType)}</Text>
            <Text style={styles.sectionTitle}>
              {typeLabels[methodType] || methodType}
            </Text>
          </View>
          
          <View style={styles.methodsGrid}>
            {methodsList.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => onSelect(method)}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: selectedMethodId === method.id 
                      ? '#FEF3C7' 
                      : getMethodColor(method.type),
                    borderColor: selectedMethodId === method.id
                      ? '#FBBF24'
                      : getMethodBorderColor(method.type),
                  }
                ]}
              >
                <View style={styles.methodContent}>
                  {method.icon ? (
                    <Image 
                      source={{ uri: method.icon }}
                      style={styles.methodImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.methodIconLarge}>
                      {getMethodIcon(method.type)}
                    </Text>
                  )}
                  
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodDescription} numberOfLines={2}>
                      {method.instructions.substring(0, 80)}...
                    </Text>
                  </View>
                  
                  {selectedMethodId === method.id && (
                    <View style={styles.checkIcon}>
                      <Text style={styles.checkIconText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    margin: 20,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  methodsGrid: {
    gap: 12,
  },
  methodCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  methodIconLarge: {
    fontSize: 48,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
