// Service API pour communiquer avec alibaba-clone backend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API - À configurer selon votre environnement
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.187:3000';

// Clé pour stocker le token
const TOKEN_KEY = '@intershop_token';
const USER_KEY = '@intershop_user';

// Créer une instance axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Logs de debugging
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      console.log('📤 Base URL:', config.baseURL);
      console.log('📤 Full URL:', `${config.baseURL}${config.url}`);
      
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token ajouté');
      } else {
        console.log('⚠️ Pas de token');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', error.message);
    console.error('❌ Error Code:', error.code);
    
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
      const errorData: any = error.response.data;
      const errorMessage = errorData?.error || errorData?.message || 'Erreur serveur';
      console.error('API Error Response:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      console.error('❌ No Response - Request was sent but no response received');
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Base URL:', error.config?.baseURL);
      console.error('API No Response:', error.message);
      throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      console.error('❌ Request Setup Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  /**
   * Connexion utilisateur
   */
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/api/mobile/auth/login', {
      email,
      password,
    });

    const data = response.data;

    // Sauvegarder le token et l'utilisateur
    if (data.success && data.token) {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Inscription utilisateur
   */
  register: async (
    email: string,
    password: string,
    displayName: string,
    role: string
  ) => {
    const response = await axiosInstance.post('/api/mobile/auth/register', {
      email,
      password,
      displayName,
      role,
    });

    const data = response.data;

    // Sauvegarder le token et l'utilisateur
    if (data.success && data.token) {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  me: async (userId: string) => {
    const response = await axiosInstance.get('/api/mobile/auth/me', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  /**
   * Récupérer le token stocké
   */
  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  /**
   * Récupérer l'utilisateur stocké
   */
  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  /**
   * Récupérer tous les produits
   */
  getAll: async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    lastDocId?: string;
  }) => {
    const response = await axiosInstance.get('/api/mobile/products', {
      params,
    });
    return response.data;
  },

  /**
   * Récupérer un produit par ID
   */
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/api/mobile/products/${id}`);
    return response.data;
  },

  /**
   * Récupérer les produits en vedette
   */
  getFeatured: async (limit: number = 10) => {
    const response = await axiosInstance.get('/api/mobile/products/featured', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Récupérer les produits similaires
   */
  getSimilar: async (productId: string, category: string, limit: number = 6) => {
    const response = await axiosInstance.get('/api/mobile/products', {
      params: { 
        similarTo: productId,
        category,
        limit,
      },
    });
    return response.data;
  },
};

// ============================================
// WALLET API
// ============================================

export const walletAPI = {
  /**
   * Récupérer le portefeuille
   */
  getBalance: async (userId: string) => {
    const response = await axiosInstance.get('/api/mobile/wallet/balance', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Initier un dépôt flexible
   */
  flexibleDeposit: async (
    userId: string,
    paymentMethodId: string,
    clientName: string,
    amount: number
  ) => {
    const response = await axiosInstance.post('/api/mobile/wallet/deposit', {
      userId,
      paymentMethodId,
      clientName,
      amount,
    });
    return response.data;
  },

  /**
   * Initier un retrait flexible
   */
  flexibleWithdraw: async (
    userId: string,
    paymentMethodId: string,
    amount: number,
    accountName: string,
    accountNumber: string
  ) => {
    const response = await axiosInstance.post('/api/mobile/wallet/withdraw', {
      userId,
      paymentMethodId,
      amount,
      accountName,
      accountNumber,
    });
    return response.data;
  },

  /**
   * Effectuer un transfert
   */
  transfer: async (
    userId: string,
    toUserId: string,
    amount: number,
    description?: string,
    pin?: string
  ) => {
    const response = await axiosInstance.post('/api/mobile/wallet/transfer', {
      userId,
      toUserId,
      amount,
      description,
      pin,
    });
    return response.data;
  },

  /**
   * Récupérer l'historique des transactions
   */
  getTransactions: async (userId: string, type?: string, status?: string) => {
    const response = await axiosInstance.get('/api/mobile/wallet/transactions', {
      params: { userId, type, status },
    });
    return response.data;
  },

  /**
   * Définir le PIN
   */
  setPin: async (userId: string, pin: string) => {
    const response = await axiosInstance.post('/api/mobile/wallet/pin/set', {
      userId,
      pin,
    });
    return response.data;
  },

  /**
   * Vérifier le PIN
   */
  verifyPin: async (userId: string, pin: string) => {
    const response = await axiosInstance.post('/api/mobile/wallet/pin/verify', {
      userId,
      pin,
    });
    return response.data;
  },
};

// ============================================
// CHAT API
// ============================================

export const chatAPI = {
  /**
   * Récupérer les conversations
   */
  getConversations: async (userId: string) => {
    const response = await axiosInstance.get('/api/mobile/chat/conversations', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Créer ou récupérer une conversation
   */
  createConversation: async (
    userId1: string,
    userId2: string,
    user1Data: any,
    user2Data: any,
    productContext?: any
  ) => {
    const response = await axiosInstance.post('/api/mobile/chat/conversations', {
      userId1,
      userId2,
      user1Data,
      user2Data,
      productContext,
    });
    return response.data;
  },

  /**
   * Récupérer une conversation
   */
  getConversation: async (conversationId: string) => {
    const response = await axiosInstance.get(
      `/api/mobile/chat/conversations/${conversationId}`
    );
    return response.data;
  },

  /**
   * Récupérer les messages
   */
  getMessages: async (conversationId: string, limit: number = 50) => {
    const response = await axiosInstance.get('/api/mobile/chat/messages', {
      params: { conversationId, limit },
    });
    return response.data;
  },

  /**
   * Envoyer un message
   */
  sendMessage: async (messageData: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    receiverId: string;
    content: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    thumbnailUrl?: string;
    productReference?: any;
  }) => {
    const response = await axiosInstance.post(
      '/api/mobile/chat/messages',
      messageData
    );
    return response.data;
  },

  /**
   * Marquer les messages comme lus
   */
  markAsRead: async (conversationId: string, userId: string) => {
    const response = await axiosInstance.put('/api/mobile/chat/messages', {
      conversationId,
      userId,
    });
    return response.data;
  },
};

// ============================================
// PAYMENT METHODS API
// ============================================

export const paymentMethodsAPI = {
  /**
   * Récupérer les méthodes de paiement actives
   */
  getActive: async () => {
    const response = await axiosInstance.get('/api/mobile/payment-methods');
    return response.data;
  },
};

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  /**
   * Rechercher des utilisateurs
   */
  search: async (query: string, currentUserId: string) => {
    const response = await axiosInstance.get('/api/mobile/users/search', {
      params: { q: query, currentUserId },
    });
    return response.data;
  },
};

// ============================================
// VERIFICATION API
// ============================================

export const verificationAPI = {
  /**
   * Envoyer un code de vérification email
   */
  sendEmailCode: async (userId: string, email: string, displayName: string) => {
    const response = await axiosInstance.post(
      '/api/mobile/verification/email/send',
      {
        userId,
        email,
        displayName,
      }
    );
    return response.data;
  },

  /**
   * Vérifier le code email
   */
  verifyEmailCode: async (userId: string, code: string) => {
    const response = await axiosInstance.post(
      '/api/mobile/verification/email/verify',
      {
        userId,
        code,
      }
    );
    return response.data;
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  /**
   * Récupérer les notifications
   */
  getAll: async (userId: string, limit: number = 50) => {
    const response = await axiosInstance.get('/api/mobile/notifications', {
      params: { userId, action: 'list', limit },
    });
    return response.data;
  },

  /**
   * Récupérer le nombre de notifications non lues
   */
  getUnreadCount: async (userId: string) => {
    const response = await axiosInstance.get('/api/mobile/notifications', {
      params: { userId, action: 'unreadCount' },
    });
    return response.data;
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.post('/api/mobile/notifications', {
      action: 'markAsRead',
      notificationId,
    });
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: async (userId: string) => {
    const response = await axiosInstance.post('/api/mobile/notifications', {
      action: 'markAllAsRead',
      userId,
    });
    return response.data;
  },
};

// ============================================
// RESTAURANTS API
// ============================================

export const restaurantsAPI = {
  /**
   * Récupérer les restaurants
   */
  getAll: async (params?: {
    city?: string;
    priceRange?: string;
    features?: string[];
    lat?: number;
    lng?: number;
    maxDistance?: number;
  }) => {
    const queryParams: any = {};
    if (params?.city) queryParams.city = params.city;
    if (params?.priceRange) queryParams.priceRange = params.priceRange;
    if (params?.features) queryParams.features = params.features.join(',');
    if (params?.lat) queryParams.lat = params.lat;
    if (params?.lng) queryParams.lng = params.lng;
    if (params?.maxDistance) queryParams.maxDistance = params.maxDistance;

    const response = await axiosInstance.get('/api/mobile/restaurants', {
      params: queryParams,
    });
    return response.data;
  },
};

// ============================================
// HOTELS API
// ============================================

export const hotelsAPI = {
  /**
   * Récupérer les hôtels
   */
  getAll: async (params?: {
    city?: string;
    features?: string[];
    lat?: number;
    lng?: number;
    maxDistance?: number;
  }) => {
    const queryParams: any = {};
    if (params?.city) queryParams.city = params.city;
    if (params?.features) queryParams.features = params.features.join(',');
    if (params?.lat) queryParams.lat = params.lat;
    if (params?.lng) queryParams.lng = params.lng;
    if (params?.maxDistance) queryParams.maxDistance = params.maxDistance;

    const response = await axiosInstance.get('/api/mobile/hotels', {
      params: queryParams,
    });
    return response.data;
  },
};

// ============================================
// DATING API
// ============================================

export const datingAPI = {
  /**
   * Récupérer les profils de rencontre
   */
  getAll: async () => {
    const response = await axiosInstance.get('/api/mobile/dating');
    return response.data;
  },
};

// ============================================
// EXPORT
// ============================================

export default {
  // Méthodes génériques
  get: axiosInstance.get.bind(axiosInstance),
  post: axiosInstance.post.bind(axiosInstance),
  put: axiosInstance.put.bind(axiosInstance),
  delete: axiosInstance.delete.bind(axiosInstance),
  
  // APIs spécifiques
  auth: authAPI,
  products: productsAPI,
  wallet: walletAPI,
  chat: chatAPI,
  paymentMethods: paymentMethodsAPI,
  users: usersAPI,
  verification: verificationAPI,
  notifications: notificationsAPI,
  restaurants: restaurantsAPI,
  hotels: hotelsAPI,
  dating: datingAPI,
};
