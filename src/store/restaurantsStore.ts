import { create } from 'zustand';
import { Product } from '../types';
import api from '../services/api';

interface RestaurantsState {
  restaurants: Product[];
  currentRestaurant: Product | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRestaurants: (params?: { city?: string; priceRange?: string; limit?: number }) => Promise<void>;
  fetchRestaurantById: (id: string) => Promise<void>;
  clearCurrentRestaurant: () => void;
  clearError: () => void;
}

export const useRestaurantsStore = create<RestaurantsState>((set) => ({
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,

  fetchRestaurants: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/mobile/restaurants', { params });
      
      if (response.data?.success && Array.isArray(response.data.restaurants)) {
        set({ restaurants: response.data.restaurants, loading: false });
      } else {
        set({ restaurants: [], loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement des restaurants',
        loading: false 
      });
    }
  },

  fetchRestaurantById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/mobile/restaurants/${id}`);
      
      if (response.data?.success && response.data.restaurant) {
        set({ currentRestaurant: response.data.restaurant, loading: false });
      } else {
        set({ 
          error: 'Restaurant non trouvé',
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement du restaurant',
        loading: false 
      });
    }
  },

  clearCurrentRestaurant: () => set({ currentRestaurant: null }),
  clearError: () => set({ error: null }),
}));
