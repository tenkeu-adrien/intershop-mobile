import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

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

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      // TODO: Charger les adresses depuis l'API
      // const response = await api.addresses.getByUser(user.id);
      // setAddresses(response.addresses);
      
      // Données de démonstration
      const demoAddresses: Address[] = [
        {
          id: '1',
          label: 'Domicile',
          fullName: 'Jean Dupont',
          phone: '+225 07 XX XX XX XX',
          street: '123 Rue de la République',
          city: 'Abidjan',
          state: 'Lagunes',
          country: 'Côte d\'Ivoire',
          postalCode: '00225',
          isDefault: true,
        },
        {
          id: '2',
          label: 'Bureau',
          fullName: 'Jean Dupont',
          phone: '+225 07 XX XX XX XX',
          street: '456 Avenue Chardy',
          city: 'Abidjan',
          state: 'Lagunes',
          country: 'Côte d\'Ivoire',
          postalCode: '00225',
          isDefault: false,
        },
      ];
      setAddresses(demoAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (addressId: string) => {
    Alert.alert(
      'Adresse par défaut',
      'Définir cette adresse comme adresse par défaut?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              // TODO: Mettre à jour via l'API
              setAddresses(prev =>
                prev.map(addr => ({
                  ...addr,
                  isDefault: addr.id === addressId,
                }))
              );
              Alert.alert('Succès', 'Adresse par défaut mise à jour');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAddress = (addressId: string, label: string) => {
    Alert.alert(
      'Supprimer l\'adresse',
      `Voulez-vous vraiment supprimer l'adresse "${label}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Supprimer via l'API
              setAddresses(prev => prev.filter(addr => addr.id !== addressId));
              Alert.alert('Succès', 'Adresse supprimée');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressHeaderLeft}>
          <Ionicons
            name={item.isDefault ? 'location' : 'location-outline'}
            size={24}
            color={item.isDefault ? '#10B981' : '#6B7280'}
          />
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Par défaut</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteAddress(item.id, item.label)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.addressBody}>
        <Text style={styles.addressName}>{item.fullName}</Text>
        <Text style={styles.addressPhone}>{item.phone}</Text>
        <Text style={styles.addressText}>{item.street}</Text>
        <Text style={styles.addressText}>
          {item.city}
          {item.state && `, ${item.state}`}
        </Text>
        <Text style={styles.addressText}>
          {item.country} - {item.postalCode}
        </Text>
      </View>

      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color="#10B981" />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Définir par défaut</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Mes Adresses</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Aucune adresse</Text>
          <Text style={styles.emptyText}>
            Ajoutez une adresse de livraison pour faciliter vos commandes
          </Text>
          <TouchableOpacity style={styles.addAddressButton}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.addAddressButtonText}>Ajouter une adresse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  defaultBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  addressBody: {
    marginBottom: 16,
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
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
    marginBottom: 24,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addAddressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
