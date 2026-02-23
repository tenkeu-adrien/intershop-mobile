// Chat Conversation Screen - Adapté depuis alibaba-clone pour React Native
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useChatStore } from '../../src/store/chatStore';
import { useAuthStore } from '../../src/store/authStore';
import { Conversation } from '../../src/types/chat';
import api from '../../src/services/api';

export default function ChatConversationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    messages,
    sending,
    subscribeMessages,
    unsubscribeMessages,
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    sendFileMessage,
    markAsRead,
  } = useChatStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadConversation();
  }, [params.id, user]);

  useEffect(() => {
    if (params.id && user) {
      subscribeMessages(params.id as string);
      markAsRead(params.id as string, user.id);
    }

    return () => {
      unsubscribeMessages();
    };
  }, [params.id, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadConversation = async () => {
    if (!params.id || !user) return;

    setLoading(true);
    try {
      // Utiliser l'API au lieu de Firebase directement
      const response = await api.chat.getConversation(params.id as string);
      
      if (response.success && response.conversation) {
        setConversation(response.conversation);
      } else {
        Alert.alert('Erreur', 'Conversation non trouvée');
        router.back();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Erreur', 'Impossible de charger la conversation');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !conversation || !messageText.trim()) return;

    const otherUserId = conversation.participants.find(id => id !== user.id);
    if (!otherUserId) return;

    try {
      await sendTextMessage(
        conversation.id,
        user.id,
        user.displayName,
        user.photoURL,
        otherUserId,
        messageText.trim()
      );
      setMessageText('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder aux photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && user && conversation) {
      const otherUserId = conversation.participants.find(id => id !== user.id);
      if (!otherUserId) return;

      try {
        await sendImageMessage(
          conversation.id,
          user.id,
          user.displayName,
          user.photoURL,
          otherUserId,
          result.assets[0].uri
        );
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'envoyer l\'image');
      }
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0] || !user || !conversation) return;

      const otherUserId = conversation.participants.find(id => id !== user.id);
      if (!otherUserId) return;

      const file = result.assets[0];
      
      // Check file size (max 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('Fichier trop volumineux', 'La taille maximale est de 10MB');
        return;
      }

      await sendFileMessage(
        conversation.id,
        user.id,
        user.displayName,
        user.photoURL,
        otherUserId,
        file.uri,
        file.name
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le fichier');
    }
  };

  const getContextInfo = () => {
    if (!conversation?.context) return null;

    const { context } = conversation;
    let link = '';
    let icon = '';
    let label = '';
    let name = '';

    switch (context.type) {
      case 'product_inquiry':
        if (context.productId) {
          link = `/products/${context.productId}`;
          icon = '📦';
          label = 'Voir le produit';
          name = context.metadata?.productName || 'Produit';
        }
        break;
      
      case 'dating_inquiry':
        if (context.datingProfileId) {
          link = `/dating/${context.datingProfileId}`;
          icon = '❤️';
          label = 'Voir le profil';
          name = context.metadata?.profileName || 'Profil';
        }
        break;
      
      case 'hotel_inquiry':
        if (context.hotelId) {
          link = `/hotels/${context.hotelId}`;
          icon = '🏨';
          label = 'Voir l\'hôtel';
          name = context.metadata?.hotelName || 'Hôtel';
        }
        break;
      
      case 'restaurant_inquiry':
        if (context.restaurantId) {
          link = `/restaurants/${context.restaurantId}`;
          icon = '🍽️';
          label = 'Voir le restaurant';
          name = context.metadata?.restaurantName || 'Restaurant';
        }
        break;
      
      case 'order':
        if (context.orderId) {
          link = `/orders/${context.orderId}`;
          icon = '🛒';
          label = 'Voir la commande';
          name = `Commande #${context.metadata?.orderNumber || context.orderId}`;
        }
        break;
    }

    return link ? { link, icon, label, name } : null;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwn = item.senderId === user?.id;

    return (
      <View style={[styles.messageContainer, isOwn ? styles.messageContainerOwn : styles.messageContainerOther]}>
        {/* Avatar pour les messages des autres */}
        {!isOwn && (
          <View style={styles.messageAvatar}>
            {conversation?.participantsData[item.senderId]?.photo ? (
              <Image
                source={{ uri: conversation.participantsData[item.senderId].photo }}
                style={styles.avatarSmall}
              />
            ) : (
              <View style={[styles.avatarSmall, styles.avatarPlaceholder]}>
                <Text style={styles.avatarSmallText}>
                  {item.senderName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Message Content */}
        <View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
          {/* Product Reference */}
          {item.productReference && (
            <TouchableOpacity
              style={[styles.productReference, isOwn ? styles.productReferenceOwn : styles.productReferenceOther]}
              onPress={() => router.push(`/products/${item.productReference.productId}`)}
            >
              <Image
                source={{ uri: item.productReference.productImage }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, isOwn && styles.productNameOwn]} numberOfLines={2}>
                  {item.type === 'quote_request' && '💰 '}
                  {item.productReference.productName}
                </Text>
                {item.productReference.productPrice && (
                  <Text style={[styles.productPrice, isOwn && styles.productPriceOwn]}>
                    {item.productReference.productPrice} {item.productReference.productCurrency}
                  </Text>
                )}
                <Text style={[styles.productLink, isOwn && styles.productLinkOwn]}>
                  {item.type === 'quote_request' ? 'Demande de devis' : 'Voir le produit'} →
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Text Message */}
          {item.type === 'text' && (
            <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
              {item.content}
            </Text>
          )}

          {/* Image Message */}
          {item.type === 'image' && (
            <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)}>
              <Image
                source={{ uri: item.fileUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              <Text style={[styles.imageCaption, isOwn && styles.imageCaptionOwn]}>
                Appuyez pour agrandir
              </Text>
            </TouchableOpacity>
          )}

          {/* Video Message */}
          {item.type === 'video' && (
            <TouchableOpacity
              style={styles.videoContainer}
              onPress={() => Linking.openURL(item.fileUrl)}
            >
              <Ionicons name="play-circle" size={48} color={isOwn ? 'white' : '#10B981'} />
              <Text style={[styles.videoText, isOwn && styles.videoTextOwn]}>
                Appuyez pour lire la vidéo
              </Text>
            </TouchableOpacity>
          )}

          {/* File Message */}
          {item.type === 'file' && (
            <TouchableOpacity
              style={styles.fileContainer}
              onPress={() => Linking.openURL(item.fileUrl)}
            >
              <Ionicons name="document" size={24} color={isOwn ? 'white' : '#10B981'} />
              <Text style={[styles.fileName, isOwn && styles.fileNameOwn]} numberOfLines={1}>
                {item.fileName}
              </Text>
              <Ionicons name="download" size={20} color={isOwn ? 'white' : '#10B981'} />
            </TouchableOpacity>
          )}

          {/* Timestamp */}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </Text>
            {isOwn && item.isRead && (
              <Text style={styles.readIndicator}>✓✓</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!conversation || !user) return null;

  const otherUserId = conversation.participants.find(id => id !== user.id);
  const otherUser = otherUserId ? conversation.participantsData[otherUserId] : null;
  const contextInfo = getContextInfo();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          {otherUser?.photo ? (
            <Image source={{ uri: otherUser.photo }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>
                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{otherUser?.name || 'Utilisateur'}</Text>
            <Text style={styles.headerStatus}>En ligne</Text>
          </View>
        </View>
      </View>

      {/* Context Link */}
      {contextInfo && (
        <TouchableOpacity
          style={styles.contextBanner}
          onPress={() => router.push(contextInfo.link as any)}
        >
          <View style={styles.contextIcon}>
            <Text style={styles.contextIconText}>{contextInfo.icon}</Text>
          </View>
          <View style={styles.contextInfo}>
            <Text style={styles.contextName} numberOfLines={1}>
              {contextInfo.name}
            </Text>
            <Text style={styles.contextLabel}>{contextInfo.label} →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>Aucun message pour le moment</Text>
            <Text style={styles.emptyMessagesSubtext}>Envoyez un message pour commencer</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handlePickImage} style={styles.attachButton}>
          <Ionicons name="image" size={24} color="#10B981" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePickDocument} style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#10B981" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Écrivez votre message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={sending || !messageText.trim()}
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', 
    marginTop:25
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerStatus: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  contextIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contextIconText: {
    fontSize: 24,
  },
  contextInfo: {
    flex: 1,
  },
  contextName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contextLabel: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  emptyMessages: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageContainerOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageContainerOther: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarSmallText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  messageBubbleOwn: {
    backgroundColor: '#10B981',
  },
  messageBubbleOther: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productReference: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  productReferenceOwn: {
    backgroundColor: '#059669',
  },
  productReferenceOther: {
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productNameOwn: {
    color: 'white',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  productPriceOwn: {
    color: '#D1FAE5',
  },
  productLink: {
    fontSize: 11,
    color: '#6B7280',
  },
  productLinkOwn: {
    color: '#D1FAE5',
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: 'white',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  imageCaptionOwn: {
    color: '#D1FAE5',
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  videoTextOwn: {
    color: '#D1FAE5',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
  fileNameOwn: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  messageTimeOwn: {
    color: '#D1FAE5',
  },
  readIndicator: {
    fontSize: 11,
    color: '#D1FAE5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
