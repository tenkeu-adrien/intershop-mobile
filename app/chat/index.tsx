// Chat Init Screen - Crée ou récupère une conversation avant de rediriger
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../src/store/authStore';
import { useProductsStore } from '../../src/store/productsStore';
import { getOrCreateConversation } from '../../src/services/chatService';
import { getDbInstance } from '../../src/config/firebase';
import { ConversationContext } from '../../src/types/chat';

export default function ChatInitScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProductById } = useProductsStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (params.productId && params.fournisseurId) {
      createProductConversation();
    } else {
      // Si pas de paramètres, rediriger vers la liste des conversations
      router.replace('/(tabs)/chat');
    }
  }, [user, params]);

  const loadFournisseurData = async (fournisseurId: string) => {
    try {
      const db = getDbInstance();
      const docRef = doc(db, 'users', fournisseurId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          name: data.displayName || data.shopName || 'Vendeur',
          photo: data.photoURL || data.shopLogo,
          role: data.role || 'fournisseur',
        };
      }
    } catch (error) {
      console.error('Error loading fournisseur:', error);
    }
    
    return {
      name: 'Vendeur',
      role: 'fournisseur',
    };
  };

  const createProductConversation = async () => {
    if (!user || !params.productId || !params.fournisseurId) return;

    try {
      // Charger le produit
      const product = await fetchProductById(params.productId as string);
      if (!product) {
        console.error('Product not found');
        router.back();
        return;
      }

      // Charger les infos du fournisseur
      const fournisseurData = await loadFournisseurData(params.fournisseurId as string);

      // Créer le contexte
      const context: ConversationContext = {
        type: 'product_inquiry',
        productId: product.id,
        metadata: {
          productName: product.name,
        },
      };

      // Créer ou récupérer la conversation
      const conversationId = await getOrCreateConversation(
        user.id,
        params.fournisseurId as string,
        {
          name: user.displayName,
          photo: user.photoURL,
          role: user.role,
        },
        fournisseurData,
        context,
        {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          productPrice: product.prices[0].price,
          productCurrency: 'FCFA',
        }
      );

      // Rediriger vers la conversation
      router.replace(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>Ouverture de la conversation...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
