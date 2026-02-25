import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProductsStore } from '../../src/store/productsStore';
import { ProductCardSkeleton } from '../../src/components/Skeleton';
import { Product } from '../../src/types';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, loading, fetchProducts, searchProducts, loadMore, hasMore } = useProductsStore();
  const [selectedCategory, setSelectedCategory] = useState((params.category as string) || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const CATEGORIES = [
    { id: 'all', name: t('categories.all'), emoji: '🌟', color: '#10B981' },
    { id: 'ecommerce', name: t('categories.ecommerce'), emoji: '🛍️', color: '#3B82F6' },
    { id: 'restaurant', name: t('categories.restaurants'), emoji: '🍽️', color: '#F59E0B' },
    { id: 'hotel', name: t('categories.hotels'), emoji: '🏨', color: '#8B5CF6' },
    { id: 'dating', name: t('categories.dating'), emoji: '💕', color: '#EC4899' },
  ];

  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchProducts();
    } else {
      fetchProducts({ serviceCategory: selectedCategory });
    }
  }, [selectedCategory]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedCategory === 'all') {
      await fetchProducts();
    } else {
      await fetchProducts({ serviceCategory: selectedCategory });
    }
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Image
        source={{
          uri: item.images[0] || 'https://via.placeholder.com/150',
        }}
        style={styles.productImage}
      />
      
      {/* Badge catégorie */}
      <View style={[
        styles.categoryBadge,
        { backgroundColor: CATEGORIES.find(c => c.id === item.serviceCategory)?.color || '#10B981' }
      ]}>
        <Text style={styles.categoryBadgeText}>
          {CATEGORIES.find(c => c.id === item.serviceCategory)?.emoji || '🛍️'}
        </Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={styles.productRating}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>
              {item.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={styles.productLocation}>
            {item.country || 'Cameroun'}
          </Text>
        </View>

        <Text style={styles.productPrice}>
          {item.prices[0]?.price.toLocaleString('fr-FR')} FCFA
        </Text>
        
        {item.moq > 1 && (
          <Text style={styles.moqText}>
            {t('categories.moq')}: {item.moq.toString()} {t('categories.units')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('categories.search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Catégories horizontales */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && {
                backgroundColor: category.color,
              },
            ]}
            onPress={() => handleCategoryChange(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Header count */}
      <View style={styles.productsHeader}>
        <Text style={styles.productsCount}>
          {products.length.toString()} {products.length > 1 ? t('categories.products_count_plural') : t('categories.products_count')}
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {loading && products.length === 0 ? (
        <ScrollView style={styles.container}>
          {renderHeader()}
          <View style={styles.skeletonGrid}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productsRow}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>{t('categories.no_products')}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  productsHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  productCard: {
    width: (width - 36) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 16,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    minHeight: 40,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  productLocation: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  moqText: {
    fontSize: 11,
    color: '#6B7280',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
