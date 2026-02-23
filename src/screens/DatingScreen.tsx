import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useRouter } from 'expo-router';

interface DatingProfile {
  id: string;
  firstName: string;
  age: number;
  gender: string;
  description: string;
  images: string[];
  interests: string[];
  location?: {
    city: string;
    latitude: number;
    longitude: number;
  };
  status: 'available' | 'unavailable';
  isActive: boolean;
}

export default function DatingScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'datingProfiles'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const data: DatingProfile[] = [];
      
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        } as DatingProfile);
      });

      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = !genderFilter || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IoHeartOutline size={32} color="#EC4899" />
          <Text style={styles.headerTitle}>Rencontres</Text>
        </View>
        <Text style={styles.headerSubtitle}>Trouvez la personne qui vous correspond</Text>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>
          🔒 Les coordonnées sont partagées via un intermédiaire
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IoSearchOutline size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un profil..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <IoFilterOutline size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Genre</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterChip, genderFilter === '' && styles.filterChipActive]}
              onPress={() => setGenderFilter('')}
            >
              <Text style={[styles.filterChipText, genderFilter === '' && styles.filterChipTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, genderFilter === 'homme' && styles.filterChipActive]}
              onPress={() => setGenderFilter('homme')}
            >
              <Text style={[styles.filterChipText, genderFilter === 'homme' && styles.filterChipTextActive]}>
                Homme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, genderFilter === 'femme' && styles.filterChipActive]}
              onPress={() => setGenderFilter('femme')}
            >
              <Text style={[styles.filterChipText, genderFilter === 'femme' && styles.filterChipTextActive]}>
                Femme
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Profiles Grid */}
      <ScrollView style={styles.profilesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Chargement...</Text>
          </View>
        ) : filteredProfiles.length === 0 ? (
          <View style={styles.emptyState}>
            <IoHeartOutline size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucun profil trouvé</Text>
          </View>
        ) : (
          <View style={styles.profilesGrid}>
            {filteredProfiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.profileCard}
                onPress={() => router.push(`/dating/${profile.id}` as any)}
              >
                <Image
                  source={{ uri: profile.images[0] }}
                  style={styles.profileImage}
                />
                <View style={styles.statusBadge}>
                  <IoHeartOutline size={12} color="#FFF" />
                  <Text style={styles.statusText}>
                    {profile.status === 'available' ? 'Disponible' : 'Indisponible'}
                  </Text>
                </View>
                
                <View style={styles.profileInfo}>
                  <View style={styles.profileHeader}>
                    <Text style={styles.profileName}>
                      {profile.firstName}, {profile.age}
                    </Text>
                    <Text style={styles.profileGender}>{profile.gender}</Text>
                  </View>
                  
                  {profile.location && (
                    <View style={styles.locationContainer}>
                      <IoLocationOutline size={14} color="#6B7280" />
                      <Text style={styles.locationText}>{profile.location.city}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.profileDescription} numberOfLines={2}>
                    {profile.description}
                  </Text>
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <View style={styles.interestsContainer}>
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <View key={index} style={styles.interestChip}>
                          <Text style={styles.interestText}>{interest}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  privacyNotice: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: '#EC4899',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#EC4899',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  profilesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  profilesGrid: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
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
    backgroundColor: '#E5E7EB',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileInfo: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileGender: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  profileDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  interestChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: '#DC2626',
  },
});
