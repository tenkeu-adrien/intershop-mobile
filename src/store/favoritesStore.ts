import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface FavoriteItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  addedAt: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  loading: boolean;
  
  // Actions
  loadFavorites: (userId: string) => Promise<void>;
  addToFavorites: (userId: string, product: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  removeFromFavorites: (userId: string, productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const FAVORITES_STORAGE_KEY = '@intershop_favorites';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,

  loadFavorites: async (userId: string) => {
    try {
      set({ loading: true });
      
      // Try to load from API first
      try {
        const response = await api.get(`/api/favorites/${userId}`);
        if (response.data.success) {
          set({ favorites: response.data.favorites });
          // Save to local storage
          await AsyncStorage.setItem(
            `${FAVORITES_STORAGE_KEY}_${userId}`,
            JSON.stringify(response.data.favorites)
          );
          return;
        }
      } catch (apiError) {
        console.log('API not available, loading from local storage');
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(`${FAVORITES_STORAGE_KEY}_${userId}`);
      if (stored) {
        set({ favorites: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      set({ loading: false });
    }
  },

  addToFavorites: async (userId: string, product) => {
    try {
      const newFavorite: FavoriteItem = {
        ...product,
        addedAt: new Date().toISOString(),
      };

      // Update local state immediately
      set((state) => ({
        favorites: [newFavorite, ...state.favorites],
      }));

      // Save to local storage
      const updatedFavorites = [newFavorite, ...get().favorites];
      await AsyncStorage.setItem(
        `${FAVORITES_STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedFavorites)
      );

      // Sync with API in background
      try {
        await api.post(`/api/favorites/${userId}`, {
          productId: product.productId,
        });
      } catch (apiError) {
        console.log('Failed to sync with API, saved locally');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  removeFromFavorites: async (userId: string, productId: string) => {
    try {
      // Update local state immediately
      set((state) => ({
        favorites: state.favorites.filter((item) => item.productId !== productId),
      }));

      // Save to local storage
      const updatedFavorites = get().favorites;
      await AsyncStorage.setItem(
        `${FAVORITES_STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedFavorites)
      );

      // Sync with API in background
      try {
        await api.delete(`/api/favorites/${userId}/${productId}`);
      } catch (apiError) {
        console.log('Failed to sync with API, removed locally');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  isFavorite: (productId: string) => {
    return get().favorites.some((item) => item.productId === productId);
  },

  clearFavorites: () => {
    set({ favorites: [] });
  },
}));
