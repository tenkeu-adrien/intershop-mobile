import { create } from 'zustand';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: (uid: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  initAuthListener: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        set({ 
          user: response.user as User,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Erreur de connexion');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string, role: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(email, password, displayName, role);
      
      if (response.success) {
        set({ 
          user: response.user as User,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Erreur d\'inscription');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await authAPI.logout();
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUser: async (uid: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.me(uid);
      
      if (response.success) {
        set({ 
          user: response.user as User,
          loading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  refreshUser: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    try {
      const response = await authAPI.me(currentUser.id);
      
      if (response.success) {
        set({ user: response.user as User });
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
    }
  },

  setUser: (user: User | null) => set({ user }),
  clearError: () => set({ error: null }),
  
  // Initialiser avec l'utilisateur stocké
  initAuthListener: async () => {
    try {
      const storedUser = await authAPI.getStoredUser();
      if (storedUser) {
        set({ user: storedUser });
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    }
  },
}));
