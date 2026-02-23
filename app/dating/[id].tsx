import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DatingProfile } from '../../src/types/dating';
import { getDatingProfile, incrementProfileViews } from '../../src/services/datingService';

export default function DatingDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getDatingProfile(id as string);
      
      if (data) {
        setProfile(data);
        // Increment views
        await incrementProfileViews(id as string);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (profile?.contactInfo?.intermediaryPhone) {
      Linking.openURL(`tel:${profile.contactInfo.intermediaryPhone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-dislike" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Profil non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: profile.images?.[activeImageIndex] || 'https://via.placeholder.com/400' }}
          style={styles.mainImage}
        />
        {profile.images && profile.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {profile.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  activeImageIndex === index && styles.indicatorActive,
                ]}
                onPress={() => setActiveImageIndex(index)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.content}>
        {/* Name and Age */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.firstName}, {profile.age}</Text>
            <Ionicons
              name={profile.gender === 'homme' ? 'male' : profile.gender === 'femme' ? 'female' : 'male-female'}
              size={28}
              color="#ec4899"
            />
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.locationText}>
              {profile.location?.city}, {profile.location?.country}
            </Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoSection}>
          {profile.height && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="resize" size={20} color="#ec4899" />
              <Text style={styles.quickInfoText}>{profile.height} cm</Text>
            </View>
          )}
          {profile.education && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="school" size={20} color="#ec4899" />
              <Text style={styles.quickInfoText}>{profile.education}</Text>
            </View>
          )}
          {profile.profession && (
            <View style={styles.quickInfoItem}>
              <Ionicons name="briefcase" size={20} color="#ec4899" />
              <Text style={styles.quickInfoText}>{profile.profession}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{profile.description}</Text>
        </View>

        {/* Looking For */}
        {profile.lookingFor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recherche</Text>
            <Text style={styles.description}>{profile.lookingFor}</Text>
          </View>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
          <View style={styles.privacyTextContainer}>
            <Text style={styles.privacyTitle}>Protection de la vie privée</Text>
            <Text style={styles.privacyText}>
              Pour obtenir les coordonnées de ce profil, veuillez contacter l'intermédiaire.
            </Text>
          </View>
        </View>

        {/* Contact Button */}
        {profile.contactInfo && (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>
              Contacter l'intermédiaire
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ec4899',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  imageContainer: {
    position: 'relative',
    height: 400,
    backgroundColor: '#e5e7eb',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    padding: 16,
  },
  nameSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickInfoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickInfoItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  quickInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    color: '#ec4899',
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
