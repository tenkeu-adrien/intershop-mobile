// Chat Store - Adapté depuis alibaba-clone pour React Native
import { create } from 'zustand';
import { Conversation, ChatMessage, MessageType, ProductReference } from '../types/chat';
import api from '../services/api';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  totalUnreadCount: number;
  loading: boolean;
  sending: boolean;
  
  // Subscriptions
  conversationsUnsubscribe: (() => void) | null;
  messagesUnsubscribe: (() => void) | null;
  unreadCountUnsubscribe: (() => void) | null;
  
  // Actions
  loadConversations: (userId: string) => Promise<void>;
  subscribeConversations: (userId: string) => void;
  unsubscribeConversations: () => void;
  
  setCurrentConversation: (conversation: Conversation | null) => void;
  subscribeMessages: (conversationId: string) => void;
  unsubscribeMessages: () => void;
  
  sendTextMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    content: string,
    type?: MessageType,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    thumbnailUrl?: string,
    productReference?: ProductReference
  ) => Promise<void>;
  
  sendImageMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string
  ) => Promise<void>;
  
  sendVideoMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string
  ) => Promise<void>;
  
  sendFileMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string,
    fileName: string
  ) => Promise<void>;
  
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  
  subscribeTotalUnreadCount: (userId: string) => void;
  unsubscribeTotalUnreadCount: () => void;
  
  cleanup: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  totalUnreadCount: 0,
  loading: false,
  sending: false,
  conversationsUnsubscribe: null,
  messagesUnsubscribe: null,
  unreadCountUnsubscribe: null,
  
  loadConversations: async (userId: string) => {
    set({ loading: true });
    try {
      const response = await api.chat.getConversations(userId);
      if (response.success) {
        set({ conversations: response.conversations, loading: false });
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ loading: false });
    }
  },
  
  subscribeConversations: (userId: string) => {
    // Nettoyer l'ancien intervalle s'il existe
    const { conversationsUnsubscribe } = get();
    if (conversationsUnsubscribe) {
      conversationsUnsubscribe();
    }
    
    // Charger immédiatement
    get().loadConversations(userId);
    
    // Polling toutes les 30 secondes (au lieu de 5)
    const interval = setInterval(async () => {
      try {
        const response = await api.chat.getConversations(userId);
        if (response.success) {
          set({ conversations: response.conversations });
        }
      } catch (error) {
        console.error('Error polling conversations:', error);
      }
    }, 30000); // 30 secondes
    
    set({ conversationsUnsubscribe: () => clearInterval(interval) });
  },
  
  unsubscribeConversations: () => {
    const { conversationsUnsubscribe } = get();
    if (conversationsUnsubscribe) {
      conversationsUnsubscribe();
      set({ conversationsUnsubscribe: null });
    }
  },
  
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [] });
  },
  
  subscribeMessages: (conversationId: string) => {
    // Nettoyer l'ancien intervalle s'il existe
    const { messagesUnsubscribe } = get();
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
    }
    
    // Charger les messages initialement
    api.chat.getMessages(conversationId).then(response => {
      if (response.success) {
        set({ messages: response.messages });
      }
    });
    
    // Polling pour les nouveaux messages toutes les 10 secondes
    const interval = setInterval(async () => {
      try {
        const response = await api.chat.getMessages(conversationId);
        if (response.success) {
          set({ messages: response.messages });
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 10000); // 10 secondes
    
    set({ messagesUnsubscribe: () => clearInterval(interval) });
  },
  
  unsubscribeMessages: () => {
    const { messagesUnsubscribe } = get();
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
      set({ messagesUnsubscribe: null });
    }
  },
  
  sendTextMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    content: string,
    type: MessageType = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    thumbnailUrl?: string,
    productReference?: ProductReference
  ) => {
    set({ sending: true });
    try {
      const response = await api.chat.sendMessage({
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        thumbnailUrl,
        productReference
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de l\'envoi du message');
      }
      
      set({ sending: false });
    } catch (error) {
      console.error('Error sending message:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendImageMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string
  ) => {
    set({ sending: true });
    try {
      // TODO: Implémenter l'upload d'image via API
      // Pour l'instant, on envoie juste un message texte
      await get().sendTextMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        '📷 Image',
        'image'
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending image:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendVideoMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string
  ) => {
    set({ sending: true });
    try {
      // TODO: Implémenter l'upload de vidéo via API
      await get().sendTextMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        '🎥 Vidéo',
        'video'
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending video:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendFileMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    fileUri: string,
    fileName: string
  ) => {
    set({ sending: true });
    try {
      // TODO: Implémenter l'upload de fichier via API
      await get().sendTextMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        `📎 ${fileName}`,
        'file'
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending file:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  markAsRead: async (conversationId: string, userId: string) => {
    try {
      const response = await api.chat.markAsRead(conversationId, userId);
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors du marquage des messages');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
  
  subscribeTotalUnreadCount: (userId: string) => {
    // Nettoyer l'ancien intervalle s'il existe
    const { unreadCountUnsubscribe } = get();
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
    }
    
    // Polling pour le compteur de messages non lus toutes les 30 secondes
    const interval = setInterval(async () => {
      try {
        const response = await api.chat.getConversations(userId);
        if (response.success) {
          const total = response.conversations.reduce((sum: number, conv: Conversation) => {
            return sum + (conv.unreadCount[userId] || 0);
          }, 0);
          set({ totalUnreadCount: total });
        }
      } catch (error) {
        console.error('Error polling unread count:', error);
      }
    }, 30000); // 30 secondes
    
    set({ unreadCountUnsubscribe: () => clearInterval(interval) });
  },
  
  unsubscribeTotalUnreadCount: () => {
    const { unreadCountUnsubscribe } = get();
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
      set({ unreadCountUnsubscribe: null });
    }
  },
  
  cleanup: () => {
    get().unsubscribeConversations();
    get().unsubscribeMessages();
    get().unsubscribeTotalUnreadCount();
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      totalUnreadCount: 0,
    });
  },
}));
