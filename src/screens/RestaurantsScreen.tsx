import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { 
  IoSearchOutline,
  IoLocationOutline,
  IoStarOutline,
  IoStar,
  IoTimeOutline,
  IoRestaurantOutline
} from 'react-icons/io5';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const restaurantsQuery = query(
        collection(db, 'products'),
        where('serviceCategory', '==', 'restaurant'),
        where('isActive', '==', true),
        orderBy('rating', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(restaurantsQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurant = ({ item }: any) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <View style={styles.restaurantImageContainer}>
        {item.images && item.images[0] ? (
          <Image 
            source={{ uri: item.images[0] }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.restaurantImagePlaceholder}>
            <IoRestaurantOutline size={48} color="#D1D5DB" />
          </View>
        )}
        {item.location && (
          <View style={styles.distanceBadge}>
            <IoLocationOutline size={12} color="#fff" />
            <Text style={styles.distanceText}>2.5 km</Text>
          </View>
        )}
      </View>

      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>
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

        {item.restaurantInfo?.cuisine && (
          <Text style={styles.cuisine} numberOfLines={1}>
            {item.restaurantInfo.cuisine.join(', ')}
          </Text>
        )}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <IoTimeOutline size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.restaurantInfo?.openingHours || '9h-22h'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.priceRange}>
              {item.restaurantInfo?.priceRange || '$$'}
            </Text>
          </View>
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
            placeholder="Rechercher un restaurant..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Restaurants List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.restaurantsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IoRestaurantOutline size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun restaurant trouvé</Text>
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
  restaurantsList: {
    padding: 16,
  },
  restaurantCard: {
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
  restaurantImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantImagePlaceholder: {
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
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
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
  cuisine: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
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
