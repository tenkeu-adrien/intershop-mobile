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
import { useCurrencyStore } from '../../../src/store/currencyStore';
import { useHotelsStore } from '../../../src/store/hotelsStore';
import ContactModal from '../../../src/components/ContactModal';

const { width } = Dimensions.get('window');

export default function HotelDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { convertPrice, formatPrice } = useCurrencyStore();
  const { currentHotel: hotel, loading, error, fetchHotelById, clearCurrentHotel } = useHotelsStore();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHotelById(id as string);
    }
    
    return () => {
      clearCurrentHotel();
    };
  }, [id]);

  const handleContact = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowContactModal(true);
  };

  const getAmenityIcon = (amenity: string): keyof typeof Ionicons.glyphMap => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('parking')) return 'car';
    if (lower.includes('petit-déjeuner') || lower.includes('restaurant')) return 'restaurant';
    if (lower.includes('piscine')) return 'water';
    if (lower.includes('gym') || lower.includes('fitness')) return 'fitness';
    if (lower.includes('climatisation')) return 'snow';
    return 'checkmark-circle';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!loading && !hotel)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Hôtel non trouvé'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!hotel || !hotel.hotelData) {
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
          <Text style={styles.headerTitle}>Détails de l'hôtel</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: hotel.images[selectedImageIndex] }}
            style={styles.mainImage}
          />
          {hotel.hotelData.starRating && (
            <View style={styles.starBadge}>
              {[...Array(hotel.hotelData.starRating)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#fff" />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnails */}
        {hotel.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
          >
            {hotel.images.map((image, index) => (
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

        {/* Hotel Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {hotel.rating?.toFixed(1) || '0.0'} ({hotel.reviewCount || 0} avis)
            </Text>
          </View>

          {/* Price */}
          {hotel.prices && hotel.prices.length > 0 && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>À partir de</Text>
              <Text style={styles.priceValue}>
                {formatPrice(convertPrice(hotel.prices[0].price))}
              </Text>
              <Text style={styles.priceUnit}>/ nuit</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{hotel.description}</Text>
          </View>

          {/* Room Types */}
          {hotel.hotelData.roomTypes && hotel.hotelData.roomTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Types de chambres</Text>
              {hotel.hotelData.roomTypes.map((room, index) => (
                <View key={index} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomType}>{room.type}</Text>
                    <Text style={styles.roomPrice}>
                      {formatPrice(convertPrice(room.price))}
                    </Text>
                  </View>
                  {room.description && (
                    <Text style={styles.roomDescription}>{room.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          {hotel.location && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adresse</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#8b5cf6" />
                <View style={styles.locationText}>
                  <Text style={styles.address}>{hotel.location.address}</Text>
                  <Text style={styles.city}>{hotel.location.city}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Check-in/out times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horaires</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={20} color="#8b5cf6" />
              <View style={styles.timeText}>
                <Text style={styles.timeLabel}>Check-in: {hotel.hotelData.checkInTime}</Text>
                <Text style={styles.timeLabel}>Check-out: {hotel.hotelData.checkOutTime}</Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          {hotel.hotelData.amenities && hotel.hotelData.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Équipements</Text>
              <View style={styles.amenitiesGrid}>
                {hotel.hotelData.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons
                      name={getAmenityIcon(amenity)}
                      size={20}
                      color="#8b5cf6"
                    />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Button */}
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Contacter l'hôtel</Text>
          </TouchableOpacity>

          {/* Map Button */}
          {hotel.location && (
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="navigate" size={20} color="#8b5cf6" />
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
          type="hotel"
          ownerId={hotel.fournisseurId}
          ownerName={hotel.name}
          itemId={hotel.id!}
          itemName={hotel.name}
          itemImage={hotel.images[0]}
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
    backgroundColor: '#8b5cf6',
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
    backgroundColor: '#8b5cf6',
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
  starBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
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
    borderColor: '#8b5cf6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  hotelName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f5f3ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
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
  roomCard: {
    backgroundColor: '#f5f3ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  roomDescription: {
    fontSize: 14,
    color: '#6b7280',
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
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeText: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    backgroundColor: '#f5f3ff',
    padding: 12,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#8b5cf6',
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
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
});
