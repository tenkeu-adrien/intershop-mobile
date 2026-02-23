import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { useProductsStore } from '../../src/store/productsStore';
import { OptimizedProductCard } from '../../src/components/products/OptimizedProductCard';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, loadFavorites, removeFromFavorites } = useFavoritesStore();
  const { products, fetchProducts } = useProductsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Charger des produits similaires basés sur les favoris
    if (favorites.length > 0 && products.length > 0) {
      const categories = [...new Set(favorites.map(fav => fav.category))];
      const similar = products
        .filter(p => categories.includes(p.category) && !favorites.find(fav => fav.id === p.id))
        .slice(0, 6);
      setSimilarProducts(similar);
    }
  }, [favorites, products]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    await fetchProducts();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (productId: string) => {
    await removeFromFavorites(productId);
  };

  const renderFavoriteItem = ({ item }: any) => (
    <View style={styles.favoriteItem}>
      <OptimizedProductCard
        product={item}
        onPress={() => router.push(`/products/${item.id}`)}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Ionicons name="heart" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderSimilarItem = ({ item }: any) => (
    <View style={styles.similarItem}>
      <OptimizedProductCard
        product={item}
        onPress={() => router.push(`/products/${item.id}`)}
      />
    </View>
  );

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
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favorites.length}</Text>
          </View>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>
            Ajoutez des produits à vos favoris pour les retrouver facilement
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.exploreButtonText}>Explorer les produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            similarProducts.length > 0 ? (
              <View style={styles.similarSection}>
                <Text style={styles.similarTitle}>Produits similaires</Text>
                <FlatList
                  data={similarProducts}
                  renderItem={renderSimilarItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  scrollEnabled={false}
                />
              </View>
            ) : null
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  favoriteItem: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  exploreButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  similarSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  similarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  similarItem: {
    flex: 1,
    marginHorizontal: 4,
  },
});
