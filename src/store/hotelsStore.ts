import { create } from 'zustand';
import { Product } from '../types';
import api from '../services/api';

interface HotelsState {
  hotels: Product[];
  currentHotel: Product | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchHotels: (params?: { city?: string; features?: string[]; limit?: number }) => Promise<void>;
  fetchHotelById: (id: string) => Promise<void>;
  clearCurrentHotel: () => void;
  clearError: () => void;
}

export const useHotelsStore = create<HotelsState>((set) => ({
  hotels: [],
  currentHotel: null,
  loading: false,
  error: null,

  fetchHotels: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/mobile/hotels', { params });
      
      if (response.data?.success && Array.isArray(response.data.hotels)) {
        set({ hotels: response.data.hotels, loading: false });
      } else {
        set({ hotels: [], loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement des hôtels',
        loading: false 
      });
    }
  },

  fetchHotelById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/mobile/hotels/${id}`);
      
      if (response.data?.success && response.data.hotel) {
        set({ currentHotel: response.data.hotel, loading: false });
      } else {
        set({ 
          error: 'Hôtel non trouvé',
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement de l\'hôtel',
        loading: false 
      });
    }
  },

  clearCurrentHotel: () => set({ currentHotel: null }),
  clearError: () => set({ error: null }),
}));
