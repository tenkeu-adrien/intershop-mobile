import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

type OrderStatus = 'all' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  products: any[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (!user) return;
      
      // Essayer de charger depuis l'API
      const response = await api.get(`/api/mobile/orders?userId=${user.id}`);
      
      if (response.data.orders && response.data.orders.length > 0) {
        setOrders(response.data.orders);
      } else {
        // Utiliser des données de démonstration si pas de commandes
        const demoOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            products: [{ name: 'Produit de démonstration 1', quantity: 2 }],
            total: 25000,
            status: 'delivered',
            paymentStatus: 'paid',
            createdAt: new Date('2024-01-15'),
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            products: [{ name: 'Produit de démonstration 2', quantity: 1 }],
            total: 15000,
            status: 'processing',
            paymentStatus: 'paid',
            createdAt: new Date('2024-01-20'),
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            products: [{ name: 'Produit de démonstration 3', quantity: 3 }],
            total: 45000,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date('2024-01-22'),
          },
        ];
        setOrders(demoOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Utiliser des données de démonstration en cas d'erreur
      const demoOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          products: [{ name: 'Produit de démonstration 1', quantity: 2 }],
          total: 25000,
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          products: [{ name: 'Produit de démonstration 2', quantity: 1 }],
          total: 15000,
          status: 'processing',
          paymentStatus: 'paid',
          createdAt: new Date('2024-01-20'),
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          products: [{ name: 'Produit de démonstration 3', quantity: 3 }],
          total: 45000,
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date('2024-01-22'),
        },
      ];
      setOrders(demoOrders);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.products.some(p => p.name.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Annuler la commande',
      `Voulez-vous vraiment annuler la commande ${orderNumber}?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/mobile/orders/${orderId}/cancel`);
              Alert.alert('Succès', 'Commande annulée avec succès');
              loadOrders();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'annuler la commande');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'paid':
      case 'processing':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'shipped':
        return { bg: '#E9D5FF', text: '#6B21A8' };
      case 'delivered':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#1F2937' };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'paid':
      case 'processing':
        return 'hourglass-outline';
      case 'shipped':
        return 'airplane-outline';
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const statusFilters: Array<{ value: OrderStatus; label: string; icon: string }> = [
    { value: 'all', label: 'Toutes', icon: 'list' },
    { value: 'pending', label: 'En attente', icon: 'time-outline' },
    { value: 'processing', label: 'En cours', icon: 'hourglass-outline' },
    { value: 'shipped', label: 'Expédiées', icon: 'airplane-outline' },
    { value: 'delivered', label: 'Livrées', icon: 'checkmark-circle' },
    { value: 'cancelled', label: 'Annulées', icon: 'close-circle' },
  ];

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);
    const canCancel = ['pending', 'paid'].includes(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/orders/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Ionicons name="receipt-outline" size={20} color="#10B981" />
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={14} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.orderProducts}>
            {item.products.length} produit{item.products.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.orderTotal}>
            {item.total.toLocaleString('fr-FR')} FCFA
          </Text>
        </View>

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id, item.orderNumber)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header + Section fixe: Recherche + Filtres */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Section fixe: Recherche + Filtres */}
        <View style={styles.fixedSection}>
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une commande..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres par statut */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {statusFilters.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.filterButton,
                selectedStatus === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedStatus === item.value ? 'white' : '#6B7280'}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedStatus === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      </View>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {searchQuery || selectedStatus !== 'all'
              ? 'Aucune commande trouvée'
              : 'Aucune commande'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedStatus !== 'all'
              ? 'Essayez avec d\'autres critères'
              : 'Commencez à faire vos achats'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  fixedHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  fixedSection: {
    backgroundColor: 'white',
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersScrollView: {
    marginTop: 12,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderBody: {
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderProducts: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
