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
} from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDbInstance } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export default function FournisseurDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalRestaurants: 0,
    totalHotels: 0,
    totalDatingProfiles: 0,
    totalOrders: 0,
    totalViews: 0,
    totalRevenue: 0,
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
      // Load products
      const productsQuery = query(
        collection(getDbInstance(), 'products'),
        where('fournisseurId', '==', user.id)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const ecommerceProducts = products.filter((p: any) => 
        !p.serviceCategory || p.serviceCategory === 'ecommerce'
      );
      const restaurants = products.filter((p: any) => p.serviceCategory === 'restaurant');
      const hotels = products.filter((p: any) => p.serviceCategory === 'hotel');
      const datingProfiles = products.filter((p: any) => p.serviceCategory === 'dating');
      
      const activeProducts = products.filter((p: any) => p.isActive);
      const totalViews = products.reduce((sum: number, p: any) => sum + (p.views || 0), 0);

      // Load orders
      const ordersQuery = query(
        collection(getDbInstance(), 'orders'),
        where('fournisseurId', '==', user.id)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

      setStats({
        totalProducts: ecommerceProducts.length,
        activeProducts: activeProducts.length,
        totalRestaurants: restaurants.length,
        totalHotels: hotels.length,
        totalDatingProfiles: datingProfiles.length,
        totalOrders: orders.length,
        totalViews,
        totalRevenue,
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
        <Text style={styles.title}>Dashboard Fournisseur</Text>
        <Text style={styles.subtitle}>Gérez vos produits et services</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Produits"
          value={stats.totalProducts}
          icon={Ionicons}
          color="#F97316"
        />
        <StatCard
          title="Actifs"
          value={stats.activeProducts}
          icon={Ionicons}
          color="#10B981"
        />
        <StatCard
          title="Restaurants"
          value={stats.totalRestaurants}
          icon={Ionicons}
          color="#EF4444"
        />
        <StatCard
          title="Hôtels"
          value={stats.totalHotels}
          icon={Ionicons}
          color="#3B82F6"
        />
        <StatCard
          title="Profils Dating"
          value={stats.totalDatingProfiles}
          icon={Ionicons}
          color="#EC4899"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          icon={Ionicons}
          color="#8B5CF6"
        />
        <StatCard
          title="Vues totales"
          value={stats.totalViews}
          icon={Ionicons}
          color="#6366F1"
        />
        <StatCard
          title="Revenu"
          value={`$${stats.totalRevenue.toFixed(0)}`}
          icon={Ionicons}
          color="#10B981"
        />
      </View>

      {/* Quick ActIonicons */}
      <View style={styles.section}>
        <Text style={styles.sectIonicons}>ActIonicons rapides</Text>
        <View style={styles.quickActIonicons}>
          <QuickAction
            title="Ajouter produit"
            icon={Ionicons}
            color="#F97316"
            onPress={() => {}}
          />
          <QuickAction
            title="Mes produits"
            icon={Ionicons}
            color="#8B5CF6"
            onPress={() => {}}
          />
          <QuickAction
            title="Restaurants"
            icon={Ionicons}
            color="#EF4444"
            onPress={() => {}}
          />
          <QuickAction
            title="Hôtels"
            icon={Ionicons}
            color="#3B82F6"
            onPress={() => {}}
          />
          <QuickAction
            title="Profils Dating"
            icon={Ionicons}
            color="#EC4899"
            onPress={() => {}}
          />
          <QuickAction
            title="Commandes"
            icon={Ionicons}
            color="#10B981"
            onPress={() => {}}
          />
          <QuickAction
            title="Licences"
            icon={Ionicons}
            color="#F59E0B"
            onPress={() => {}}
          />
          <QuickAction
            title="Statistiques"
            icon={Ionicons}
            color="#6366F1"
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

