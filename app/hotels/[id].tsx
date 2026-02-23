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

interface Hotel {
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
  hotelData?: {
    starRating: number;
    amenities: string[];
    roomTypes: Array<{
      name: string;
      price: number;
      description: string;
      capacity: number;
    }>;
  };
  prices: Array<{
    price: number;
    currency: string;
  }>;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export default function HotelDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { formatPrice, convertPrice } = useCurrencyStore();

  useEffect(() => {
    loadHotel();
  }, [id]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const hotelDoc = await getDoc(doc(db, 'products', id as string));
      
      if (hotelDoc.exists()) {
        setHotel({ id: hotelDoc.id, ...hotelDoc.data() } as Hotel);
      }
    } catch (error) {
      console.error('Error loading hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (hotel?.phone) {
      Linking.openURL(`tel:${hotel.phone}`);
    }
  };

  const handleDirections = () => {
    if (hotel?.location?.coordinates) {
      const { latitude, longitude } = hotel.location.coordinates;
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    }
  };

  const renderStars = (count: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(count)].map((_, index) => (
          <Ionicons key={index} name="star" size={16} color="#f59e0b" />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bed-outline" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Hôtel non trouvé</Text>
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
        <Text style={styles.headerTitle}>Hôtel</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="heart-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hotel.images?.[activeImageIndex] || 'https://via.placeholder.com/400' }}
          style={styles.mainImage}
        />
        {hotel.hotelData?.starRating && (
          <View style={styles.starBadge}>
            {renderStars(hotel.hotelData.starRating)}
          </View>
        )}
        {hotel.images && hotel.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {hotel.images.map((_, index) => (
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

      {/* Hotel Info */}
      <View style={styles.content}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {hotel.rating?.toFixed(1)} ({hotel.reviewCount} avis)
              </Text>
            </View>
          </View>
          {hotel.prices && hotel.prices.length > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>À partir de</Text>
              <Text style={styles.priceValue}>
                {formatPrice(convertPrice(hotel.prices[0].price))}
              </Text>
              <Text style={styles.priceUnit}>/nuit</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {hotel.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#8b5cf6" />
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="navigate" size={20} color="#8b5cf6" />
            <Text style={styles.actionText}>Itinéraire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color="#8b5cf6" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{hotel.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#8b5cf6" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationText}>{hotel.location?.address}</Text>
              <Text style={styles.cityText}>{hotel.location?.city}</Text>
            </View>
          </View>
        </View>

        {/* Check-in/Check-out */}
        {(hotel.checkInTime || hotel.checkOutTime) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horaires</Text>
            <View style={styles.timesContainer}>
              {hotel.checkInTime && (
                <View style={styles.timeItem}>
                  <Ionicons name="log-in" size={20} color="#8b5cf6" />
                  <View>
                    <Text style={styles.timeLabel}>Check-in</Text>
                    <Text style={styles.timeValue}>{hotel.checkInTime}</Text>
                  </View>
                </View>
              )}
              {hotel.checkOutTime && (
                <View style={styles.timeItem}>
                  <Ionicons name="log-out" size={20} color="#8b5cf6" />
                  <View>
                    <Text style={styles.timeLabel}>Check-out</Text>
                    <Text style={styles.timeValue}>{hotel.checkOutTime}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Amenities */}
        {hotel.hotelData?.amenities && hotel.hotelData.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            <View style={styles.amenitiesContainer}>
              {hotel.hotelData.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Room Types */}
        {hotel.hotelData?.roomTypes && hotel.hotelData.roomTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Types de chambres</Text>
            {hotel.hotelData.roomTypes.map((room, index) => (
              <View key={index} style={styles.roomItem}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.roomCapacity}>
                      <Ionicons name="people" size={16} color="#6b7280" />
                      <Text style={styles.roomCapacityText}>
                        {room.capacity} {room.capacity > 1 ? 'personnes' : 'personne'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.roomPrice}>
                    {formatPrice(convertPrice(room.price))}
                  </Text>
                </View>
                <Text style={styles.roomDescription}>{room.description}</Text>
                <TouchableOpacity style={styles.bookRoomButton}>
                  <Text style={styles.bookRoomButtonText}>Réserver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Réserver maintenant</Text>
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
  starBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
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
    marginBottom: 12,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6b7280',
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
    borderColor: '#8b5cf6',
  },
  actionText: {
    fontSize: 14,
    color: '#8b5cf6',
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
  timesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f3ff',
    padding: 12,
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  amenitiesContainer: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityText: {
    fontSize: 15,
    color: '#374151',
  },
  roomItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roomCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomCapacityText: {
    fontSize: 13,
    color: '#6b7280',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  roomDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  bookRoomButton: {
    backgroundColor: '#f5f3ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookRoomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
