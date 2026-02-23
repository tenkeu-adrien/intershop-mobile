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
} from 'react-native';
import { IoSearch, IoStar, IoFilter } from 'react-icons/io5';
import { useProductsStore } from '../store/productsStore';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'Tous', emoji: '🌟', color: '#10B981' },
  { id: 'ecommerce', name: 'E-commerce', emoji: '🛍️', color: '#3B82F6' },
  { id: 'restaurant', name: 'Restaurants', emoji: '🍽️', color: '#F59E0B' },
  { id: 'hotel', name: 'Hôtels', emoji: '🏨', color: '#8B5CF6' },
  { id: 'dating', name: 'Rencontres', emoji: '💕', color: '#EC4899' },
];

export default function CategoriesScreen({ navigation, route }: any) {
  const { products, loading, fetchProducts, searchProducts } = useProductsStore();
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || 'all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <IoSearch size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <IoFilter size={24} color="#1F2937" />
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

      {/* Liste des produits */}
      <ScrollView style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsCount}>
            {products.length} produit{products.length > 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Chargement...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: product.id })
                }
              >
                <Image
                  source={{
                    uri: product.images[0] || 'https://via.placeholder.com/150',
                  }}
                  style={styles.productImage}
                />
                
                {/* Badge catégorie */}
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: CATEGORIES.find(c => c.id === product.serviceCategory)?.color || '#10B981' }
                ]}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORIES.find(c => c.id === product.serviceCategory)?.emoji || '🛍️'}
                  </Text>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  
                  <View style={styles.productMeta}>
                    <View style={styles.productRating}>
                      <IoStar size={14} color="#FBBF24" />
                      <Text style={styles.ratingText}>
                        {product.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.productLocation}>
                      {product.country || 'Cameroun'}
                    </Text>
                  </View>

                  <Text style={styles.productPrice}>
                    {product.prices[0]?.price.toLocaleString('fr-FR')} FCFA
                  </Text>
                  
                  {product.moq > 1 && (
                    <Text style={styles.moqText}>
                      MOQ: {product.moq} unités
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  productsContainer: {
    flex: 1,
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  productCard: {
    width: (width - 36) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 6,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
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
