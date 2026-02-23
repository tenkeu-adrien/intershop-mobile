import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import api from '../../../src/services/api';

interface OrderDetail {
  id: string;
  orderNumber: string;
  products: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [params.id, user]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/mobile/orders/${params.id}`);
      setOrder(response.data.order);
    } catch (error: any) {
      console.error('Error loading order:', error);
      
      // Utiliser des données de démo si l'API échoue
      const demoOrder: OrderDetail = {
        id: params.id as string,
        orderNumber: `ORD-2024-${params.id}`,
        products: [
          {
            id: '1',
            name: 'Produit de démonstration 1',
            image: 'https://via.placeholder.com/100',
            quantity: 2,
            price: 12500,
          },
          {
            id: '2',
            name: 'Produit de démonstration 2',
            image: 'https://via.placeholder.com/100',
            quantity: 1,
            price: 8000,
          },
        ],
        subtotal: 33000,
        shippingFee: 2000,
        total: 35000,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'Mobile Money',
        shippingAddress: {
          fullName: 'Jean Dupont',
          phone: '+225 07 XX XX XX XX',
          street: '123 Rue de la République',
          city: 'Abidjan',
          state: 'Lagunes',
          country: 'Côte d\'Ivoire',
          postalCode: '00225',
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      };
      setOrder(demoOrder);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;

    Alert.alert(
      'Annuler la commande',
      `Voulez-vous vraiment annuler la commande ${order.orderNumber}?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`/api/mobile/orders/${order.id}/cancel`);
              Alert.alert('Succès', 'Commande annulée avec succès');
              loadOrder();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'annuler la commande');
            } finally {
              setCancelling(false);
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

  const canCancelOrder = (status: string) => {
    return ['pending', 'paid', 'processing'].includes(status);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color="#EF4444" />
        <Text style={styles.errorTitle}>Commande introuvable</Text>
        <TouchableOpacity
          style={styles.backToOrdersButton}
          onPress={() => router.push('/orders')}
        >
          <Text style={styles.backToOrdersButtonText}>Retour aux commandes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la commande</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Numéro de commande et statut */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Produits */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Produits</Text>
          {order.products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productQuantity}>Qté: {product.quantity}</Text>
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
              <Text style={styles.productTotal}>
                {(product.price * product.quantity).toLocaleString('fr-FR')} FCFA
              </Text>
            </View>
          ))}
        </View>

        {/* Adresse de livraison */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <View style={styles.addressContent}>
            <Ionicons name="location" size={24} color="#10B981" />
            <View style={styles.addressText}>
              <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
              <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
              <Text style={styles.addressLine}>{order.shippingAddress.street}</Text>
              <Text style={styles.addressLine}>
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              </Text>
              <Text style={styles.addressLine}>
                {order.shippingAddress.country} - {order.shippingAddress.postalCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Résumé du paiement */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Résumé du paiement</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>
              {order.subtotal.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de livraison</Text>
            <Text style={styles.summaryValue}>
              {order.shippingFee.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryValueTotal}>
              {order.total.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>

          {order.paymentMethod && (
            <View style={styles.paymentMethod}>
              <Ionicons name="card" size={20} color="#6B7280" />
              <Text style={styles.paymentMethodText}>
                Payé par {order.paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton annuler */}
        {canCancelOrder(order.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Annuler la commande</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
  },
  backToOrdersButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backToOrdersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  addressContent: {
    flexDirection: 'row',
  },
  addressText: {
    marginLeft: 12,
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
