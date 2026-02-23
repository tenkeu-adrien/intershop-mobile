import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../src/store/cartStore';
// NE PAS importer chatStore ici - cela force l'initialisation de Firebase trop tôt
// import { useChatStore } from '../../src/store/chatStore';
import { useAuthStore } from '../../src/store/authStore';

// Composant Badge personnalisé
const TabBarBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: '#EF4444',
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    }}>
      <Text style={{
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
      }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { user } = useAuthStore();
  const cartItemCount = useCartStore(state => state.getItemCount());
  // Pas de badge chat pour l'instant - on le réactivera après que Firebase fonctionne
  const unreadCount = 0; // useChatStore(state => state.totalUnreadCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981', // Vert
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FBBF24', // Jaune
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Catégories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messagerie',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubbles" color={color} size={size} />
              <TabBarBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" color={color} size={size} />
              <TabBarBadge count={cartItemCount} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mon InterShop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
