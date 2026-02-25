import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { useCurrencyStore } from '../../src/store/currencyStore';

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { favorites, loading, loadFavorites, removeFromFavorites } = useFavoritesStore();
  const { convertPrice, formatPrice } = useCurrencyStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await loadFavorites(user.id);
      setRefreshing(false);
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    Alert.alert(
      t('favorites.remove_title'),
      t('favorites.remove_message', { name: productName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (user) {
              try {
                await removeFromFavorites(user.id, productId);
              } catch (error) {
                Alert.alert(t('common.error'), t('favorites.remove_error'));
              }
            }
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { marginTop: index === 0 ? 0 : 12 }]}
      onPress={() => router.push(`/products/${item.productId}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.productImage || 'https://via.placeholder.com/100' }}
          style={styles.productImage}
        />
        <View style={styles.favoriteIconBadge}>
          <Ionicons name="heart" size={16} color="#EF4444" />
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {formatPrice(convertPrice(item.price))}
          </Text>
          <View style={styles.stockBadge}>
            <View style={styles.stockDot} />
            <Text style={styles.stockText}>{t('favorites.in_stock')}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.addedDate}>
              {t('favorites.added')} {new Date(item.addedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.productId, item.productName)}
      >
        <Ionicons name="trash-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('favorites.save_products')}</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyText}>{t('favorites.login_required')}</Text>
          <Text style={styles.emptySubtext}>{t('favorites.login_to_save')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.loginButton}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && favorites.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('common.loading')}</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length.toString()} {favorites.length > 1 ? t('favorites.items') : t('favorites.item')}
        </Text>
      </LinearGradient>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
            <Text style={styles.emptySubtext}>{t('favorites.empty_desc')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.shopButton}
              >
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.shopButtonText}>{t('favorites.start_shopping')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  favoriteIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
