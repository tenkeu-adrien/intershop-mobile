import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCurrencyStore } from '../../../src/store/currencyStore';
import api from '../../../src/services/api';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { convertPrice, formatPrice } = useCurrencyStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert(t('common.error'), t('orders.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'processing': return '#8B5CF6';
      case 'shipped': return '#10B981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'confirmed': return 'checkmark-circle';
      case 'processing': return 'construct';
      case 'shipped': return 'airplane';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      t('orders.cancel_order'),
      t('orders.cancel_confirm'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/orders/${id}/cancel`);
              Alert.alert(t('common.success'), t('orders.cancelled_success'));
              loadOrder();
            } catch (error) {
              Alert.alert(t('common.error'), t('orders.cancel_error'));
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    router.push('/support');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>{t('orders.not_found')}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.orderNumber}>{t('orders.order')} #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
            <Ionicons name={getStatusIcon(order.status) as any} size={16} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {t(`orders.status_${order.status}`)}
            </Text>
          </View>
        </View>

        {order.trackingNumber && (
          <View style={styles.trackingCard}>
            <Ionicons name="location" size={20} color="#10B981" />
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>{t('orders.tracking_number')}</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          </View>
        )}

        {order.estimatedDelivery && (
          <View style={styles.deliveryCard}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>{t('orders.estimated_delivery')}</Text>
              <Text style={styles.deliveryDate}>
                {new Date(order.estimatedDelivery).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('orders.items')}</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Image
              source={{ uri: item.productImage || 'https://via.placeholder.com/80' }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName}
              </Text>
              <Text style={styles.itemQuantity}>
                {t('orders.quantity')}: {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(convertPrice(item.price))} × {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {formatPrice(convertPrice(item.total))}
            </Text>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('orders.shipping_address')}</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <Ionicons name="person" size={20} color="#6B7280" />
            <Text style={styles.addressText}>{order.shippingAddress.name}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="call" size={20} color="#6B7280" />
            <Text style={styles.addressText}>{order.shippingAddress.phone}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color="#6B7280" />
            <Text style={styles.addressText}>
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('orders.payment')}</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Ionicons name="card" size={20} color="#6B7280" />
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('orders.summary')}</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(convertPrice(order.subtotal))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(convertPrice(order.shipping))}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>
              {formatPrice(convertPrice(order.total))}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>{t('orders.cancel_order')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="help-circle" size={20} color="#3B82F6" />
          <Text style={styles.supportButtonText}>{t('orders.contact_support')}</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  paymentCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
    gap: 8,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    gap: 8,
  },
  supportButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});
