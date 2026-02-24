// Service de chat - Adapté depuis alibaba-clone pour React Native
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDbInstance, getStorageInstance } from '../config/firebase';
import { ChatMessage, Conversation, MessageType, ProductReference, ConversationContext } from '../types/chat';

// Create or Get Conversation
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  user1Data: { name: string; photo?: string; role: string },
  user2Data: { name: string; photo?: string; role: string },
  context?: ConversationContext,
  productContext?: ProductReference
): Promise<string> {
  const db = getDbInstance();
  
  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const snapshot = await getDocs(q);
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.participants.includes(userId2)) {
      // Update context if provided
      if (context || productContext) {
        const updateData: any = { updatedAt: new Date() };
        if (context) updateData.context = context;
        if (productContext) updateData.productContext = productContext;
        await updateDoc(docSnap.ref, updateData);
      }
      return docSnap.id;
    }
  }
  
  // Nettoyer les données utilisateur pour éviter les undefined
  const cleanUser1Data: any = {
    name: user1Data.name,
    role: user1Data.role,
  };
  if (user1Data.photo) cleanUser1Data.photo = user1Data.photo;
  
  const cleanUser2Data: any = {
    name: user2Data.name,
    role: user2Data.role,
  };
  if (user2Data.photo) cleanUser2Data.photo = user2Data.photo;
  
  // Create new conversation
  const conversationData: any = {
    participants: [userId1, userId2],
    participantsData: {
      [userId1]: cleanUser1Data,
      [userId2]: cleanUser2Data,
    },
    unreadCount: {
      [userId1]: 0,
      [userId2]: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Ajouter context et productContext seulement s'ils existent
  if (context) conversationData.context = context;
  if (productContext) conversationData.productContext = productContext;
  
  const docRef = await addDoc(conversationsRef, conversationData);
  return docRef.id;
}

// Get User Conversations
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const db = getDbInstance();
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      lastMessage: data.lastMessage ? {
        ...data.lastMessage,
        createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
      } : undefined,
    };
  }) as Conversation[];
}

// Listen to User Conversations (Real-time)
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
  const db = getDbInstance();
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
        } : undefined,
      };
    }) as Conversation[];
    callback(conversations);
  });
}

// Send Message
export async function sendMessage(
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
): Promise<string> {
  const db = getDbInstance();
  const messagesRef = collection(db, 'messages');
  
  // Construire messageData en omettant les champs undefined
  const messageData: any = {
    conversationId,
    senderId,
    senderName,
    receiverId,
    content,
    type,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Ajouter les champs optionnels seulement s'ils existent
  if (senderPhoto) messageData.senderPhoto = senderPhoto;
  if (fileUrl) messageData.fileUrl = fileUrl;
  if (fileName) messageData.fileName = fileName;
  if (fileSize) messageData.fileSize = fileSize;
  if (thumbnailUrl) messageData.thumbnailUrl = thumbnailUrl;
  if (productReference) messageData.productReference = productReference;
  
  const docRef = await addDoc(messagesRef, messageData);
  
  // Update conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: {
      content: type === 'text' ? content : 
               type === 'product' ? `📦 ${productReference?.productName}` :
               type === 'quote_request' ? `💰 Demande de devis pour ${productReference?.productName}` :
               type === 'image' ? '📷 Image' : 
               type === 'video' ? '🎥 Vidéo' : '📎 Fichier',
      type,
      senderId,
      createdAt: new Date(),
    },
    updatedAt: new Date(),
    [`unreadCount.${receiverId}`]: increment(1),
  });
  
  return docRef.id;
}

// Upload Image (React Native compatible)
export async function uploadChatImage(
  fileUri: string,
  conversationId: string,
  userId: string
): Promise<string> {
  const storage = getStorageInstance();
  const timestamp = Date.now();
  const fileName = `${timestamp}_image.jpg`;
  const storageRef = ref(storage, `chat/${conversationId}/images/${fileName}`);
  
  // Fetch the file from URI
  const response = await fetch(fileUri);
  const blob = await response.blob();
  
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Upload Video (React Native compatible)
export async function uploadChatVideo(
  fileUri: string,
  conversationId: string,
  userId: string
): Promise<string> {
  const storage = getStorageInstance();
  const timestamp = Date.now();
  const fileName = `${timestamp}_video.mp4`;
  const storageRef = ref(storage, `chat/${conversationId}/videos/${fileName}`);
  
  const response = await fetch(fileUri);
  const blob = await response.blob();
  
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Upload File (React Native compatible)
export async function uploadChatFile(
  fileUri: string,
  fileName: string,
  conversationId: string,
  userId: string
): Promise<string> {
  const storage = getStorageInstance();
  const timestamp = Date.now();
  const finalFileName = `${timestamp}_${fileName}`;
  const storageRef = ref(storage, `chat/${conversationId}/files/${finalFileName}`);
  
  const response = await fetch(fileUri);
  const blob = await response.blob();
  
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Get Conversation Messages
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  const db = getDbInstance();
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  }) as ChatMessage[];
  
  return messages.reverse(); // Reverse to show oldest first
}

