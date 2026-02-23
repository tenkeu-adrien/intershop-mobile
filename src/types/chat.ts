// Types pour le système de chat - Copié depuis alibaba-clone

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'product' | 'quote_request';

// Types de conversations
export type ConversationType = 
  | 'order'           // Discussion sur une commande
  | 'product_inquiry' // Demande d'information sur un produit
  | 'dating_inquiry'  // Demande de contact pour rencontre
  | 'hotel_inquiry'   // Demande d'information sur un hôtel
  | 'restaurant_inquiry' // Demande d'information sur un restaurant
  | 'general'         // Discussion générale
  | 'support';        // Support client

// Contexte de la conversation
export interface ConversationContext {
  type: ConversationType;
  orderId?: string;        // Si type = 'order'
  productId?: string;      // Si type = 'product_inquiry'
  datingProfileId?: string; // Si type = 'dating_inquiry'
  hotelId?: string;        // Si type = 'hotel_inquiry'
  restaurantId?: string;   // Si type = 'restaurant_inquiry'
  metadata?: {
    orderNumber?: string;
    productName?: string;
    profileName?: string;
    hotelName?: string;
    restaurantName?: string;
    [key: string]: any;
  };
}

export interface ProductReference {
  productId: string;
  productName: string;
  productImage: string;
  productPrice?: number;
  productCurrency?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string; // Pour les vidéos
  productReference?: ProductReference; // Référence au produit
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantsData: {
    [userId: string]: {
      name: string;
      photo?: string;
      role: string;
    };
  };
  context?: ConversationContext; // Type et contexte de la conversation
  productContext?: ProductReference; // Produit lié à la conversation (legacy)
  tags?: string[]; // Tags pour filtrage
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'archived' | 'closed';
  lastMessage?: {
    content: string;
    type: MessageType;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatNotification {
  id: string;
  userId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  type: MessageType;
  isRead: boolean;
  createdAt: Date;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

// Helper pour obtenir le label d'un type de conversation
export function getConversationTypeLabel(type: ConversationType): string {
  const labels: Record<ConversationType, string> = {
    order: 'Commande',
    product_inquiry: 'Produit',
    dating_inquiry: 'Rencontre',
    hotel_inquiry: 'Hôtel',
    restaurant_inquiry: 'Restaurant',
    general: 'Général',
    support: 'Support',
  };
  return labels[type] || 'Général';
}

// Helper pour obtenir l'icône d'un type de conversation
export function getConversationTypeIcon(type: ConversationType): string {
  const icons: Record<ConversationType, string> = {
    order: '🛒',
    product_inquiry: '📦',
    dating_inquiry: '❤️',
    hotel_inquiry: '🏨',
    restaurant_inquiry: '🍽️',
    general: '💬',
    support: '🆘',
  };
  return icons[type] || '💬';
}

// Helper pour obtenir la couleur d'un type de conversation
export function getConversationTypeColor(type: ConversationType): string {
  const colors: Record<ConversationType, string> = {
    order: '#10B981',
    product_inquiry: '#3B82F6',
    dating_inquiry: '#EC4899',
    hotel_inquiry: '#8B5CF6',
    restaurant_inquiry: '#F59E0B',
    general: '#6B7280',
    support: '#EF4444',
  };
  return colors[type] || '#6B7280';
}
