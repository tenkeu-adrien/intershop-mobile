// Secure Storage Wrapper pour Firebase Auth
// Utilise expo-secure-store pour un stockage sécurisé des tokens d'authentification

import * as SecureStore from 'expo-secure-store';

/**
 * Wrapper qui implémente l'interface AsyncStorage pour Firebase Auth
 * mais utilise expo-secure-store pour un stockage sécurisé
 */
export const SecureStorageWrapper = {
  /**
   * Récupère une valeur du stockage sécurisé
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  /**
   * Stocke une valeur dans le stockage sécurisé
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  },

  /**
   * Supprime une valeur du stockage sécurisé
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      throw error;
    }
  },
};

export default SecureStorageWrapper;
