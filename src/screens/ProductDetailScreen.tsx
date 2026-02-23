import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { 
  IoStarOutline,
  IoStar,
  IoCartOutline,
  IoHeartOutline,
  IoShareOutline,
  IoTruckOutline,
  IoShieldCheckmarkOutline,
  IoChatbubbleOutline,
  IoAddOutline,
  IoRemoveOutline
} from 'react-icons/io5';
import { useCartStore } from '../store/cartStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [fournisseur, setFournisseur] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setQuantity(product.moq || 1);
    }
  }, [product]);

  const getProduct = async (productId: string) => {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() };
    }
    return null;
  };

  const loadProduct = async () => {
    try {
      const productData = await getProduct(productId);
      
      if (!productData) {
        navigation.goBack();
        return;
      }
      
      setProduct(productData);

      try {
        const fournisseurDoc = await getDoc(doc(db, 'users', productData.fournisseurId));
        if (fournisseurDoc.exists()) {
          const fournisseurData = fournisseurDoc.data();
          setFournisseur({
            name: fournisseurData.displayName || fournisseurData.shopName || 'Vendeur',
            photo: fournisseurData.photoURL || fournisseurData.shopLogo,
          });
        }
      } catch (error) {
        console.error('Error loading fournisseur:', error);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const currentPrice = product.prices[selectedPriceTier];
    
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      quantity,
      price: currentPrice.price,
      fournisseurId: product.fournisseurId,
      moq: product.moq,
    });

    navigation.navigate('Panier');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  const currentPrice = product.prices[selectedPriceTier];
  const totalPrice = currentPrice.price * quantity;

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[selectedImage] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Thumbnails */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailsContainer}
        >
          {product.images.map((image: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(index)}
              style={[
                styles.thumbnail,
                selectedImage === index && styles.thumbnailSelected
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
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.rating) ? (
                <IoStar key={i} size={18} color="#FBBF24" />
              ) : (
                <IoStarOutline key={i} size={18} color="#D1D5DB" />
              )
            ))}
          </View>
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)} ({product.reviewCount} avis)
          </Text>
          <Text style={styles.salesText}>• {product.sales} vendus</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${currentPrice.price}</Text>
          <Text style={styles.priceUnit}>/ unité</Text>
        </View>
        {product.moq > 1 && (
          <Text style={styles.moqText}>
            Quantité minimum: {product.moq} unités
          </Text>
        )}

        {/* Price Tiers */}
        {product.prices.length > 1 && (
          <View style={styles.priceTiersContainer}>
            <Text style={styles.sectionTitle}>Prix par quantité:</Text>
            <View style={styles.priceTiersGrid}>
              {product.prices.map((tier: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedPriceTier(index)}
                  style={[
                    styles.priceTier,
                    selectedPriceTier === index && styles.priceTierSelected
                  ]}
                >
                  <Text style={styles.priceTierQuantity}>
                    {tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} unités
                  </Text>
                  <Text style={styles.priceTierPrice}>${tier.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantité:</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
              disabled={quantity <= (product.moq || 1)}
              style={[
                styles.quantityButton,
                quantity <= (product.moq || 1) && styles.quantityButtonDisabled
              ]}
            >
              <IoRemoveOutline size={20} color="#111827" />
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{quantity}</Text>
            
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
              style={[
                styles.quantityButton,
                quantity >= product.stock && styles.quantityButtonDisabled
              ]}
            >
              <IoAddOutline size={20} color="#111827" />
            </TouchableOpacity>
            
            <Text style={styles.stockText}>{product.stock} disponibles</Text>
          </View>
          <Text style={styles.totalPrice}>
            Total: <Text style={styles.totalPriceValue}>${totalPrice.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            style={[
              styles.addToCartButton,
              product.stock === 0 && styles.addToCartButtonDisabled
            ]}
          >
            <IoCartOutline size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <IoHeartOutline size={24} color="#EF4444" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <IoShareOutline size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <IoTruckOutline size={24} color="#10B981" />
            <Text style={styles.featureText}>{product.deliveryTime || 'Livraison rapide'}</Text>
          </View>
          <View style={styles.feature}>
            <IoShieldCheckmarkOutline size={24} color="#10B981" />
            <Text style={styles.featureText}>Protection acheteur</Text>
          </View>
          <View style={styles.feature}>
            <IoChatbubbleOutline size={24} color="#10B981" />
            <Text style={styles.featureText}>Support 24/7</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description du produit</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Catégorie</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          {product.subcategory && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sous-catégorie</Text>
              <Text style={styles.detailValue}>{product.subcategory}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pays d'origine</Text>
            <Text style={styles.detailValue}>{product.country}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock</Text>
            <Text style={styles.detailValue}>{product.stock} unités</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#6B7280',
  },
  imageContainer: {
    backgroundColor: '#fff',
  },
  mainImage: {
    width: width,
    height: width,
  },
  thumbnailsContainer: {
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
    color: '#111827',
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
    color: '#111827',
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
    color: '#111827',
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
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
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 12,
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
    color: '#111827',
  },
});
