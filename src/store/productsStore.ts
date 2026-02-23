import { create } from 'zustand';
import { Product } from '../types';
import { productsAPI } from '../services/api';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDocId: string | null;
  
  // Actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  searchProducts: (searchQuery: string) => Promise<void>;
  loadMore: () => Promise<void>;
  fetchSimilarProducts?: (productId: string, category: string, limit: number) => Promise<Product[]>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  hasMore: true,
  lastDocId: null,

  fetchProducts: async (filters = {}) => {
    set({ loading: true, error: null, lastDocId: null, hasMore: true });
    try {
      const response = await productsAPI.getAll({
        category: filters.category,
        search: filters.search,
        limit: 20,
      });

      if (response.success) {
        console.log('✅ [Store] Products fetched:', response.products.length);
        console.log('✅ [Store] Has more:', response.hasMore);
        console.log('✅ [Store] Last doc ID:', response.lastDocId);
        set({ 
          products: response.products,
          hasMore: response.hasMore || false,
          lastDocId: response.lastDocId || null,
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('❌ [Store] Error fetching products:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      const response = await productsAPI.getById(id);
      
      if (response.success) {
        return response.product as Product;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  fetchSimilarProducts: async (productId: string, category: string, limit: number = 6) => {
    try {
      console.log('🔍 [Store] Fetching similar products...');
      const response = await productsAPI.getSimilar(productId, category, limit);
      
      if (response.success) {
        console.log('✅ [Store] Similar products fetched:', response.products.length);
        return response.products as Product[];
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [Store] Error fetching similar products:', error);
      return [];
    }
  } ,

  searchProducts: async (searchQuery: string) => {
    set({ loading: true, error: null, lastDocId: null, hasMore: true });
    try {
      const response = await productsAPI.getAll({
        search: searchQuery,
        limit: 20,
      });

      if (response.success) {
        set({ 
          products: response.products,
          hasMore: response.hasMore || false,
          lastDocId: response.lastDocId || null,
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      set({ error: error.message, loading: false });
    }
  },

  loadMore: async () => {
    const { lastDocId, hasMore, loading, products } = get();
    
    console.log('🔄 [Store] Load more called:', { lastDocId, hasMore, loading, currentCount: products.length });
    
    if (!hasMore || loading || !lastDocId) {
      console.log('⏭️ [Store] Skip load more');
      return;
    }

    set({ loading: true });
    try {
      console.log('📡 [Store] Fetching more products with lastDocId:', lastDocId);
      const response = await productsAPI.getAll({
        limit: 20,
        lastDocId: lastDocId,
      });

      if (response.success) {
        console.log('✅ [Store] More products loaded:', response.products.length);
        console.log('✅ [Store] New hasMore:', response.hasMore);
        console.log('✅ [Store] New lastDocId:', response.lastDocId);
        
        set(state => ({ 
          products: [...state.products, ...response.products],
          hasMore: response.hasMore || false,
          lastDocId: response.lastDocId || null,
          loading: false 
        }));
      }
    } catch (error: any) {
      console.error('❌ [Store] Error loading more products:', error);
      set({ error: error.message, loading: false });
    }
  },
}));


