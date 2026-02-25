import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useHotelsStore } from '../../src/store/hotelsStore';
import { HotelCardSkeleton } from '../../src/components/Skeleton';

export default function HotelsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { hotels, loading, fetchHotels } = useHotelsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  useEffect(() => {
    fetchHotels({ limit: 50 });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHotels({ limit: 50 });
    setRefreshing(false);
  };

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStars = !starFilter || h.hotelData?.starRating === starFilter;
    return matchesSearch && matchesStars;
  });

  const renderHotel = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => router.push(`/hotels/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }}
        style={styles.hotelImage}
      />
      {item.hotelData?.starRating && (
        <View style={styles.starBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.starBadgeText}>{item.hotelData.starRating}</Text>
        </View>
      )}
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.ratingText}>
            {item.rating?.toFixed(1) || '0.0'} ({item.reviewCount || 0})
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.detailText}>{item.location?.city || t('hotels.not_specified')}</Text>
          </View>
        </View>
        {item.hotelData?.amenities && item.hotelData.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {item.hotelData.amenities.slice(0, 3).map((amenity, idx) => (
              <View key={idx} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}
        {item.prices && item.prices.length > 0 && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>{t('hotels.from')}</Text>
            <Text style={styles.priceValue}>
              ${item.prices[0].price.toFixed(2)}
            </Text>
            <Text style={styles.priceUnit}>{t('hotels.per_night')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="bed" size={24} color="white" />
            <Text style={styles.headerTitle}>{t('hotels.title')}</Text>
          </View>
          <View style={styles.headerButton} />
        </LinearGradient>
        <View style={styles.listContainer}>
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="bed" size={24} color="white" />
          <Text style={styles.headerTitle}>{t('hotels.title')}</Text>
        </View>
        <View style={styles.headerButton} />
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('hotels.search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.nearMeButton} onPress={() => {}}>
          <Ionicons name="navigate" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('hotels.stars')}</Text>
            <View style={styles.starButtons}>
              {[null, 1, 2, 3, 4, 5].map((stars) => (
                <TouchableOpacity
                  key={stars || 'all'}
                  style={[styles.starButton, starFilter === stars && styles.starButtonActive]}
                  onPress={() => setStarFilter(stars)}
                >
                  <Text style={[styles.starButtonText, starFilter === stars && styles.starButtonTextActive]}>
                    {stars ? `${stars}★` : t('common.all')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredHotels}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8b5cf6']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('hotels.no_hotels')}</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  nearMeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  starButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  starButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  starButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  starButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  starButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  starBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hotelInfo: {
    padding: 12,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  amenityTag: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
});
