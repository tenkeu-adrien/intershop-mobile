import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DatingProfile } from '../../src/types/dating';
import { api } from '../../src/services/api';

export default function DatingPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mobile/dating', {
        params: {
          gender: genderFilter || undefined,
          minAge: minAge,
          maxAge: maxAge,
          limit: 50,
        }
      });
      
      if (response.data && Array.isArray(response.data.profiles)) {
        setProfiles(response.data.profiles);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = !genderFilter || p.gender === genderFilter;
    const matchesAge = p.age >= minAge && p.age <= maxAge;
    
    return matchesSearch && matchesGender && matchesAge;
  });

  const renderProfile = ({ item, index }: { item: DatingProfile; index: number }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => router.push(`/dating/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{item.firstName}, {item.age}</Text>
          <Ionicons 
            name={item.gender === 'homme' ? 'male' : item.gender === 'femme' ? 'female' : 'male-female'} 
            size={20} 
            color="#ec4899" 
          />
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.locationText}>
            {item.location?.city || 'Non spécifié'}
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        {item.interests && item.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {item.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="heart" size={24} color="#ec4899" />
            <Text style={styles.headerTitle}>Rencontres</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Chargement des profils...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text style={styles.headerTitle}>Rencontres</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
        <View style={styles.privacyTextContainer}>
          <Text style={styles.privacyTitle}>Protection de la vie privée</Text>
          <Text style={styles.privacyText}>
            Les coordonnées ne sont pas affichées publiquement. Contactez l'intermédiaire pour plus d'infos.
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un profil..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Genre</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[styles.genderButton, genderFilter === '' && styles.genderButtonActive]}
                  onPress={() => setGenderFilter('')}
                >
                  <Text style={[styles.genderButtonText, genderFilter === '' && styles.genderButtonTextActive]}>
                    Tous
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, genderFilter === 'homme' && styles.genderButtonActive]}
                  onPress={() => setGenderFilter('homme')}
                >
                  <Text style={[styles.genderButtonText, genderFilter === 'homme' && styles.genderButtonTextActive]}>
                    Homme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, genderFilter === 'femme' && styles.genderButtonActive]}
                  onPress={() => setGenderFilter('femme')}
                >
                  <Text style={[styles.genderButtonText, genderFilter === 'femme' && styles.genderButtonTextActive]}>
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Âge: {minAge} - {maxAge}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Profiles List */}
      <FlatList
        data={filteredProfiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ec4899']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun profil trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  privacyNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    gap: 12,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ec4899',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  profileCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  profileInfo: {
    padding: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 11,
    color: '#ec4899',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
});
