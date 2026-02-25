// Chat List Screen - Adapté depuis alibaba-clone pour React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../../src/store/chatStore';
import { useAuthStore } from '../../src/store/authStore';
import { ConversationType, getConversationTypeLabel, getConversationTypeIcon, getConversationTypeColor } from '../../src/types/chat';

export default function ChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, loading, subscribeConversations, unsubscribeConversations, subscribeTotalUnreadCount, unsubscribeTotalUnreadCount } = useChatStore();
  const [selectedFilter, setSelectedFilter] = useState<ConversationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      subscribeConversations(user.id);
      subscribeTotalUnreadCount(user.id);
    }

    return () => {
      unsubscribeConversations();
      unsubscribeTotalUnreadCount();
    };
  }, [user]);

  const getOtherParticipant = (conversation: any) => {
    const otherUserId = conversation.participants.find((id: string) => id !== user?.id);
    return conversation.participantsData[otherUserId];
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv => {
    // Filtre par type
    if (selectedFilter !== 'all' && conv.context?.type !== selectedFilter) {
      return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const otherUser = getOtherParticipant(conv);
      const searchLower = searchQuery.toLowerCase();
      return (
        otherUser?.name?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchLower) ||
        conv.context?.metadata?.productName?.toLowerCase().includes(searchLower) ||
        conv.context?.metadata?.orderNumber?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Compter les conversations par type
  const countByType = (type: ConversationType | 'all') => {
    if (type === 'all') return conversations.length;
    return conversations.filter(conv => conv.context?.type === type).length;
  };

  const filters: Array<{ type: ConversationType | 'all'; label: string; icon: string }> = [
    { type: 'all', label: t('chat.all'), icon: '💬' },
    { type: 'order', label: t('chat.orders'), icon: '🛒' },
    { type: 'product_inquiry', label: t('chat.products'), icon: '📦' },
    { type: 'dating_inquiry', label: t('chat.dating'), icon: '❤️' },
    { type: 'hotel_inquiry', label: t('chat.hotels'), icon: '🏨' },
    { type: 'restaurant_inquiry', label: t('chat.restaurants'), icon: '🍽️' },
  ];

  const renderConversation = ({ item }: any) => {
    const otherUser = getOtherParticipant(item);
    const unreadCount = item.unreadCount[user?.id || ''] || 0;
    const lastMessage = item.lastMessage;
    const context = item.context;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.conversationContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {otherUser?.photo ? (
              <Image
                source={{ uri: otherUser.photo }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {otherUser?.name?.charAt(0).toUpperCase() || '?'}
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

          {/* Content */}
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={styles.participantName} numberOfLines={1}>
                {otherUser?.name || 'Utilisateur'}
              </Text>
              {lastMessage && (
                <Text style={styles.timestamp}>
                  {formatDistanceToNow(new Date(lastMessage.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </Text>
              )}
            </View>

            {/* Badge de type + rôle */}
            <View style={styles.badgesRow}>
              {context && (
                <View style={[styles.typeBadge, { backgroundColor: getConversationTypeColor(context.type) }]}>
                  <Text style={styles.typeBadgeText}>
                    {getConversationTypeIcon(context.type)} {getConversationTypeLabel(context.type)}
                  </Text>
                </View>
              )}
              <Text style={styles.roleText}>{otherUser?.role}</Text>
            </View>

            {/* Contexte (commande, produit, etc.) */}
            {context?.metadata && (
              <Text style={styles.contextText} numberOfLines={1}>
                {context.metadata.orderNumber && `📋 ${t('chat.order')} #${context.metadata.orderNumber}`}
                {context.metadata.productName && `📦 ${context.metadata.productName}`}
                {context.metadata.profileName && `👤 ${context.metadata.profileName}`}
                {context.metadata.hotelName && `🏨 ${context.metadata.hotelName}`}
                {context.metadata.restaurantName && `🍽️ ${context.metadata.restaurantName}`}
              </Text>
            )}

            {/* Dernier message */}
            {lastMessage && (
              <Text
                style={[
                  styles.lastMessage,
                  unreadCount > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {lastMessage.senderId === user?.id && `${t('chat.you')}: `}
                {lastMessage.content}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>{t('chat.login_required')}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>{t('chat.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t('chat.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header + Section fixe: Recherche + Filtres */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubbles" size={32} color="#10B981" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{t('chat.title')}</Text>
              <Text style={styles.headerSubtitle}>{t('chat.your_conversations')}</Text>
            </View>
          </View>
        </View>

        {/* Section fixe: Recherche + Filtres */}
        <View style={styles.fixedSection}>
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('chat.search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres par type */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const count = countByType(filter.type);
            if (count === 0 && filter.type !== 'all') return null;

            return (
              <TouchableOpacity
                key={filter.type}
                onPress={() => setSelectedFilter(filter.type)}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.type && styles.filterButtonActive,
                ]}
              >
                <Text style={styles.filterIcon}>{filter.icon}</Text>
                <Text
                  style={[
                    styles.filterLabel,
                    selectedFilter === filter.type && styles.filterLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterCount,
                      selectedFilter === filter.type && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selectedFilter === filter.type && styles.filterCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      </View>

      {/* Liste des conversations */}
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            {searchQuery ? '🔍' : '💬'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery ? t('chat.no_results') : t('chat.no_messages')}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? t('chat.try_other_keywords')
              : t('chat.start_chatting')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
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
  fixedHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  fixedSection: {
    backgroundColor: 'white',
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  roleFiltersContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  roleFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filtersScrollView: {
    marginTop: 12,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
    height: 36,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterIcon: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: 'white',
  },
  filterCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterCountTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 8,
  },
  conversationCard: {
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
  conversationContent: {
    flexDirection: 'row',
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
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  roleText: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  contextText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#1F2937',
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
