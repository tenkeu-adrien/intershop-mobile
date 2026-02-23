import { create } from 'zustand';
import { Product } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favorites: Product[];
  loading: boolean;
  
  // Actions
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loadFavorites: () => Promise<void>;
  saveFavorites: () => Promise<void>;
}

const FAVORITES_KEY = '@intershop_favorites';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,

  addToFavorites: async (product: Product) => {
    const favorites = get().favorites;
    const exists = favorites.find(fav => fav.id === product.id);
    
    if (!exists) {
      set({ favorites: [...favorites, product] });
      await get().saveFavorites();
    }
  },

  removeFromFavorites: async (productId: string) => {
    set({
      favorites: get().favorites.filter(fav => fav.id !== productId),
    });
    await get().saveFavorites();
  },

  isFavorite: (productId: string) => {
    return get().favorites.some(fav => fav.id === productId);
  },

  loadFavorites: async () => {
    set({ loading: true });
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        set({ favorites: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      set({ loading: false });
    }
  },

  saveFavorites: async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(get().favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },
}));
