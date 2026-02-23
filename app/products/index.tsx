import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProductsStore } from '../../src/store/productsStore';
import { Product } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProductsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, loading, hasMore, fetchProducts, loadMore } = useProductsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    console.log('🏠 [Products List] Component mounted');
    loadInitialProducts();
  }, [params.category, params.search]);

  const loadInitialProducts = async () => {
    console.log('🔍 [Products List] Loading initial products...');
    console.log('📋 [Products List] Category:', params.category);
    console.log('📋 [Products List] Search:', params.search);
    
    await fetchProducts({
      category: params.category as string,
      search: params.search as string,
    });
  };

  const handleRefresh = async () => {
    console.log('🔄 [Products List] Refreshing...');
    setRefreshing(true);
    await loadInitialProducts();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore) {
      console.log('⏸️ [Products List] Skip load more:', { loadingMore, loading, hasMore });
      return;
    }

    console.log('📥 [Products List] Loading more products...');
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/200' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      {/* Badge si nouveau */}
      {isNew(item.createdAt) && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>Nouveau</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.prices[0]?.price.toLocaleString('fr-FR')} FCFA
          </Text>
          {item.prices[0]?.originalPrice && item.prices[0].originalPrice > item.prices[0].price && (
            <Text style={styles.originalPrice}>
              {item.prices[0].originalPrice.toLocaleString('fr-FR')}
            </Text>
          )}
        </View>

        {/* MOQ */}
        {item.moq > 1 && (
          <Text style={styles.moq}>Min: {item.moq} unités</Text>
        )}

        {/* Sales */}
        <Text style={styles.sales}>{item.sales} vendus</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#10B981" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
        <Text style={styles.emptyText}>
          {params.search
            ? 'Essayez une autre recherche'
            : 'Aucun produit disponible pour le moment'}
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleRefresh}
        >
          <Text style={styles.emptyButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const isNew = (createdAt: any) => {
    if (!createdAt) return false;
    const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // Nouveau si créé il y a moins de 7 jours
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {params.search
              ? `Recherche: "${params.search}"`
              : params.category
              ? `Catégorie: ${params.category}`
              : 'Tous les produits'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {products.length} produit{products.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Loading Overlay */}
      {loading && products.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#F3F4F6',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  moq: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  sales: {
    fontSize: 11,
    color: '#6B7280',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
