// Product Chat Actions - Adapté depuis alibaba-clone pour React Native
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getOrCreateConversation } from '../services/chatService';
import { ProductReference, ConversationContext } from '../types/chat';

interface ProductChatActionsProps {
  product: {
    id: string;
    name: string;
    images: string[];
    fournisseurId: string;
    prices?: Array<{ price: number; currency: string }>;
  };
  fournisseur: {
    name: string;
    photo?: string;
  };
}

export function ProductChatActions({ product, fournisseur }: ProductChatActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sendTextMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const productReference: ProductReference = {
    productId: product.id,
    productName: product.name,
    productImage: product.images[0],
    productPrice: product.prices?.[0]?.price,
    productCurrency: product.prices?.[0]?.currency || 'FCFA',
  };

  const handleStartChat = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour envoyer un message', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (user.id === product.fournisseurId) {
      Alert.alert('Erreur', 'Vous ne pouvez pas vous envoyer un message à vous-même');
      return;
    }

    setLoading(true);
    try {
      const context: ConversationContext = {
        type: 'product_inquiry',
        productId: product.id,
        metadata: {
          productName: product.name,
        },
      };

      const conversationId = await getOrCreateConversation(
        user.id,
        product.fournisseurId,
        {
          name: user.displayName,
          photo: user.photoURL,
          role: user.role,
        },
        {
          name: fournisseur.name,
          photo: fournisseur.photo,
          role: 'fournisseur',
        },
        context,
        productReference
      );

      // Envoyer un message automatique avec le produit
      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL,
        product.fournisseurId,
        `Bonjour, je suis intéressé par ce produit.`,
        'product',
        undefined,
        undefined,
        undefined,
        undefined,
        productReference
      );

      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'ouverture du chat');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour demander un devis', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (user.id === product.fournisseurId) {
      Alert.alert('Erreur', 'Vous ne pouvez pas demander un devis pour votre propre produit');
      return;
    }

    setLoadingQuote(true);
    try {
      const context: ConversationContext = {
        type: 'product_inquiry',
        productId: product.id,
        metadata: {
          productName: product.name,
        },
      };

      const conversationId = await getOrCreateConversation(
        user.id,
        product.fournisseurId,
        {
          name: user.displayName,
          photo: user.photoURL,
          role: user.role,
        },
        {
          name: fournisseur.name,
          photo: fournisseur.photo,
          role: 'fournisseur',
        },
        context,
        productReference
      );

      // Envoyer une demande de devis
      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL,
        product.fournisseurId,
        `Je souhaiterais recevoir un devis détaillé pour ce produit. Merci de me communiquer vos meilleures conditions.`,
        'quote_request',
        undefined,
        undefined,
        undefined,
        undefined,
        productReference
      );

      Alert.alert('Succès', 'Demande de devis envoyée avec succès');
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error requesting quote:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoadingQuote(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton Discuter */}
      <TouchableOpacity
        style={[styles.button, styles.chatButton]}
        onPress={handleStartChat}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="chatbubbles" size={20} color="white" />
            <Text style={styles.buttonText}>Discuter avec le vendeur</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Bouton Demander un Devis */}
      <TouchableOpacity
        style={[styles.button, styles.quoteButton]}
        onPress={handleRequestQuote}
        disabled={loadingQuote}
      >
        {loadingQuote ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.buttonText}>Demander un devis</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#10B981',
  },
  quoteButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
