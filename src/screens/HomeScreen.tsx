import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { IoSearch, IoLocationSharp, IoStar } from 'react-icons/io5';
import { useProductsStore } from '../store/productsStore';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { featuredProducts, loading, fetchFeaturedProducts } = useProductsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeaturedProducts();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#FBBF24', '#10B981', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>
              {user?.displayName || 'Invité'}
            </Text>
          </View>
          <TouchableOpacity style={styles.locationButton}>
            <IoLocationSharp size={20} color="#1F2937" />
            <Text style={styles.locationText}>Cameroun</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <IoSearch size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </LinearGradient>

      {/* Catégories rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Catégories', { category: 'ecommerce' })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.categoryEmoji}>🛍️</Text>
            </View>
            <Text style={styles.categoryText}>E-commerce</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Catégories', { category: 'restaurant' })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: '#FED7AA' }]}>
              <Text style={styles.categoryEmoji}>🍽️</Text>
            </View>
            <Text style={styles.categoryText}>Restaurants</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Catégories', { category: 'hotel' })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: '#E9D5FF' }]}>
              <Text style={styles.categoryEmoji}>🏨</Text>
            </View>
            <Text style={styles.categoryText}>Hôtels</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Catégories', { category: 'dating' })}
          >
            <View style={[styles.categoryIcon, { backgroundColor: '#FBCFE8' }]}>
              <Text style={styles.categoryEmoji}>💕</Text>
            </View>
            <Text style={styles.categoryText}>Rencontres</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Produits en vedette */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produits en vedette</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catégories')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Chargement...</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {featuredProducts.slice(0, 6).map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              >
                <Image
                  source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.productRating}>
                    <IoStar size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </Text>
                  </View>
                  <Text style={styles.productPrice}>
                    {product.prices[0]?.price.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bannière promotionnelle */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.promoBanner}
        >
          <Text style={styles.promoTitle}>🎉 Offres spéciales</Text>
          <Text style={styles.promoText}>
            Jusqu'à 50% de réduction sur une sélection de produits
          </Text>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Découvrir</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#1F2937',
    opacity: 0.8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  promoBanner: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  promoButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promoButtonText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
