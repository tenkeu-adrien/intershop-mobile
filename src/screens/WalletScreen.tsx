import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, transactions, fetchWallet, fetchTransactions, loading } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    await fetchWallet(user.id);
    await fetchTransactions(user.id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#FBBF24';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'failed': return 'Échoué';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet-outline" size={32} color="#FBBF24" />
          <Text style={styles.balanceLabel}>Solde disponible</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {wallet?.balance.toLocaleString('fr-FR') || '0'} FCFA
        </Text>
        {wallet && wallet.pendingBalance > 0 && (
          <Text style={styles.pendingBalance}>
            En attente: {wallet.pendingBalance.toLocaleString('fr-FR')} FCFA
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => router.push('/wallet/deposit' as any)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          <Text style={styles.actionText}>Déposer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={() => router.push('/wallet/withdraw' as any)}
        >
          <Ionicons name="remove-circle-outline" size={24} color="#FFF" />
          <Text style={styles.actionText}>Retirer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => router.push('/wallet/transfer' as any)}
        >
          <Ionicons name="swap-horizontal-outline" size={24} color="#FFF" />
          <Text style={styles.actionText}>Transférer</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions History */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Historique</Text>
          <TouchableOpacity onPress={() => router.push('/wallet/history' as any)}>
            <Text style={styles.viewAllText}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucune transaction</Text>
          </View>
        ) : (
          transactions.slice(0, 10).map((transaction) => (
            <TouchableOpacity 
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => router.push(`/wallet/transaction/${transaction.id}` as any)}
            >
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'deposit' ? '#D1FAE5' : '#FEE2E2' }
                ]}>
                  {transaction.type === 'deposit' ? (
                    <Ionicons name="add-circle-outline" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="remove-circle-outline" size={20} color="#EF4444" />
                  )}
                </View>
                <View>
                  <Text style={styles.transactionType}>
                    {transaction.type === 'deposit' ? 'Dépôt' : 
                     transaction.type === 'withdrawal' ? 'Retrait' : 
                     transaction.type === 'payment' ? 'Paiement' : 'Remboursement'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {transaction.createdAt instanceof Date 
                      ? transaction.createdAt.toLocaleDateString('fr-FR')
                      : transaction.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'deposit' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {transaction.amount.toLocaleString('fr-FR')} FCFA
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(transaction.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) }
                  ]}>
                    {getStatusText(transaction.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  balanceCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  pendingBalance: {
    fontSize: 14,
    color: '#FBBF24',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  historyContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FBBF24',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
