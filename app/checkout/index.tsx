import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { Image } from 'react-native';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: t('addresses.default'),
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      Alert.alert(t('cart.login_required'), t('cart.login_required_message'));
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Pré-remplir avec les infos de l'utilisateur
    setNewAddress(prev => ({
      ...prev,
      fullName: user.displayName || '',
      phone: user.phoneNumber || '',
    }));
  }, [user, items]);

  const subtotal = getTotal();
  const shippingFee = 2000; // 2000 FCFA
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    // Validation
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || 
        !newAddress.city || !newAddress.country || !newAddress.postalCode) {
      Alert.alert(t('common.error'), t('checkout.error_fill_all_fields'));
      return;
    }

    setLoading(true);
    try {
      // TODO: Créer la commande via l'API
      // const orderData = {
      //   clientId: user.id,
      //   products: items,
      //   subtotal,
      //   shippingFee,
      //   total,
      //   shippingAddress: newAddress,
      // };
      // await api.orders.create(orderData);

      // Simuler la création de commande
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearCart();
      Alert.alert(
        t('checkout.success_title'),
        t('checkout.success_message'),
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {items.length.toString()} {items.length > 1 ? t('orders.items') : t('orders.item')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Indicateur de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, styles.progressCircleActive]}>
                <Ionicons name="cart" size={20} color="white" />
              </View>
              <Text style={[styles.progressLabel, styles.progressLabelActive]}>
                {t('cart.title')}
              </Text>
            </View>
            
            <View style={styles.progressLine} />
            
            <View style={styles.progressStep}>
              <View style={[styles.progressCircle, styles.progressCircleActive]}>
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text style={[styles.progressLabel, styles.progressLabelActive]}>
                {t('checkout.shipping_address')}
              </Text>
            </View>
            
            <View style={styles.progressLine} />
            
            <View style={styles.progressStep}>
              <View style={styles.progressCircle}>
                <Ionicons name="checkmark-circle" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.progressLabel}>
                {t('checkout.confirmation')}
              </Text>
            </View>
          </View>

          {/* Adresse de livraison */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location" size={24} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{t('checkout.shipping_address')}</Text>
                  <Text style={styles.cardSubtitle}>{t('checkout.enter_delivery_address')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('addresses.full_name')} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newAddress.fullName}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, fullName: text }))}
                    placeholder={t('checkout.placeholder_full_name')}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('addresses.phone')} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newAddress.phone}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, phone: text }))}
                    placeholder={t('checkout.placeholder_phone')}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('addresses.address_line1')} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="home-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newAddress.street}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, street: text }))}
                    placeholder={t('checkout.placeholder_address')}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    {t('addresses.city')} <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.city}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                      placeholder={t('checkout.placeholder_city')}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>{t('addresses.state')}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="map-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.state}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
                      placeholder={t('checkout.placeholder_state')}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    {t('addresses.country')} <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="flag-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.country}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, country: text }))}
                      placeholder={t('checkout.placeholder_country')}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    {t('addresses.postal_code')} <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={newAddress.postalCode}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, postalCode: text }))}
                      placeholder={t('checkout.placeholder_postal')}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Résumé de la commande */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="receipt" size={24} color="#FBBF24" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{t('checkout.order_summary')}</Text>
                  <Text style={styles.cardSubtitle}>
                    {items.length.toString()} {items.length > 1 ? t('orders.items') : t('orders.item')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Produits */}
            <View style={styles.products}>
              {items.map((item) => (
                <View key={item.productId} style={styles.productItem}>
                  <Image
                    source={{ uri: item.product.images[0] }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <View style={styles.productMeta}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>
                          {t('cart.quantity')}: {item.quantity.toString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.productPrice}>
                      {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Totaux */}
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('checkout.subtotal')}</Text>
                <Text style={styles.totalValue}>
                  {subtotal.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              <View style={styles.totalRow}>
                <View style={styles.shippingLabel}>
                  <Ionicons name="car-outline" size={16} color="#6B7280" />
                  <Text style={styles.totalLabel}>{t('checkout.shipping')}</Text>
                </View>
                <Text style={styles.totalValue}>
                  {shippingFee.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>{t('checkout.total')}</Text>
                <Text style={styles.totalValueFinal}>
                  {total.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>
          </View>

          {/* Bouton Commander avec gradient */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
              style={styles.orderButton}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.orderButtonText}>{t('checkout.place_order')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Garanties */}
          <View style={styles.guarantees}>
            <View style={styles.guaranteeItem}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.guaranteeText}>{t('checkout.secure_payment')}</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="lock-closed" size={20} color="#10B981" />
              <Text style={styles.guaranteeText}>{t('checkout.data_protected')}</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="return-up-back" size={20} color="#10B981" />
              <Text style={styles.guaranteeText}>{t('checkout.easy_returns')}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            {t('checkout.terms_agreement')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#10B981',
  },
  progressLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  products: {
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quantityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  totals: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shippingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRowFinal: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderButton: {
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  orderButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  guarantees: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  guaranteeItem: {
    alignItems: 'center',
    flex: 1,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
