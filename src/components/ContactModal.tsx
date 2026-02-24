import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'product' | 'hotel' | 'restaurant' | 'dating';
  ownerId: string;
  ownerName: string;
  ownerPhoto?: string;
  itemId: string;
  itemName: string;
  itemImage?: string;
}

export default function ContactModal({
  visible,
  onClose,
  type,
  ownerId,
  ownerName,
  ownerPhoto,
  itemId,
  itemName,
  itemImage,
}: ContactModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getDefaultMessage = () => {
    switch (type) {
      case 'product':
        return `Bonjour, je peux en savoir plus sur ce produit : ${itemName} ?`;
      case 'dating':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur ce profil.`;
      case 'hotel':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur votre hôtel : ${itemName}.`;
      case 'restaurant':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur votre restaurant : ${itemName}.`;
      default:
        return 'Bonjour, je souhaiterais obtenir plus d\'informations.';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'product':
        return 'Produit';
      case 'dating':
        return 'Profil';
      case 'hotel':
        return 'Hôtel';
      case 'restaurant':
        return 'Restaurant';
      default:
        return 'Item';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'product':
        return 'Discuter avec le vendeur';
      case 'dating':
        return 'Demander le contact';
      case 'hotel':
        return 'Contacter l\'hôtel';
      case 'restaurant':
        return 'Contacter le restaurant';
      default:
        return 'Contacter';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'product':
        return '#3b82f6';
      case 'dating':
        return '#ec4899';
      case 'hotel':
        return '#8b5cf6';
      case 'restaurant':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    if (visible) {
      setMessage(getDefaultMessage());
    }
  }, [visible, type, itemName]);

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Veuillez saisir un message');
      return;
    }

    if (!user) {
      alert('Vous devez être connecté');
      onClose();
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const clientData = {
        name: user.displayName || 'Utilisateur',
        photo: user.photoURL,
        role: user.role,
      };

      const ownerData = {
        name: ownerName,
        photo: ownerPhoto,
        role: 'fournisseur',
      };

      // Créer le contexte
      const context = {
        type: type === 'dating' ? 'dating_inquiry' : 
              type === 'hotel' ? 'hotel_inquiry' :
              type === 'restaurant' ? 'restaurant_inquiry' : 'product_inquiry',
        itemId: itemId,
        itemName: itemName,
      };

      const productContext = {
        productId: itemId,
        productName: itemName,
        productImage: itemImage,
      };

      // Créer ou récupérer la conversation via API
      const conversationResponse = await api.post('/api/mobile/chat/conversations', {
        userId1: user.id,
        userId2: ownerId,
        user1Data: clientData,
        user2Data: ownerData,
        context: context,
        productContext: productContext,
      });

      if (!conversationResponse.data?.success) {
        throw new Error('Failed to create conversation');
      }

      const conversationId = conversationResponse.data.conversationId;

      // Envoyer le message initial via API
      await api.post('/api/mobile/chat/messages', {
        conversationId: conversationId,
        senderId: user.id,
        senderName: user.displayName || 'Utilisateur',
        senderPhoto: user.photoURL,
        receiverId: ownerId,
        content: message.trim(),
        type: 'text',
      });

      onClose();
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const color = getColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: color }]}>
            <View style={styles.headerContent}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
              <View style={styles.headerText}>
                <Text style={styles.modalTitle}>Envoyer un message</Text>
                <Text style={styles.modalSubtitle}>à {ownerName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody}>
            {/* Item Preview */}
            <View style={styles.itemPreview}>
              {itemImage && (
                <Image source={{ uri: itemImage }} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemType}>{getTypeLabel()}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {itemName}
                </Text>
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Votre message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                style={styles.textInput}
                placeholder="Saisissez votre message..."
                placeholderTextColor="#9ca3af"
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length} caractères</Text>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                💡 Vous pouvez modifier ce message avant de l'envoyer. Soyez clair et précis dans votre demande.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: color }]}
              onPress={handleSend}
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Envoyer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  itemPreview: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    backgroundColor: '#fff',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
