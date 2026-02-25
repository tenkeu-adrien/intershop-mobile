import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../src/store/cartStore';
import { useProductsStore } from '../../src/store/productsStore';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { useCurrencyStore } from '../../src/store/currencyStore';
import { useAuthStore } from '../../src/store/authStore';
import { Product } from '../../src/types';
import { ProductChatActions } from '../../src/components/ProductChatActions';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { fetchProductById, fetchSimilarProducts } = useProductsStore();
  const { convertPrice, formatPrice } = useCurrencyStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [fournisseur, setFournisseur] = useState<{ name: string; photo?: string } | null>(null);
  
  // Favorites integration
  const { addToFavorites, removeFromFavorites, isFavorite, loadFavorites } = useFavoritesStore();
  const isInWishlist = product ? isFavorite(product.id) : false;

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (product) {
      setQuantity(product.moq || 1);
      loadSimilarProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await fetchProductById(params.id as string);
      
      if (!productData) {
        Alert.alert(t('product_detail.error'), t('product_detail.not_found'));
        router.back();
        return;
      }
      
      setProduct(productData);

      // Charger les infos du fournisseur
      if (productData.fournisseurId) {
        try {
          // TODO: Créer un endpoint API pour récupérer les infos du fournisseur
          // Pour l'instant, on utilise des données par défaut
          setFournisseur({
            name: t('product_detail.seller'),
            photo: undefined,
          });
        } catch (fournisseurError) {
          console.error('Error loading fournisseur:', fournisseurError);
          setFournisseur({
            name: t('product_detail.seller'),
            photo: undefined,
          });
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert(t('product_detail.error'), t('product_detail.unable_to_load'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const currentPrice = product.prices[selectedPriceTier];
    
    addToCart(product, quantity);

    Alert.alert(
      t('product_detail.added_to_cart'),
      t('product_detail.added_to_cart_message', { name: product.name }),
      [
        { text: t('product_detail.continue'), style: 'cancel' },
        { text: t('product_detail.view_cart'), onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  const loadSimilarProducts = async () => {
    if (!product || loadingSimilar) return;

    setLoadingSimilar(true);
    try {
      console.log('🔍 [Product Detail] Loading similar products...');
      const products = await fetchSimilarProducts(product.id, product.category, 6);
      console.log('✅ [Product Detail] Similar products loaded:', products.length);
      setSimilarProducts(products);
    } catch (error) {
      console.error('❌ [Product Detail] Error loading similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    if (isInWishlist) {
      await removeFromFavorites(product.id);
      Alert.alert(t('product_detail.removed_from_favorites'), t('product_detail.removed_from_favorites_message'));
    } else {
      await addToFavorites(product);
      Alert.alert(t('product_detail.added_to_favorites'), t('product_detail.added_to_favorites_message'));
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      const price = formatPrice(convertPrice(product.prices[0]?.price || 0));
      await Share.share({
        message: `Découvrez ce produit: ${product.name}\n\nPrix: ${price}`,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactSeller = () => {
    if (!product) return;
    router.push(`/chat?productId=${product.id}&fournisseurId=${product.fournisseurId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t('product_detail.loading')}</Text>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  const currentPrice = product.prices[selectedPriceTier];
  const totalPrice = currentPrice.price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImage] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailsContainer}
              contentContainerStyle={styles.thumbnailsContent}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailSelected,
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount.toString()} {t('product_detail.reviews')})
            </Text>
            <Text style={styles.salesText}>• {product.sales.toString()} {t('product_detail.sold')}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(convertPrice(currentPrice.price))}
            </Text>
            <Text style={styles.priceUnit}>{t('product_detail.per_unit')}</Text>
          </View>

          {product.moq > 1 && (
            <Text style={styles.moqText}>
              {t('product_detail.min_quantity', { moq: product.moq })}
            </Text>
          )}

          {/* Price Tiers */}
          {product.prices.length > 1 && (
            <View style={styles.priceTiersContainer}>
              <Text style={styles.sectionTitle}>{t('product_detail.price_per_quantity')}</Text>
              <View style={styles.priceTiersGrid}>
                {product.prices.map((tier, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedPriceTier(index)}
                    style={[
                      styles.priceTier,
                      selectedPriceTier === index && styles.priceTierSelected,
                    ]}
                  >
                    <Text style={styles.priceTierQuantity}>
                      {tier.minQuantity.toString()}
                      {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} {t('product_detail.units')}
                    </Text>
                    <Text style={styles.priceTierPrice}>
                      {formatPrice(convertPrice(tier.price))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>{t('product_detail.quantity')}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                disabled={quantity <= (product.moq || 1)}
                style={[
                  styles.quantityButton,
                  quantity <= (product.moq || 1) && styles.quantityButtonDisabled,
                ]}
              >
                <Ionicons name="remove" size={20} color="#1F2937" />
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
                style={[
                  styles.quantityButton,
                  quantity >= product.stock && styles.quantityButtonDisabled,
                ]}
              >
                <Ionicons name="add" size={20} color="#1F2937" />
              </TouchableOpacity>

              <Text style={styles.stockText}>{product.stock.toString()} {t('product_detail.available')}</Text>
            </View>

            <Text style={styles.totalPrice}>
              {t('product_detail.total')}{' '}
              <Text style={styles.totalPriceValue}>
                {formatPrice(convertPrice(totalPrice))}
              </Text>
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="car" size={24} color="#10B981" />
              <Text style={styles.featureText}>{product.deliveryTime || t('product_detail.fast_delivery')}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <Text style={styles.featureText}>{t('product_detail.buyer_protection')}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
              <Text style={styles.featureText}>{t('product_detail.support_24_7')}</Text>
            </View>
          </View>

          {/* Product Chat Actions */}
          {fournisseur && (
            <ProductChatActions
              product={product}
              fournisseur={fournisseur}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleAddToWishlist}
              style={styles.iconButton}
            >
              <Ionicons 
                name={isInWishlist ? "heart" : "heart-outline"} 
                size={24} 
                color={isInWishlist ? "#EF4444" : "#6B7280"} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconButton}
            >
              <Ionicons name="share-social" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>{t('product_detail.product_description')}</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.sectionTitle}>{t('product_detail.tags')}</Text>
              <View style={styles.tagsGrid}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <View style={styles.certificationsContainer}>
              <Text style={styles.sectionTitle}>{t('product_detail.certifications')}</Text>
              <View style={styles.certificationsGrid}>
                {product.certifications.map((cert, index) => (
                  <View key={index} style={styles.certification}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('product_detail.category')}</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            {product.subcategory && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('product_detail.subcategory')}</Text>
                <Text style={styles.detailValue}>{product.subcategory}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('product_detail.origin_country')}</Text>
              <Text style={styles.detailValue}>{product.country}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('product_detail.stock')}</Text>
              <Text style={styles.detailValue}>{product.stock.toString()} {t('product_detail.units')}</Text>
            </View>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarProductsContainer}>
              <View style={styles.similarProductsHeader}>
                <Text style={styles.sectionTitle}>{t('product_detail.similar_products')}</Text>
                <TouchableOpacity onPress={() => router.push(`/categories?category=${product.category}`)}>
                  <Text style={styles.seeAllText}>{t('product_detail.see_all')}</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                data={similarProducts}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.similarProductCard}
                    onPress={() => {
                      router.push(`/products/${item.id}`);
                    }}
                  >
                    <Image
                      source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
                      style={styles.similarProductImage}
                    />
                    <Text style={styles.similarProductName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.similarProductRating}>
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text style={styles.similarProductRatingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.similarProductPrice}>
                      {formatPrice(convertPrice(item.prices[0]?.price || 0))}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.similarProductsList}
              />
            </View>
          )}

          {loadingSimilar && (
            <View style={styles.loadingSimilar}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingSimilarText}>{t('product_detail.loading_similar')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          style={styles.addToCartButton}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToCartGradient}
          >
            <Ionicons name="cart" size={24} color="white" />
            <Text style={styles.addToCartText}>
              {product.stock === 0 ? t('product_detail.out_of_stock') : t('product_detail.add_to_cart')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'white',
  },
  mainImage: {
    width: width,
    height: width,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shareButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  thumbnailsContent: {
    paddingHorizontal: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#10B981',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  salesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 8,
  },
  priceUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  moqText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  priceTiersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  priceTiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceTier: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  priceTierSelected: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  priceTierQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceTierPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 12,
  },
  totalPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  certificationsContainer: {
    marginBottom: 20,
  },
  certificationsGrid: {
    gap: 8,
  },
  certification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  certificationText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  similarProductsContainer: {
    marginBottom: 20,
  },
  similarProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  similarProductsList: {
    paddingRight: 16,
  },
  similarProductCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  similarProductImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  similarProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    padding: 8,
    paddingBottom: 4,
    height: 40,
  },
  similarProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    marginBottom: 4,
  },
  similarProductRatingText: {
    fontSize: 11,
    color: '#6B7280',
  },
  similarProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  loadingSimilar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingSimilarText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