// Listen to Conversation Messages (Real-time)
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const db = getDbInstance();
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    }) as ChatMessage[];
    callback(messages);
  });
}

// Mark Messages as Read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const db = getDbInstance();
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    where('receiverId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { isRead: true });
  });
  
  await batch.commit();
  
  // Reset unread count in conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// Get Conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const db = getDbInstance();
  const docRef = doc(db, 'conversations', conversationId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    lastMessage: data.lastMessage ? {
      ...data.lastMessage,
      createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
    } : undefined,
  } as Conversation;
}

// Get Total Unread Count for User
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const conversations = await getUserConversations(userId);
  return conversations.reduce((total, conv) => {
    return total + (conv.unreadCount[userId] || 0);
  }, 0);
}

// Listen to Total Unread Count (Real-time)
export function subscribeToTotalUnreadCount(
  userId: string,
  callback: (count: number) => void
) {
  return subscribeToUserConversations(userId, (conversations) => {
    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[userId] || 0);
    }, 0);
    callback(total);
  });
}


// ============================================
// HELPER FUNCTIONS FOR SPECIFIC CONTEXTS
// ============================================

/**
 * Create or get conversation for product inquiry
 */
export async function createOrGetConversation(
  clientId: string,
  ownerId: string,
  clientData: { name: string; photo?: string; role: string },
  ownerData: { name: string; photo?: string; role: string },
  productContext?: {
    id: string;
    name: string;
    image?: string;
    type: 'product' | 'hotel' | 'restaurant' | 'dating';
  }
): Promise<string> {
  const context: ConversationContext = {
    type: productContext?.type === 'dating' ? 'dating_inquiry' : 
          productContext?.type === 'hotel' ? 'hotel_inquiry' :
          productContext?.type === 'restaurant' ? 'restaurant_inquiry' : 'product_inquiry',
    itemId: productContext?.id,
    itemName: productContext?.name,
  };

  const productRef: ProductReference | undefined = productContext ? {
    productId: productContext.id,
    productName: productContext.name,
    productImage: productContext.image,
  } : undefined;

  return getOrCreateConversation(
    clientId,
    ownerId,
    clientData,
    ownerData,
    context,
    productRef
  );
}

/**
 * Create conversation for hotel inquiry
 */
export async function createHotelInquiryConversation(
  clientId: string,
  hotelOwnerId: string,
  clientData: { name: string; photo?: string; role: string },
  ownerData: { name: string; photo?: string; role: string },
  hotelId: string,
  hotelName: string,
  hotelImage?: string
): Promise<string> {
  return createOrGetConversation(
    clientId,
    hotelOwnerId,
    clientData,
    ownerData,
    {
      id: hotelId,
      name: hotelName,
      image: hotelImage,
      type: 'hotel',
    }
  );
}

/**
 * Create conversation for restaurant inquiry
 */
export async function createRestaurantInquiryConversation(
  clientId: string,
  restaurantOwnerId: string,
  clientData: { name: string; photo?: string; role: string },
  ownerData: { name: string; photo?: string; role: string },
  restaurantId: string,
  restaurantName: string,
  restaurantImage?: string
): Promise<string> {
  return createOrGetConversation(
    clientId,
    restaurantOwnerId,
    clientData,
    ownerData,
    {
      id: restaurantId,
      name: restaurantName,
      image: restaurantImage,
      type: 'restaurant',
    }
  );
}

/**
 * Create conversation for dating profile inquiry
 */
export async function createDatingInquiryConversation(
  clientId: string,
  intermediaryId: string,
  clientData: { name: string; photo?: string; role: string },
  intermediaryData: { name: string; photo?: string; role: string },
  profileId: string,
  profileName: string,
  profileImage?: string
): Promise<string> {
  return createOrGetConversation(
    clientId,
    intermediaryId,
    clientData,
    intermediaryData,
    {
      id: profileId,
      name: profileName,
      image: profileImage,
      type: 'dating',
    }
  );
}

// Export all functions as chatService
export const chatService = {
  createOrGetConversation,
  getOrCreateConversation,
  createHotelInquiryConversation,
  createRestaurantInquiryConversation,
  createDatingInquiryConversation,
  getUserConversations,
  subscribeToUserConversations,
  sendMessage,
  uploadChatImage,
  uploadChatVideo,
  uploadChatFile,
  getConversationMessages,
  subscribeToConversationMessages,
  markMessagesAsRead,
  getConversation,
  getTotalUnreadCount,
  subscribeToTotalUnreadCount,
};
