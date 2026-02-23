import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  IoCartOutline,
  IoHeartOutline,
  IoWalletOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoHourglassOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export default function ClientDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    walletBalance: 0,
    wishlistCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('clientId', '==', user.id)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const pendingOrders = orders.filter((o: any) => 
        o.status === 'pending' || o.status === 'paid' || o.status === 'processing'
      );
      const completedOrders = orders.filter((o: any) => o.status === 'delivered');
      const cancelledOrders = orders.filter((o: any) => 
        o.status === 'cancelled' || o.status === 'refunded'
      );
      
      const totalSpent = completedOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      // Load wallet
      const walletDoc = await getDocs(query(
        collection(db, 'wallets'),
        where('userId', '==', user.id)
      ));
      const walletBalance = walletDoc.empty ? 0 : walletDoc.docs[0].data().balance;

      // Load wishlist (assuming it's stored in user document)
      const wishlistCount = user.wishlist?.length || 0;

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalSpent,
        walletBalance,
        wishlistCount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statCardHeader}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon size={28} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
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
      <View style={styles.header}>
        <Text style={styles.title}>Mon Dashboard</Text>
        <Text style={styles.subtitle}>Bienvenue {user?.displayName}</Text>
      </View>

      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <IoWalletOutline size={32} color="#FFFFFF" />
          <Text style={styles.walletLabel}>Solde du portefeuille</Text>
        </View>
        <Text style={styles.walletBalance}>${stats.walletBalance.toFixed(2)}</Text>
        <TouchableOpacity style={styles.walletButton}>
          <Text style={styles.walletButtonText}>Gérer mon portefeuille</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Commandes totales"
          value={stats.totalOrders}
          icon={IoCartOutline}
          color="#8B5CF6"
        />
        <StatCard
          title="En cours"
          value={stats.pendingOrders}
          icon={IoHourglassOutline}
          color="#F59E0B"
        />
        <StatCard
          title="Livrées"
          value={stats.completedOrders}
          icon={IoCheckmarkCircleOutline}
          color="#10B981"
        />
        <StatCard
          title="Annulées"
          value={stats.cancelledOrders}
          icon={IoCloseCircleOutline}
          color="#EF4444"
        />
        <StatCard
          title="Total dépensé"
          value={`$${stats.totalSpent.toFixed(0)}`}
          icon={IoCartOutline}
          color="#3B82F6"
        />
        <StatCard
          title="Favoris"
          value={stats.wishlistCount}
          icon={IoHeartOutline}
          color="#EC4899"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Mes commandes"
            icon={IoCartOutline}
            color="#8B5CF6"
            onPress={() => {}}
          />
          <QuickAction
            title="Mes favoris"
            icon={IoHeartOutline}
            color="#EC4899"
            onPress={() => {}}
          />
          <QuickAction
            title="Mon portefeuille"
            icon={IoWalletOutline}
            color="#10B981"
            onPress={() => {}}
          />
          <QuickAction
            title="Mes adresses"
            icon={IoLocationOutline}
            color="#3B82F6"
            onPress={() => {}}
          />
          <QuickAction
            title="Historique"
            icon={IoTimeOutline}
            color="#F59E0B"
            onPress={() => {}}
          />
        </View>
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
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  walletCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    opacity: 0.9,
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  walletButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});
