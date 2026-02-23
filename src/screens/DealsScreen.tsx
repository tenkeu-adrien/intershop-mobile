import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';
import { useRouter } from 'expo-router';

export default function DealsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'popular'>('discount');

  useEffect(() => {
    loadDeals();
  }, [sortBy]);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const allProducts: Product[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        allProducts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Product);
      });

      // Filter products with deals (simulated with stock > 50 or sales > 100)
      const dealsProducts = allProducts.filter(p => p.stock > 50 || (p.sales && p.sales > 100));

      // Sort
      let sorted = [...dealsProducts];
      if (sortBy === 'price') {
        sorted.sort((a, b) => a.prices[0].price - b.prices[0].price);
      } else if (sortBy === 'popular') {
        sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      } else {
        sorted.sort((a, b) => b.stock - a.stock);
      }

      setProducts(sorted);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IoTagOutline size={32} color="#EF4444" />
          <Text style={styles.headerTitle}>Offres Spéciales</Text>
        </View>
        <Text style={styles.headerSubtitle}>Découvrez nos meilleures offres et promotions</Text>
      </View>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <View>
          <Text style={styles.promoTitle}>🔥 Ventes Flash</Text>
          <Text style={styles.promoSubtitle}>Jusqu'à 70% de réduction</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Se termine dans</Text>
          <Text style={styles.timerValue}>23:45:12</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <IoTrendingDownOutline size={24} color="#EF4444" />
          <Text style={styles.statLabel}>Réduction moyenne</Text>
          <Text style={styles.statValue}>45%</Text>
        </View>
        <View style={styles.statCard}>
          <IoTagOutline size={24} color="#3B82F6" />
          <Text style={styles.statLabel}>Offres disponibles</Text>
          <Text style={styles.statValue}>{products.length}</Text>
        </View>
        <View style={styles.statCard}>
          <IoStarOutline size={24} color="#10B981" />
          <Text style={styles.statLabel}>Note moyenne</Text>
          <Text style={styles.statValue}>4.5/5</Text>
        </View>
      </View>

      {/* Search and Sort */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IoSearchOutline size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une offre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'discount' && styles.sortButtonActive]}
          onPress={() => setSortBy('discount')}
        >
          <Text style={[styles.sortText, sortBy === 'discount' && styles.sortTextActive]}>
            Meilleure réduction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>
            Prix croissant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
          onPress={() => setSortBy('popular')}
        >
          <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>
            Plus populaires
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <ScrollView style={styles.productsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Chargement...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <IoTagOutline size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucune offre trouvée</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push(`/products/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.productImage}
                />
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-30%</Text>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.oldPrice}>
                      {(product.prices[0].price * 1.3).toFixed(0)} FCFA
                    </Text>
                    <Text style={styles.newPrice}>
                      {product.prices[0].price.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                  {product.rating && (
                    <View style={styles.ratingContainer}>
                      <IoStarOutline size={14} color="#FBBF24" />
                      <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>
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
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  promoBanner: {
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#EF4444',
  },
  sortText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sortTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: '1%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
