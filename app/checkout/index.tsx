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
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Domicile',
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
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour continuer');
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
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
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
        'Commande créée!',
        'Votre commande a été créée avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finaliser la commande</Text>
        </View>

        <View style={styles.content}>
          {/* Adresse de livraison */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Adresse de livraison</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nom complet <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.fullName}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, fullName: text }))}
                  placeholder="Jean Dupont"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Téléphone <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.phone}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, phone: text }))}
                  placeholder="+225 XX XX XX XX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Adresse <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.street}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, street: text }))}
                  placeholder="123 Rue de la République"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    Ville <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress.city}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                    placeholder="Abidjan"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Région/État</Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress.state}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
                    placeholder="Lagunes"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    Pays <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress.country}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, country: text }))}
                    placeholder="Côte d'Ivoire"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>
                    Code postal <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress.postalCode}
                    onChangeText={(text) => setNewAddress(prev => ({ ...prev, postalCode: text }))}
                    placeholder="00225"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Résumé de la commande */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Résumé de la commande</Text>
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
                    <Text style={styles.productQuantity}>Qté: {item.quantity}</Text>
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
                <Text style={styles.totalLabel}>Sous-total</Text>
                <Text style={styles.totalValue}>
                  {subtotal.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Frais de livraison</Text>
                <Text style={styles.totalValue}>
                  {shippingFee.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>

              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total</Text>
                <Text style={styles.totalValueFinal}>
                  {total.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
            </View>
          </View>

          {/* Bouton Commander */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={styles.orderButtonText}>Passer la commande</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            En passant commande, vous acceptez nos conditions générales de vente
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    padding: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
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
    borderBottomColor: '#E5E7EB',
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
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
  totals: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  orderButtonDisabled: {
    opacity: 0.5,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
