import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useDatingStore } from '../../../src/store/datingStore';
import ContactModal from '../../../src/components/ContactModal';

const { width } = Dimensions.get('window');

export default function DatingProfileDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentProfile: profile, loading, error, fetchProfileById, clearCurrentProfile } = useDatingStore();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfileById(id as string);
    }
    
    return () => {
      clearCurrentProfile();
    };
  }, [id]);

  const handleContact = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!loading && !profile)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Profil non trouvé'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil de rencontre</Text>
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

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: profile.images[selectedImageIndex] || profile.image }}
            style={styles.mainImage}
          />
          <View style={styles.statusBadge}>
            <Ionicons name="heart" size={16} color="#fff" />
            <Text style={styles.statusText}>
              {profile.status === 'available' ? 'Disponible' : 'Indisponible'}
            </Text>
          </View>
        </View>

        {/* Thumbnails */}
        {profile.images && profile.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
          >
            {profile.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>
              {profile.firstName}, {profile.age} ans
            </Text>
            <Ionicons
              name={profile.gender === 'homme' ? 'male' : profile.gender === 'femme' ? 'female' : 'male-female'}
              size={28}
              color="#ec4899"
            />
          </View>

          {/* Location */}
          {profile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={18} color="#6b7280" />
              <Text style={styles.locationText}>{profile.location.city}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.description}>{profile.description}</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {profile.height && (
              <View style={styles.detailCard}>
                <Ionicons name="resize" size={24} color="#ec4899" />
                <Text style={styles.detailLabel}>Taille</Text>
                <Text style={styles.detailValue}>{profile.height} cm</Text>
              </View>
            )}

            {profile.eyeColor && (
              <View style={styles.detailCard}>
                <Ionicons name="eye" size={24} color="#ec4899" />
                <Text style={styles.detailLabel}>Yeux</Text>
                <Text style={styles.detailValue}>{profile.eyeColor}</Text>
              </View>
            )}

            {profile.profession && (
              <View style={styles.detailCard}>
                <Ionicons name="briefcase" size={24} color="#ec4899" />
                <Text style={styles.detailLabel}>Profession</Text>
                <Text style={styles.detailValue}>{profile.profession}</Text>
              </View>
            )}

            {profile.education && (
              <View style={styles.detailCard}>
                <Ionicons name="school" size={24} color="#ec4899" />
                <Text style={styles.detailLabel}>Éducation</Text>
                <Text style={styles.detailValue}>{profile.education}</Text>
              </View>
            )}
          </View>

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

          {/* Looking For */}
          {profile.lookingFor && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recherche</Text>
              <Text style={styles.description}>{profile.lookingFor}</Text>
            </View>
          )}

          {/* Contact Button */}
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Demander le contact</Text>
          </TouchableOpacity>

          <Text style={styles.contactNote}>
            Un intermédiaire vous mettra en relation
          </Text>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
          type="dating"
          ownerId={profile.fournisseurId}
          ownerName="Intermédiaire"
          itemId={profile.id}
          itemName={`${profile.firstName}, ${profile.age} ans`}
          itemImage={profile.images?.[0] || profile.image}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
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
    paddingVertical: 12,
    backgroundColor: '#ec4899',
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
    color: '#fff',
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
    lineHeight: 18,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 400,
    backgroundColor: '#e5e7eb',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#ec4899',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#fce7f3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: '#ec4899',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactNote: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
});
