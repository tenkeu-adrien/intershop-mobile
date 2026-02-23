import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

const categories: Category[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: 'cart',
    color: '#3B82F6',
    route: '/products',
  },
  {
    id: 'restaurant',
    name: 'Restaurants',
    icon: 'restaurant',
    color: '#F97316',
    route: '/restaurants',
  },
  {
    id: 'hotel',
    name: 'Hôtels',
    icon: 'bed',
    color: '#A855F7',
    route: '/hotels',
  },
  {
    id: 'dating',
    name: 'Rencontres',
    icon: 'heart',
    color: '#EC4899',
    route: '/dating',
  },
];

export default function CategorySelector() {
  const router = useRouter();

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryCard, { backgroundColor: category.color }]}
          onPress={() => handleCategoryPress(category.route)}
          activeOpacity={0.8}
        >
          <Ionicons name={category.icon} size={48} color="white" />
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 60) / 2,
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
