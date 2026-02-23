import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useProductsStore } from '../../src/store/productsStore';
import { useAuthStore } from '../../src/store/authStore';
import { useCurrencyStore } from '../../src/store/currencyStore';
import { ProductCardSkeleton } from '../../src/components/Skeleton';
import CategorySelector from '../../src/components/CategorySelector';
import { Product } from '../../src/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { products, loading, fetchProducts, loadMore, hasMore } = useProductsStore();
  const { convertPrice, formatPrice } = useCurrencyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeSection, setActiveSection] = useState<'deals' | 'top' | 'new'>('deals');
  const [restaurants, setRestaurants] = useState<Product[]>([]);
  const [hotels, setHotels] = useState<Product[]>([]);
  const [datingProfiles, setDatingProfiles] = useState<Product[]>([]);

  useEffect(() => {
    console.log('🏠 [Home] Component mounted, fetching products...');
    fetchProducts();
    loadServiceSections();
  }, []);

  const loadServiceSections = async () => {
    try {
      console.log('📡 Loading service sections...');
      
      // Charger restaurants
      try {
        const restaurantsRes = await api.get('/api/mobile/restaurants', {
          params: { limit: 10 }
        });
        if (restaurantsRes.data?.success) {
          setRestaurants(restaurantsRes.data.restaurants);
          console.log('✅ Restaurants loaded:', restaurantsRes.data.restaurants.length);
        }
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
      
      // Charger hôtels
      try {
        const hotelsRes = await api.get('/api/mobile/hotels', {
          params: { limit: 10 }
        });
        if (hotelsRes.data?.success) {
          setHotels(hotelsRes.data.hotels);
          console.log('✅ Hotels loaded:', hotelsRes.data.hotels.length);
        }
      } catch (error) {
        console.error('Error loading hotels:', error);
      }
      
      // Charger profils rencontres
      try {
        const datingRes = await api.get('/api/mobile/dating', {
          params: { limit: 10 }
        });
        if (datingRes.data?.success) {
          setDatingProfiles(datingRes.data.profiles);
          console.log('✅ Dating profiles loaded:', datingRes.data.profiles.length);
        }
      } catch (error) {
        console.error('Error loading dating profiles:', error);
      }
    } catch (error) {
      console.error('Error loading service sections:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading || products.length === 0) {
      return;
    }
    
    console.log('🏠 [Home] Loading more products...');
    setLoadingMore(true);
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, products.length, loadMore]);

  const categories = [
    { name: 'Électronique', icon: 'laptop-outline', color: '#3B82F6' },
    { name: 'Mode', icon: 'shirt-outline', color: '#EC4899' },
    { name: 'Maison', icon: 'home-outline', color: '#10B981' },
    { name: 'Sport', icon: 'football-outline', color: '#F97316' },
    { name: 'Beauté', icon: 'sparkles-outline', color: '#A855F7' },
    { name: 'Jouets', icon: 'game-controller-outline', color: '#FBBF24' },
    { name: 'Auto', icon: 'car-outline', color: '#EF4444' },
    { name: 'Food', icon: 'fast-food-outline', color: '#10B981' },
  ];

  const features = [
    { icon: 'shield-checkmark', title: 'Protection', desc: 'Achats protégés', color: '#10B981' },
    { icon: 'rocket', title: 'Livraison', desc: 'Rapide & fiable', color: '#FBBF24' },
    { icon: 'cash', title: 'Prix bas', desc: 'Meilleurs prix', color: '#10B981' },
    { icon: 'people', title: 'Communauté', desc: 'Millions d\'users', color: '#FBBF24' },
  ];

  const stats = [
    { icon: 'trending-up', value: '10M+', label: 'Produits', color: '#10B981' },
    { icon: 'people', value: '5M+', label: 'Utilisateurs', color: '#FBBF24' },
    { icon: 'cube', value: '200K+', label: 'Fournisseurs', color: '#10B981' },
    { icon: 'flash', value: '24/7', label: 'Support', color: '#FBBF24' },
  ];

  const renderProductCard = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        activeSection === 'deals' && styles.productCardDeals,
        activeSection === 'top' && styles.productCardTop,
        activeSection === 'new' && styles.productCardNew,
      ]}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
        />
        
        {/* Badge selon la section */}
        {activeSection === 'deals' && (
          <View style={[styles.badge, styles.badgeDeals]}>
            <Ionicons name="flame" size={12} color="white" />
            <Text style={styles.badgeText}>HOT</Text>
          </View>
        )}
        {activeSection === 'top' && index < 3 && (
          <View style={[styles.badge, styles.badgeTop]}>
            <Ionicons name="trophy" size={12} color="white" />
            <Text style={styles.badgeText}>TOP</Text>
          </View>
        )}
        {activeSection === 'new' && (
          <View style={[styles.badge, styles.badgeNew]}>
            <Ionicons name="pricetag" size={12} color="white" />
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}

        {/* Ranking badge pour top */}
        {activeSection === 'top' && index < 3 && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
        )}

        {/* Sales badge pour deals */}
        {activeSection === 'deals' && item.sales && item.sales > 0 && (
          <View style={styles.salesBadge}>
            <Text style={styles.salesText}>{item.sales}+ vendus</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name || 'Produit'}
        </Text>
        <View style={styles.productRating}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>
            {(item.rating || 0).toFixed(1)} ({item.reviewCount || 0})
          </Text>
        </View>
        <Text style={styles.productPrice}>
          {formatPrice(convertPrice(item.prices?.[0]?.price || 0))}
        </Text>
        {item.moq && item.moq > 0 && (
          <Text style={styles.productMoq}>MOQ: {item.moq}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ProductCardSkeleton />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <LinearGradient
        colors={['#FBBF24', '#10B981', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            La plateforme B2B/B2C{'\n'}
            <Text style={styles.heroTitleAccent}>leader mondial</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Connectez-vous avec des millions de fournisseurs et acheteurs
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroPrimaryButton}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.heroPrimaryButtonText}>Acheter</Text>
              <Ionicons name="cart" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.heroSecondaryButton}
              onPress={() => router.push('/sell')}
            >
              <Text style={styles.heroSecondaryButtonText}>Vendre</Text>
              <Ionicons name="storefront" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={28} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Category Selector - Services principaux */}
      <View style={styles.categorySelectorSection}>
        <Text style={styles.sectionTitle}>Explorez nos services</Text>
        <CategorySelector />
      </View>

      {/* Restaurants Section */}
      {restaurants.length > 0 && (
        <View style={styles.restaurantsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="restaurant" size={28} color="#F97316" />
              <View>
                <Text style={styles.sectionTitle}>Restaurants populaires</Text>
                <Text style={styles.sectionSubtitle}>Découvrez les meilleurs restaurants</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/restaurants')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
          >
            {restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.serviceCard}
                onPress={() => router.push(`/restaurants/${restaurant.id}`)}
              >
                <Image
                  source={{ uri: restaurant.images[0] || 'https://via.placeholder.com/200' }}
                  style={styles.serviceImage}
                />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <View style={styles.serviceRating}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.serviceRatingText}>
                      {restaurant.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Hotels Section */}
      {hotels.length > 0 && (
        <View style={styles.hotelsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="bed" size={28} color="#8B5CF6" />
              <View>
                <Text style={styles.sectionTitle}>Hôtels recommandés</Text>
                <Text style={styles.sectionSubtitle}>Trouvez votre hébergement idéal</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/hotels')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
          >
            {hotels.map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                style={styles.serviceCard}
                onPress={() => router.push(`/hotels/${hotel.id}`)}
              >
                <Image
                  source={{ uri: hotel.images[0] || 'https://via.placeholder.com/200' }}
                  style={styles.serviceImage}
                />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {hotel.name}
                  </Text>
                  <View style={styles.serviceRating}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.serviceRatingText}>
                      {hotel.rating?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Dating Section */}
      {datingProfiles.length > 0 && (
        <View style={styles.datingSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="heart" size={28} color="#EC4899" />
              <View>
                <Text style={styles.sectionTitle}>Rencontres</Text>
                <Text style={styles.sectionSubtitle}>Trouvez la personne qui vous correspond</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/dating')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
          >
            {datingProfiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.datingCard}
                onPress={() => router.push(`/dating/${profile.id}`)}
              >
                <Image
                  source={{ uri: profile.images[0] || 'https://via.placeholder.com/200' }}
                  style={styles.datingImage}
                />
                <View style={styles.datingInfo}>
                  <Text style={styles.datingName} numberOfLines={1}>
                    {profile.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Pourquoi nous choisir</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                <Ionicons name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { backgroundColor: `${cat.color}20` }]}
            >
              <Ionicons name={cat.icon as any} size={32} color={cat.color} />
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Section Tabs */}
      <View style={styles.productsSection}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeSection === 'deals' && styles.tabActive]}
            onPress={() => setActiveSection('deals')}
          >
            <Ionicons
              name="flame"
              size={20}
              color={activeSection === 'deals' ? '#EF4444' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeSection === 'deals' && styles.tabTextActive]}>
              Offres
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeSection === 'top' && styles.tabActive]}
            onPress={() => setActiveSection('top')}
          >
            <Ionicons
              name="trophy"
              size={20}
              color={activeSection === 'top' ? '#FBBF24' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeSection === 'top' && styles.tabTextActive]}>
              Top
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeSection === 'new' && styles.tabActive]}
            onPress={() => setActiveSection('new')}
          >
            <Ionicons
              name="time"
              size={20}
              color={activeSection === 'new' ? '#10B981' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeSection === 'new' && styles.tabTextActive]}>
              Nouveau
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* CTA Section */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.ctaSection}
      >
        <Ionicons name="rocket" size={48} color="white" />
        <Text style={styles.ctaTitle}>Prêt à développer votre business ?</Text>
        <Text style={styles.ctaSubtitle}>
          Rejoignez des milliers de vendeurs qui réussissent
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.ctaButtonText}>Créer un compte gratuit</Text>
          <Ionicons name="arrow-forward" size={20} color="#10B981" />
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  hero: {
    padding: 24,
    paddingTop: 60,
  },
  heroContent: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroTitleAccent: {
    color: '#059669',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  heroPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroPrimaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  heroSecondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 72) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categorySelectorSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  restaurantsSection: {
    padding: 24,
    backgroundColor: '#FFF7ED',
  },
  hotelsSection: {
    padding: 24,
    backgroundColor: '#F5F3FF',
  },
  datingSection: {
    padding: 24,
    backgroundColor: '#FCE7F3',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  servicesScroll: {
    paddingRight: 24,
  },
  serviceCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceRatingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  datingCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datingImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  datingInfo: {
    padding: 12,
  },
  datingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  featuresSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: (width - 72) / 2,
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesSection: {
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingRight: 24,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  productsSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#1F2937',
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  productCardDeals: {
    borderColor: '#FEE2E2',
  },
  productCardTop: {
    borderColor: '#FEF3C7',
  },
  productCardNew: {
    borderColor: '#D1FAE5',
  },
  productImageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeDeals: {
    backgroundColor: '#EF4444',
  },
  badgeTop: {
    backgroundColor: '#FBBF24',
  },
  badgeNew: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  salesBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  salesText: {
    color: 'white',
    fontSize: 10,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 6,
    height: 36,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  productMoq: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
});
