import { create } from 'zustand';
import * as Location from 'expo-location';

interface GeolocationState {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  
  requestLocation: () => Promise<void>;
  calculateDistance: (lat: number, lng: number) => number | null;
}

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  userLocation: null,
  permissionGranted: false,
  loading: false,
  error: null,
  
  requestLocation: async () => {
    set({ loading: true, error: null });
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        set({ 
          error: 'Permission de géolocalisation refusée',
          loading: false,
          permissionGranted: false
        });
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      
      set({
        userLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        permissionGranted: true,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de la récupération de la position',
        loading: false,
      });
    }
  },
  
  calculateDistance: (lat: number, lng: number) => {
    const { userLocation } = get();
    if (!userLocation) return null;
    
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (lng - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * 
      Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
}));
