import { create } from 'zustand';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import * as algoliaService from '../services/algoliaService';

interface ProductsState {
  products: Product[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDocId: string | null;

  // Actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  searchProducts: (searchQuery: string, options?: { page?: number; category?: string }) => Promise<void>;
  loadMore: () => Promise<void>;
  fetchSimilarProducts?: (productId: string, category: string, limit: number) => Promise<Product[]>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  error: null,
  hasMore: true,
  lastDocId: null,

  fetchProducts: async (filters = {}) => {
    // Si c'est une recherche, utiliser la logique Algolia
    if (filters.search) {
      return get().searchProducts(filters.search, { category: filters.category });
    }

    set({ loading: true, error: null, lastDocId: null, hasMore: true });
    try {
      const response = await productsAPI.getAll({
        category: filters.category,
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
      set({ error: error.message, loading: false });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productsAPI.getAll({
        limit: 10,
        // On pourrait ajouter un filtre isActive: true ici si nécessaire
      });

      if (response.success) {
        set({
          featuredProducts: response.products,
          loading: false
        });
      }
    } catch (error: any) {
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
  },

  searchProducts: async (searchQuery: string, options = {}) => {
    set({ loading: true, error: null, products: [], hasMore: true, lastDocId: null });

    try {
      console.log('🔍 [Store] Algolia search starting for:', searchQuery);
      const result = await algoliaService.searchProducts(searchQuery, {
        category: options.category,
        page: options.page || 0,
        limit: 20
      });

      console.log('✅ [Store] Algolia result:', result.hits.length, 'products found');

      // Mapper les résultats Algolia vers le type Product (si nécessaire, ici les types sont compatibles)
      set({
        products: result.hits as any as Product[],
        hasMore: result.hasMore,
        lastDocId: result.hasMore ? `page-${result.currentPage + 1}` : null,
        loading: false
      });
    } catch (error: any) {
      console.error('❌ [Store] Algolia search error:', error);
      set({ error: error.message, loading: false });
    }
  },

  loadMore: async () => {
    const { lastDocId, hasMore, loading, products } = get();

    if (!hasMore || loading || !lastDocId) return;

    // Gestion de la pagination Algolia (ex: lastDocId = 'page-1')
    if (lastDocId.startsWith('page-')) {
      const page = parseInt(lastDocId.split('-')[1]);
      set({ loading: true });
      try {
        const result = await algoliaService.searchProducts('', {
          page,
          limit: 20
        });
        set(state => ({
          products: [...state.products, ...result.hits as any as Product[]],
          hasMore: result.hasMore,
          lastDocId: result.hasMore ? `page-${result.currentPage + 1}` : null,
          loading: false
        }));
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
      return;
    }

    // Gestion standard Firestore
    set({ loading: true });
    try {
      const response = await productsAPI.getAll({
        limit: 20,
        lastDocId: lastDocId,
      });

      if (response.success) {
        set(state => ({
          products: [...state.products, ...response.products],
          hasMore: response.hasMore || false,
          lastDocId: response.lastDocId || null,
          loading: false
        }));
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));


