import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useRestaurantsStore } from '../../../src/store/restaurantsStore';
import ContactModal from '../../../src/components/ContactModal';

const { width } = Dimensions.get('window');

export default function RestaurantDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentRestaurant: restaurant, loading, error, fetchRestaurantById, clearCurrentRestaurant } = useRestaurantsStore();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id as string);
    }
    
    return () => {
      clearCurrentRestaurant();
    };
  }, [id]);

  const handleContact = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowContactModal(true);
  };

  const getFeatureIcon = (feature: string): keyof typeof Ionicons.glyphMap => {
    const lower = feature.toLowerCase();
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('parking')) return 'car';
    if (lower.includes('carte')) return 'card';
    if (lower.includes('terrasse')) return 'sunny';
    if (lower.includes('livraison')) return 'bicycle';
    if (lower.includes('réservation')) return 'calendar';
    return 'checkmark-circle';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!loading && !restaurant)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Restaurant non trouvé'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant || !restaurant.restaurantData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du restaurant</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: restaurant.images[selectedImageIndex] }}
            style={styles.mainImage}
          />
        </View>

        {/* Thumbnails */}
        {restaurant.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
          >
            {restaurant.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.priceRange}>{restaurant.restaurantData.priceRange}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {restaurant.rating?.toFixed(1) || '0.0'} ({restaurant.reviewCount || 0} avis)
            </Text>
          </View>

          {/* Cuisine Type */}
          {restaurant.restaurantData.cuisineType && (
            <View style={styles.cuisineContainer}>
              {(Array.isArray(restaurant.restaurantData.cuisineType) 
                ? restaurant.restaurantData.cuisineType 
                : [restaurant.restaurantData.cuisineType]
              ).map((type, index) => (
                <View key={index} style={styles.cuisineTag}>
                  <Text style={styles.cuisineText}>{type}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          {/* Location */}
          {restaurant.location && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adresse</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#f97316" />
                <View style={styles.locationText}>
                  <Text style={styles.address}>{restaurant.location.address}</Text>
                  <Text style={styles.city}>{restaurant.location.city}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Opening Hours */}
          {restaurant.restaurantData.openingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horaires</Text>
              <View style={styles.hoursContainer}>
                <Ionicons name="time" size={20} color="#f97316" />
                <View style={styles.hoursText}>
                  {typeof restaurant.restaurantData.openingHours === 'string' ? (
                    <Text style={styles.hoursLabel}>{restaurant.restaurantData.openingHours}</Text>
                  ) : (
                    Object.entries(restaurant.restaurantData.openingHours).map(([day, hours]) => (
                      <View key={day} style={styles.hourRow}>
                        <Text style={styles.dayLabel}>{day}:</Text>
                        <Text style={styles.hoursLabel}>{hours as string}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Features */}
          {restaurant.restaurantData.features && restaurant.restaurantData.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.featuresGrid}>
                {restaurant.restaurantData.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name={getFeatureIcon(feature)}
                      size={20}
                      color="#f97316"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Menu Highlights */}
          {restaurant.restaurantData.menuHighlights && restaurant.restaurantData.menuHighlights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spécialités</Text>
              <View style={styles.menuContainer}>
                {restaurant.restaurantData.menuHighlights.map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Ionicons name="restaurant" size={16} color="#f97316" />
                    <Text style={styles.menuText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Button */}
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Contacter le restaurant</Text>
          </TouchableOpacity>

          {/* Map Button */}
          {restaurant.location && (
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="navigate" size={20} color="#f97316" />
              <Text style={styles.mapButtonText}>Voir l'itinéraire</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
          type="restaurant"
          ownerId={restaurant.fournisseurId}
          ownerName={restaurant.name}
          itemId={restaurant.id!}
          itemName={restaurant.name}
          itemImage={restaurant.images[0]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
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
    paddingVertical: 12,
    backgroundColor: '#f97316',
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
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
    backgroundColor: '#e5e7eb',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#f97316',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceRange: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
    marginLeft: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  cuisineTag: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cuisineText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationText: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: '#6b7280',
  },
  hoursContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  hoursText: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 80,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  mapButtonText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '600',
  },
});
