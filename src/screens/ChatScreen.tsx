import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

const CONVERSATION_COLORS: { [key: string]: string } = {
  order: '#3B82F6',
  product_inquiry: '#10B981',
  dating_inquiry: '#EC4899',
  hotel_inquiry: '#8B5CF6',
  restaurant_inquiry: '#F59E0B',
  general: '#6B7280',
  support: '#EF4444',
};

const CONVERSATION_LABELS: { [key: string]: string } = {
  order: 'Commande',
  product_inquiry: 'Produit',
  dating_inquiry: 'Rencontre',
  hotel_inquiry: 'Hôtel',
  restaurant_inquiry: 'Restaurant',
  general: 'Général',
  support: 'Support',
};

export default function ChatScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { conversations, subscribeToConversations, unsubscribeAll } = useChatStore();

  useEffect(() => {
    if (user) {
      subscribeToConversations(user.id);
    }

    return () => {
      unsubscribeAll();
    };
  }, [user]);

  const getOtherParticipant = (conversation: any) => {
    const otherUserId = conversation.participants.find((id: string) => id !== user?.id);
    return conversation.participantsData[otherUserId];
  };

  const renderConversation = ({ item }: any) => {
    const otherParticipant = getOtherParticipant(item);
    const unreadCount = item.unreadCount[user?.id || ''] || 0;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id })}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherParticipant?.photo ? (
            <Image
              source={{ uri: otherParticipant.photo }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {otherParticipant?.name || 'Utilisateur'}
            </Text>
            {item.lastMessageAt && (
              <Text style={styles.timestamp}>
                {formatDistanceToNow(item.lastMessageAt, {
                  addSuffix: true,
                  locale: fr,
                })}
              </Text>
            )}
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Aucun message'}
            </Text>
          </View>

          {/* Badge type de conversation */}
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: CONVERSATION_COLORS[item.type] || '#6B7280' },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {CONVERSATION_LABELS[item.type] || 'Général'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔒</Text>
        <Text style={styles.emptyText}>Connectez-vous pour voir vos messages</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyText}>Aucune conversation</Text>
          <Text style={styles.emptySubtext}>
            Commencez à discuter avec des vendeurs
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 8,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationFooter: {
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#1F2937',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
