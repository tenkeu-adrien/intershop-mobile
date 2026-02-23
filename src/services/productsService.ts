import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

export type ProductCategory = 'ecommerce' | 'restaurant' | 'hotel' | 'dating';

/**
 * Récupère un produit par son ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * Récupère les produits par catégorie (restaurant, hotel, ecommerce)
 */
export async function getProductsByCategory(
  category: ProductCategory,
  filters?: {
    city?: string;
    priceRange?: string;
    features?: string[];
    userLocation?: { latitude: number; longitude: number };
    maxDistance?: number;
    limitCount?: number;
  }
): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const constraints: QueryConstraint[] = [
      where('serviceCategory', '==', category),
      where('isActive', '==', true),
      orderBy('rating', 'desc'),
    ];
    
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }
    
    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    // Apply filters
    if (filters?.city) {
      products = products.filter(p => 
        p.location?.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    if (filters?.priceRange && category === 'restaurant') {
      products = products.filter(p => 
        p.restaurantData?.priceRange === filters.priceRange
      );
    }
    
    if (filters?.features && filters.features.length > 0) {
      products = products.filter(p => {
        const productFeatures = category === 'restaurant' 
          ? p.restaurantData?.features 
          : p.hotelData?.amenities;
        return filters.features!.some(f => productFeatures?.includes(f));
      });
    }
    
    // Calculate distances if user location provided
    if (filters?.userLocation && (category === 'restaurant' || category === 'hotel')) {
      products = products.map(p => {
        if (p?.location) {
          const distance = calculateDistance(
            filters.userLocation!.latitude,
            filters.userLocation!.longitude,
            p.location.latitude,
            p.location.longitude
          );
          return { ...p, distance } as any;
        }
        return p;
      });
      
      // Filter by max distance
      if (filters.maxDistance) {
        products = products.filter(p => 
          (p as any).distance !== undefined && (p as any).distance <= filters.maxDistance!
        );
      }
      
      // Sort by distance
      products.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
    }
    
    return products;
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
}

/**
 * Recherche de produits avec filtres
 */
export async function searchProducts(
  searchQuery: string,
  category?: ProductCategory,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
    limitCount?: number;
  }
): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
    ];
    
    if (category) {
      constraints.push(where('serviceCategory', '==', category));
    }
    
    if (filters?.minRating) {
      constraints.push(where('rating', '>=', filters.minRating));
    }
    
    // Sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        constraints.push(orderBy('prices', 'asc'));
        break;
      case 'price_desc':
        constraints.push(orderBy('prices', 'desc'));
        break;
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'popular':
        constraints.push(orderBy('sales', 'desc'));
        break;
      case 'rating':
        constraints.push(orderBy('rating', 'desc'));
        break;
      default:
        constraints.push(orderBy('createdAt', 'desc'));
    }
    
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }
    
    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    // Filter by search query (client-side)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by price range
    if (filters?.minPrice !== undefined) {
      products = products.filter(p => 
        p.prices && p.prices[0]?.price >= filters.minPrice!
      );
    }
    
    if (filters?.maxPrice !== undefined) {
      products = products.filter(p => 
        p.prices && p.prices[0]?.price <= filters.maxPrice!
      );
    }
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Calcule la distance entre deux points géographiques (en km)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Récupère les produits d'un fournisseur
 */
export async function getFournisseurProducts(fournisseurId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('fournisseurId', '==', fournisseurId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting fournisseur products:', error);
    return [];
  }
}
