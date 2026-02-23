import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { 
  IoSearchOutline,
  IoLocationOutline,
  IoStarOutline,
  IoStar,
  IoBedOutline,
  IoWifiOutline,
  IoCarOutline
} from 'react-icons/io5';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function HotelsScreen() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const hotelsQuery = query(
        collection(db, 'products'),
        where('serviceCategory', '==', 'hotel'),
        where('isActive', '==', true),
        orderBy('rating', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(hotelsQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHotel = ({ item }: any) => (
    <TouchableOpacity style={styles.hotelCard}>
      <View style={styles.hotelImageContainer}>
        {item.images && item.images[0] ? (
          <Image 
            source={{ uri: item.images[0] }}
            style={styles.hotelImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.hotelImagePlaceholder}>
            <IoBedOutline size={48} color="#D1D5DB" />
          </View>
        )}
        {item.location && (
          <View style={styles.distanceBadge}>
            <IoLocationOutline size={12} color="#fff" />
            <Text style={styles.distanceText}>1.8 km</Text>
          </View>
        )}
      </View>

      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.ratingContainer}>
          <IoStar size={16} color="#FBBF24" />
          <Text style={styles.ratingText}>
            {item.rating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.reviewCount}>
            ({item.reviewCount || 0} avis)
          </Text>
        </View>

        {item.location?.address && (
          <View style={styles.addressContainer}>
            <IoLocationOutline size={14} color="#6B7280" />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.location.address}
            </Text>
          </View>
        )}

        {item.hotelInfo?.amenities && (
          <View style={styles.amenitiesContainer}>
            {item.hotelInfo.amenities.includes('wifi') && (
              <View style={styles.amenityBadge}>
                <IoWifiOutline size={14} color="#10B981" />
              </View>
            )}
            {item.hotelInfo.amenities.includes('parking') && (
              <View style={styles.amenityBadge}>
                <IoCarOutline size={14} color="#10B981" />
              </View>
            )}
          </View>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.price}>
            ${item.prices[0]?.price || 0}
          </Text>
          <Text style={styles.priceUnit}>/nuit</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <IoSearchOutline size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un hôtel..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Hotels List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderHotel}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.hotelsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IoBedOutline size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun hôtel trouvé</Text>
            </View>
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
  searchHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  hotelsList: {
    padding: 16,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  hotelImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  hotelImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  amenityBadge: {
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceUnit: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});
