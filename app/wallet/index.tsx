import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { useWalletStore } from '../../src/store/walletStore';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, transactions, loading, error, fetchWallet, fetchTransactions } = useWalletStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadWalletData();
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

  const formatTimeAgo = (date: Date | any) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : date.toDate?.() || new Date(date);
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    return `Il y a ${Math.floor(seconds / 86400)} j`;
  };

  if (loading && !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/wallet/settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Ionicons name="wallet" size={32} color="#10B981" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mon Portefeuille</Text>
            <Text style={styles.headerSubtitle}>Gérez votre solde et vos transactions</Text>
          </View>
        </View>
      </View>

      {/* Erreur */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Carte du portefeuille */}
      <LinearGradient
        colors={['#FBBF24', '#10B981', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.walletCard}
      >
        <View style={styles.balanceContainer}>
          <View>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>
              {wallet?.balance.toLocaleString('fr-FR') || '0'} FCFA
            </Text>
          </View>
          <Ionicons name="wallet-outline" size={64} color="rgba(0,0,0,0.1)" />
        </View>

        {wallet && wallet.pendingBalance > 0 && (
          <View style={styles.pendingBalance}>
            <Text style={styles.pendingLabel}>Solde en attente</Text>
            <Text style={styles.pendingAmount}>
              {wallet.pendingBalance.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => router.push('/wallet/deposit')}
          >
            <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Déposer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.transferButton]}
            onPress={() => router.push('/wallet/transfer')}
          >
            <Ionicons name="swap-horizontal" size={20} color="#FBBF24" />
            <Text style={[styles.actionText, { color: '#FBBF24' }]}>Transférer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => router.push('/wallet/withdraw')}
          >
            <Ionicons name="arrow-up-circle" size={20} color="#1F2937" />
            <Text style={[styles.actionText, { color: '#1F2937' }]}>Retirer</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Boutons secondaires */}
      <View style={styles.secondaryButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/wallet/history')}
        >
          <Ionicons name="time" size={24} color="#6B7280" />
          <View style={styles.secondaryButtonText}>
            <Text style={styles.secondaryButtonTitle}>Historique</Text>
            <Text style={styles.secondaryButtonSubtitle}>Voir toutes les transactions</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/wallet/settings')}
        >
          <Ionicons name="settings" size={24} color="#6B7280" />
          <View style={styles.secondaryButtonText}>
            <Text style={styles.secondaryButtonTitle}>Paramètres</Text>
            <Text style={styles.secondaryButtonSubtitle}>Code PIN et sécurité</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Transactions récentes */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Transactions récentes</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
          </View>
        ) : (
          <>
            {transactions.slice(0, 5).map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => router.push(`/wallet/transaction/${transaction.id}`)}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'deposit'
                            ? '#D1FAE5'
                            : transaction.type === 'withdrawal'
                            ? '#FEE2E2'
                            : '#DBEAFE',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        transaction.type === 'deposit'
                          ? 'arrow-down-circle'
                          : transaction.type === 'withdrawal'
                          ? 'arrow-up-circle'
                          : 'wallet'
                      }
                      size={20}
                      color={
                        transaction.type === 'deposit'
                          ? '#10B981'
                          : transaction.type === 'withdrawal'
                          ? '#EF4444'
                          : '#3B82F6'
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionDescription}>
                      {transaction.description || 
                       (transaction.type === 'deposit' ? 'Dépôt' :
                        transaction.type === 'withdrawal' ? 'Retrait' : 'Transaction')}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatTimeAgo(transaction.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === 'deposit'
                            ? '#10B981'
                            : transaction.type === 'withdrawal'
                            ? '#EF4444'
                            : '#1F2937',
                      },
                    ]}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.amount.toLocaleString('fr-FR')} FCFA
                  </Text>
                  <Text
                    style={[
                      styles.transactionStatus,
                      {
                        color:
                          transaction.status === 'completed'
                            ? '#10B981'
                            : transaction.status === 'pending'
                            ? '#F59E0B'
                            : transaction.status === 'failed'
                            ? '#EF4444'
                            : '#6B7280',
                      },
                    ]}
                  >
                    {transaction.status === 'completed'
                      ? 'Complété'
                      : transaction.status === 'pending'
                      ? 'En attente'
                      : transaction.status === 'failed'
                      ? 'Échoué'
                      : transaction.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {transactions.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/wallet/history')}
              >
                <Text style={styles.viewAllText}>Voir toutes les transactions</Text>
              </TouchableOpacity>
            )}
          </>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 20,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
  },
  walletCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#1F2937',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pendingBalance: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  pendingLabel: {
    fontSize: 12,
    color: '#1F2937',
    opacity: 0.9,
    marginBottom: 4,
  },
  pendingAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  depositButton: {
    backgroundColor: 'white',
  },
  transferButton: {
    backgroundColor: 'white',
  },
  withdrawButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    flex: 1,
  },
  secondaryButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  secondaryButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  viewAllButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
