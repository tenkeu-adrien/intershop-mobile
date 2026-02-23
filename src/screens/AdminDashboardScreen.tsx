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
  Ionicons,
  Ionicons,
} from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDbInstance } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalFournisseurs: number;
  totalMarketistes: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function AdminDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClients: 0,
    totalFournisseurs: 0,
    totalMarketistes: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(getDbInstance(), 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const clients = users.filter((u: any) => u.role === 'client');
      const fournisseurs = users.filter((u: any) => u.role === 'fournisseur');
      const marketistes = users.filter((u: any) => u.role === 'marketiste');

      // Load products
      const productsSnapshot = await getDocs(collection(getDbInstance(), 'products'));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeProducts = products.filter((p: any) => p.isActive);

      // Load orders
      const ordersSnapshot = await getDocs(collection(getDbInstance(), 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pendingOrders = orders.filter((o: any) => o.status === 'pending');
      
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyOrders = orders.filter((o: any) => {
        const orderDate = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
        return orderDate >= firstDayOfMonth;
      });
      const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalFournisseurs: fournisseurs.length,
        totalMarketistes: marketistes.length,
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        monthlyRevenue,
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
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de la plateforme</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Ionicons}
          color="#3B82F6"
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon={Ionicons}
          color="#10B981"
        />
        <StatCard
          title="Fournisseurs"
          value={stats.totalFournisseurs}
          icon={Ionicons}
          color="#8B5CF6"
        />
        <StatCard
          title="Marketistes"
          value={stats.totalMarketistes}
          icon={Ionicons}
          color="#F59E0B"
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts}
          icon={Ionicons}
          color="#6366F1"
        />
        <StatCard
          title="Actifs"
          value={stats.activeProducts}
          icon={Ionicons}
          color="#10B981"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          icon={Ionicons}
          color="#F97316"
        />
        <StatCard
          title="En attente"
          value={stats.pendingOrders}
          icon={Ionicons}
          color="#EF4444"
        />
      </View>

      {/* Revenue Cards */}
      <View style={styles.revenueSection}>
        <View style={styles.revenueCard}>
          <Ionicons size={32} color="#10B981" />
          <Text style={styles.revenueLabel}>Revenu total</Text>
          <Text style={styles.revenueValue}>${stats.totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.revenueCard}>
          <Ionicons size={32} color="#F59E0B" />
          <Text style={styles.revenueLabel}>Revenu mensuel</Text>
          <Text style={styles.revenueValue}>${stats.monthlyRevenue.toFixed(2)}</Text>
        </View>
      </View>

      {/* Quick ActIonicons */}
      <View style={styles.section}>
        <Text style={styles.sectIonicons}>ActIonicons rapides</Text>
        <View style={styles.quickActIonicons}>
          <QuickAction
            title="Utilisateurs"
            icon={Ionicons}
            color="#3B82F6"
            onPress={() => {}}
          />
          <QuickAction
            title="Produits"
            icon={Ionicons}
            color="#8B5CF6"
            onPress={() => {}}
          />
          <QuickAction
            title="Commandes"
            icon={Ionicons}
            color="#F97316"
          />
          <QuickAction
            title="Licences"
            icon={Ionicons}
            color="#3B82F6"
            onPress={() => {}}
          />
          <QuickAction
            title="Profils"
            icon={Ionicons}
            color="#EC4899"
            onPress={() => {}}
          />
          <QuickAction
            title="Messages"
            icon={Ionicons}
            color="#6366F1"
            onPress={() => {}}
          />
          <QuickAction
            title="Taux change"
            icon={Ionicons}
            color="#F59E0B"
            onPress={() => {}}
          />
          <QuickAction
            title="Paiements"
            icon={Ionicons}
            color="#10B981"
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
  revenueSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
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

