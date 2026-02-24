import { create } from 'zustand';
import { CartItem, Product } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartState {
  items: CartItem[];
  loading: boolean;

  // Actions
  addToCart: (product: Product, quantity: number) => void;
  addItem: (item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    fournisseurId?: string;
    moq?: number;
  }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  addToCart: (product: Product, quantity: number) => {
    const items = get().items;
    const existingItem = items.find(item => item.productId === product.id);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        price: product.prices[0]?.price || 0,
      };
      set({
        items: [...items, newItem],
      });
    }

    get().saveCart();
  },

  addItem: (newItemInfo) => {
    const items = get().items;
    const existingItem = items.find(item => item.productId === newItemInfo.productId);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.productId === newItemInfo.productId
            ? { ...item, quantity: item.quantity + newItemInfo.quantity }
            : item
        ),
      });
    } else {
      const newItem: CartItem = {
        productId: newItemInfo.productId,
        name: newItemInfo.name,
        price: newItemInfo.price,
        quantity: newItemInfo.quantity,
        image: newItemInfo.image,
        fournisseurId: newItemInfo.fournisseurId,
        moq: newItemInfo.moq,
      } as any; // Cast as any if Types don't match perfectly yet
      set({
        items: [...items, newItem],
      });
    }
    get().saveCart();
  },

  removeFromCart: (productId: string) => {
    set({
      items: get().items.filter(item => item.productId !== productId),
    });
    get().saveCart();
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set({
      items: get().items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ),
    });
    get().saveCart();
  },

  clearCart: () => {
    set({ items: [] });
    get().saveCart();
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemCount: () => {
    // Retourner le nombre de produits différents, pas la quantité totale
    return get().items.length;
  },

  loadCart: async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        set({ items: JSON.parse(cartData) });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  },

  saveCart: async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(get().items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },
}));
