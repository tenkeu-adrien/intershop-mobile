import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../Skeleton';

export function ChatListSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.item}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.content}>
            <Skeleton width="60%" height={16} style={styles.marginBottom} />
            <Skeleton width="40%" height={12} style={styles.marginBottom} />
            <Skeleton width="80%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  content: {
    flex: 1,
  },
  marginBottom: {
    marginBottom: 8,
  },
});
