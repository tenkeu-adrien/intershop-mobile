import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      {/* Image skeleton */}
      <Skeleton width="100%" height={150} borderRadius={0} />
      
      <View style={styles.productInfo}>
        {/* Product name - 2 lines */}
        <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
        
        {/* Rating */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Skeleton width={14} height={14} borderRadius={7} style={{ marginRight: 4 }} />
          <Skeleton width={60} height={12} />
        </View>
        
        {/* Price */}
        <Skeleton width="50%" height={16} />
      </View>
    </View>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.detailContainer}>
      <Skeleton width="100%" height={400} borderRadius={0} />
      <View style={styles.detailInfo}>
        <Skeleton width="90%" height={24} style={{ marginBottom: 12 }} />
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={32} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={100} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={50} />
      </View>
    </View>
  );
};

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <View style={styles.restaurantCard}>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={styles.cardInfo}>
        <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={40} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
};

export const HotelCardSkeleton: React.FC = () => {
  return (
    <View style={styles.hotelCard}>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={styles.cardInfo}>
        <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={40} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={16} />
      </View>
    </View>
  );
};

export const DatingCardSkeleton: React.FC = () => {
  return (
    <View style={styles.datingCard}>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={styles.cardInfo}>
        <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={30} />
      </View>
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  productInfo: {
    padding: 12,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  detailInfo: {
    padding: 16,
    backgroundColor: 'white',
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  datingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    width: '48%',
  },
  cardInfo: {
    padding: 12,
  },
  listContainer: {
    padding: 16,
  },
});
