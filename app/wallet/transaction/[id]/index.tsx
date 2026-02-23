import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../../../src/store/authStore';
import { useWalletStore } from '../../../../src/store/walletStore';

function TransactionDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { transactions } = useWalletStore();
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    if (id && transactions.length > 0) {
      const found = transactions.find((t) => t.id === id);
      setTransaction(found);
    }
  }, [id, transactions]);

  const formatDate = (date: Date | any) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-circle';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'payment':
      case 'transfer':
        return 'swap-horizontal';
      default:
        return 'wallet';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return '#10B981';
      case 'withdrawal':
        return '#EF4444';
      case 'payment':
      case 'transfer':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      case 'processing':
        return 'En cours';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'payment':
        return 'Paiement';
      case 'transfer':
        return 'Transfert';
      default:
        return type;
    }
  };

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la transaction</Text>
      </View>

      {/* Icône et montant */}
      <View style={styles.amountSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getTransactionColor(transaction.type) + '20' },
          ]}
        >
          <Ionicons
            name={getTransactionIcon(transaction.type) as any}
            size={48}
            color={getTransactionColor(transaction.type)}
          />
        </View>
        <Text
          style={[
            styles.amount,
            { color: getTransactionColor(transaction.type) },
          ]}
        >
          {transaction.type === 'deposit' ? '+' : '-'}
          {transaction.amount.toLocaleString('fr-FR')} FCFA
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(transaction.status) },
            ]}
          >
            {getStatusLabel(transaction.status)}
          </Text>
        </View>
      </View>

      {/* Détails */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Informations</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{getTypeLabel(transaction.type)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>
            {transaction.description || 'Aucune description'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(transaction.createdAt)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID Transaction</Text>
          <Text style={[styles.detailValue, styles.monoText]} numberOfLines={1}>
            {transaction.id}
          </Text>
        </View>

        {transaction.fees > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frais</Text>
            <Text style={styles.detailValue}>
              {transaction.fees.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        )}

        {transaction.totalAmount && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant total</Text>
            <Text style={styles.detailValue}>
              {transaction.totalAmount.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        )}
      </View>

      {/* Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Historique</Text>

        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Transaction créée</Text>
            <Text style={styles.timelineDate}>{formatDate(transaction.createdAt)}</Text>
          </View>
        </View>

        {transaction.status === 'completed' && (
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotSuccess]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Transaction complétée</Text>
              <Text style={styles.timelineDate}>{formatDate(transaction.updatedAt)}</Text>
            </View>
          </View>
        )}

        {transaction.status === 'failed' && (
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotError]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Transaction échouée</Text>
              <Text style={styles.timelineDate}>{formatDate(transaction.updatedAt)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bouton de partage */}
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={20} color="#1F2937" />
        <Text style={styles.shareButtonText}>Partager le reçu</Text>
      </TouchableOpacity>
    </ScrollView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  amountSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  timelineSection: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
    marginTop: 4,
  },
  timelineDotSuccess: {
    backgroundColor: '#10B981',
  },
  timelineDotError: {
    backgroundColor: '#EF4444',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
});

export default TransactionDetailPage;
