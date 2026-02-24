import { create } from 'zustand';
import { DatingProfile } from '../types/dating';
import api from '../services/api';

interface DatingState {
  profiles: DatingProfile[];
  currentProfile: DatingProfile | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  genderFilter: string;
  minAge: number;
  maxAge: number;
  
  // Actions
  fetchProfiles: (params?: { gender?: string; minAge?: number; maxAge?: number; limit?: number }) => Promise<void>;
  fetchProfileById: (id: string) => Promise<void>;
  setGenderFilter: (gender: string) => void;
  setAgeRange: (min: number, max: number) => void;
  clearCurrentProfile: () => void;
  clearError: () => void;
}

export const useDatingStore = create<DatingState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: false,
  error: null,
  genderFilter: '',
  minAge: 18,
  maxAge: 99,

  fetchProfiles: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/mobile/dating', { params });
      
      if (response.data?.success && Array.isArray(response.data.profiles)) {
        set({ profiles: response.data.profiles, loading: false });
      } else {
        set({ profiles: [], loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching dating profiles:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement des profils',
        loading: false 
      });
    }
  },

  fetchProfileById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/mobile/dating/${id}`);
      
      if (response.data?.success && response.data.profile) {
        set({ currentProfile: response.data.profile, loading: false });
      } else {
        set({ 
          error: 'Profil non trouvé',
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error fetching dating profile:', error);
      set({ 
        error: error.message || 'Erreur lors du chargement du profil',
        loading: false 
      });
    }
  },

  setGenderFilter: (gender: string) => set({ genderFilter: gender }),
  setAgeRange: (min: number, max: number) => set({ minAge: min, maxAge: max }),
  clearCurrentProfile: () => set({ currentProfile: null }),
  clearError: () => set({ error: null }),
}));
