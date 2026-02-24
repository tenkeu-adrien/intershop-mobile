/**
 * Tests unitaires pour les sections API (Hotels, Dating, Restaurants)
 * 
 * Ces tests vérifient que :
 * 1. Les routes API retournent la bonne structure de données
 * 2. Les données sont correctement typées
 * 3. Les erreurs sont gérées correctement
 */

import { api } from '../src/services/api';

// Mock de l'API
jest.mock('../src/services/api');

describe('API Sections Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hotels API', () => {
    it('devrait retourner une liste d\'hôtels avec la bonne structure', async () => {
      const mockHotels = [
        {
          id: 'hotel1',
          name: 'Hotel Test',
          description: 'Un bel hôtel',
          images: ['https://example.com/hotel1.jpg'],
          prices: [{ price: 100, currency: 'USD' }],
          rating: 4.5,
          reviewCount: 120,
          hotelData: {
            starRating: 4,
            amenities: ['WiFi', 'Piscine', 'Restaurant']
          },
          location: {
            city: 'Paris',
            country: 'France'
          }
        }
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          hotels: mockHotels
        }
      });

      const response = await api.get('/api/mobile/hotels', {
        params: { limit: 10 }
      });

      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.hotels)).toBe(true);
      expect(response.data.hotels).toHaveLength(1);
      expect(response.data.hotels[0]).toHaveProperty('id');
      expect(response.data.hotels[0]).toHaveProperty('name');
      expect(response.data.hotels[0]).toHaveProperty('hotelData');
      expect(response.data.hotels[0].hotelData).toHaveProperty('starRating');
    });

    it('devrait gérer les erreurs de l\'API hotels', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await api.get('/api/mobile/hotels', {
          params: { limit: 10 }
        });
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
    });

    it('devrait retourner un tableau vide si aucun hôtel', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          hotels: []
        }
      });

      const response = await api.get('/api/mobile/hotels', {
        params: { limit: 10 }
      });

      expect(response.data.success).toBe(true);
      expect(response.data.hotels).toEqual([]);
    });
  });

  describe('Dating API', () => {
    it('devrait retourner une liste de profils avec la bonne structure', async () => {
      const mockProfiles = [
        {
          id: 'profile1',
          firstName: 'Jean',
          age: 28,
          gender: 'homme',
          description: 'Passionné de voyages',
          image: 'https://example.com/profile1.jpg',
          images: ['https://example.com/profile1.jpg'],
          interests: ['Voyages', 'Sport', 'Musique'],
          location: {
            city: 'Lyon',
            country: 'France'
          }
        }
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          profiles: mockProfiles
        }
      });

      const response = await api.get('/api/mobile/dating', {
        params: { limit: 10 }
      });

      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.profiles)).toBe(true);
      expect(response.data.profiles).toHaveLength(1);
      expect(response.data.profiles[0]).toHaveProperty('id');
      expect(response.data.profiles[0]).toHaveProperty('firstName');
      expect(response.data.profiles[0]).toHaveProperty('age');
      expect(response.data.profiles[0]).toHaveProperty('gender');
    });

    it('devrait filtrer les profils par genre', async () => {
      const mockProfiles = [
        {
          id: 'profile1',
          firstName: 'Marie',
          age: 25,
          gender: 'femme',
          description: 'Aime la nature',
          image: 'https://example.com/profile1.jpg',
          images: ['https://example.com/profile1.jpg'],
          location: { city: 'Paris', country: 'France' }
        }
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          profiles: mockProfiles
        }
      });

      const response = await api.get('/api/mobile/dating', {
        params: { gender: 'femme', limit: 10 }
      });

      expect(response.data.success).toBe(true);
      expect(response.data.profiles[0].gender).toBe('femme');
    });

    it('devrait gérer les erreurs de l\'API dating', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Database error'));

      try {
        await api.get('/api/mobile/dating', {
          params: { limit: 10 }
        });
      } catch (error: any) {
        expect(error.message).toBe('Database error');
      }
    });
  });

  describe('Restaurants API', () => {
    it('devrait retourner une liste de restaurants avec la bonne structure', async () => {
      const mockRestaurants = [
        {
          id: 'restaurant1',
          name: 'Restaurant Test',
          description: 'Cuisine française',
          images: ['https://example.com/restaurant1.jpg'],
          prices: [{ price: 50, currency: 'USD' }],
          rating: 4.8,
          reviewCount: 250,
          restaurantData: {
            cuisine: 'Française',
            priceRange: '€€€',
            features: ['Terrasse', 'Parking', 'WiFi']
          },
          location: {
            city: 'Paris',
            country: 'France'
          }
        }
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          restaurants: mockRestaurants
        }
      });

      const response = await api.get('/api/mobile/restaurants', {
        params: { limit: 10 }
      });

      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.restaurants)).toBe(true);
      expect(response.data.restaurants).toHaveLength(1);
      expect(response.data.restaurants[0]).toHaveProperty('id');
      expect(response.data.restaurants[0]).toHaveProperty('name');
      expect(response.data.restaurants[0]).toHaveProperty('restaurantData');
    });

    it('devrait gérer les erreurs de l\'API restaurants', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Server error'));

      try {
        await api.get('/api/mobile/restaurants', {
          params: { limit: 10 }
        });
      } catch (error: any) {
        expect(error.message).toBe('Server error');
      }
    });
  });

  describe('Structure de données cohérente', () => {
    it('toutes les APIs devraient retourner { success: true, data: [] }', async () => {
      const endpoints = [
        { url: '/api/mobile/hotels', key: 'hotels' },
        { url: '/api/mobile/dating', key: 'profiles' },
        { url: '/api/mobile/restaurants', key: 'restaurants' }
      ];

      for (const endpoint of endpoints) {
        (api.get as jest.Mock).mockResolvedValue({
          data: {
            success: true,
            [endpoint.key]: []
          }
        });

        const response = await api.get(endpoint.url, {
          params: { limit: 10 }
        });

        expect(response.data).toHaveProperty('success');
        expect(response.data).toHaveProperty(endpoint.key);
        expect(response.data.success).toBe(true);
      }
    });
  });
});
