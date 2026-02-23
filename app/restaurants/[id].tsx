import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useCurrencyStore } from '../../src/store/currencyStore';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  location: {
    city: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  priceRange: string;
  cuisine: string[];
  openingHours: string;
  phone?: string;
  menu?: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  features?: string[];
}

export default function RestaurantDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { formatPrice, convertPrice } = useCurrencyStore();

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const restaurantDoc = await getDoc(doc(db, 'products', id as string));
      
      if (restaurantDoc.exists()) {
        setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleDirections = () => {
    if (restaurant?.location?.coordinates) {
      const { latitude, longitude } = restaurant.location.coordinates;
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Restaurant non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="heart-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.images?.[activeImageIndex] || 'https://via.placeholder.com/400' }}
          style={styles.mainImage}
        />
        {restaurant.images && restaurant.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {restaurant.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  activeImageIndex === index && styles.indicatorActive,
                ]}
                onPress={() => setActiveImageIndex(index)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View style={styles.content}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {restaurant.rating?.toFixed(1)} ({restaurant.reviewCount} avis)
              </Text>
            </View>
            <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
          </View>
        </View>

        {/* Cuisine Tags */}
        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
          <View style={styles.cuisineSection}>
            {restaurant.cuisine.map((type, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{type}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {restaurant.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#f97316" />
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color="#f97316" />
            <Text style={styles.actionText}>Itinéraire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color="#f97316" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#f97316" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>{restaurant.location?.address}</Text>
              <Text style={styles.cityText}>{restaurant.location?.city}</Text>
            </View>
          </View>
        </View>

        {/* Opening Hours */}
        {restaurant.openingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horaires</Text>
            <View style={styles.hoursRow}>
              <Ionicons name="time" size={20} color="#f97316" />
              <Text style={styles.hoursText}>{restaurant.openingHours}</Text>
            </View>
          </View>
        )}

        {/* Features */}
        {restaurant.features && restaurant.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.featuresContainer}>
              {restaurant.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu */}
        {restaurant.menu && restaurant.menu.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu</Text>
            {restaurant.menu.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <View style={styles.menuItemHeader}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemPrice}>
                    {formatPrice(convertPrice(item.price))}
                  </Text>
                </View>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reserve Button */}
        <TouchableOpacity style={styles.reserveButton}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.reserveButtonText}>Réserver une table</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f97316',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    padding: 16,
  },
  nameSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
  },
  cuisineSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  cuisineTag: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  actionText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hoursText: {
    fontSize: 15,
    color: '#374151',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  reserveButton: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
