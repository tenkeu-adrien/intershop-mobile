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
  Ionicons,
  Ionicons,
  Ionicons,
  Ionicons,
  Ionicons,
  Ionicons,
  Ionicons,
  Ionicons,
} from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDbInstance } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export default function MarketisteDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalUsage: 0,
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
      // Load marketing codes
      const codesQuery = query(
        collection(getDbInstance(), 'marketingCodes'),
        where('marketisteId', '==', user.id)
      );
      const codesSnapshot = await getDocs(codesQuery);
      const codes = codesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const activeCodes = codes.filter((c: any) => c.isActive);
      const totalUsage = codes.reduce((sum: number, c: any) => sum + (c.usageCount || 0), 0);

      // Load orders
      const ordersQuery = query(
        collection(getDbInstance(), 'orders'),
        where('marketisteId', '==', user.id)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalEarnings = orders.reduce((sum: number, order: any) => sum + (order.marketingCommission || 0), 0);
      const pendingEarnings = orders
        .filter((o: any) => o.status === 'pending' || o.status === 'paid')
        .reduce((sum: number, order: any) => sum + (order.marketingCommission || 0), 0);
      const paidEarnings = orders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, order: any) => sum + (order.marketingCommission || 0), 0);

      setStats({
        totalCodes: codes.length,
        activeCodes: activeCodes.length,
        totalOrders: orders.length,
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalUsage,
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickAction = ({ title, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={onPress}
    >
      <View style={[styles.quickActIonicons, { backgroundColor: color + '20' }]}>
        <Icon size={28} color={color} />
      </View>
      <Text style={styles.quickActIonicons}>{title}</Text>
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
        <Text style={styles.title}>Dashboard Marketiste</Text>
        <Text style={styles.subtitle}>Gérez vos codes et commissIonicons</Text>
      </View>

      {/* Earnings Cards */}
      <View style={styles.earningsSection}>
        <View style={[styles.earningCard, { backgroundColor: '#10B981' }]}>
          <Ionicons size={32} color="#FFFFFF" />
          <Text style={styles.earningLabel}>Gains totaux</Text>
          <Text style={styles.earningValue}>${stats.totalEarnings.toFixed(2)}</Text>
        </View>
        <View style={[styles.earningCard, { backgroundColor: '#F59E0B' }]}>
          <Ionicons size={32} color="#FFFFFF" />
          <Text style={styles.earningLabel}>En attente</Text>
          <Text style={styles.earningValue}>${stats.pendingEarnings.toFixed(2)}</Text>
        </View>
        <View style={[styles.earningCard, { backgroundColor: '#3B82F6' }]}>
          <Ionicons size={32} color="#FFFFFF" />
          <Text style={styles.earningLabel}>Payés</Text>
          <Text style={styles.earningValue}>${stats.paidEarnings.toFixed(2)}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Codes totaux"
          value={stats.totalCodes}
          icon={Ionicons}
          color="#F59E0B"
        />
        <StatCard
          title="Codes actifs"
          value={stats.activeCodes}
          icon={Ionicons}
          color="#10B981"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          icon={Ionicons}
          color="#8B5CF6"
          subtitle={`${stats.totalUsage} utilisatIonicons`}
        />
        <StatCard
          title="Taux moyen"
          value={stats.totalCodes > 0 ? '10%' : '0%'}
          icon={Ionicons}
          color="#6366F1"
        />
      </View>

      {/* Quick ActIonicons */}
      <View style={styles.section}>
        <Text style={styles.sectIonicons}>ActIonicons rapides</Text>
        <View style={styles.quickActIonicons}>
          <QuickAction
            title="Créer un code"
            icon={Ionicons}
            color="#10B981"
            onPress={() => {}}
          />
          <QuickAction
            title="Mes codes"
            icon={Ionicons}
            color="#F59E0B"
            onPress={() => {}}
          />
          <QuickAction
            title="Commandes"
            icon={Ionicons}
            color="#8B5CF6"
            onPress={() => {}}
          />
          <QuickAction
            title="Gains"
            icon={Ionicons}
            color="#10B981"
            onPress={() => {}}
          />
          <QuickAction
            title="Statistiques"
            icon={Ionicons}
            color="#3B82F6"
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
  earningsSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  earningCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.9,
  },
  earningValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  statSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectIonicons: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActIonicons: {
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
  quickActIonicons: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActIonicons: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});

