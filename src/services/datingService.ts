import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DatingProfile, DatingContactRequest } from '../types/dating';

/**
 * Récupère un profil dating par son ID
 */
export async function getDatingProfile(profileId: string): Promise<DatingProfile | null> {
  try {
    const docRef = doc(db, 'datingProfiles', profileId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as DatingProfile;
  } catch (error) {
    console.error('Error getting dating profile:', error);
    return null;
  }
}

/**
 * Récupère tous les profils dating actifs avec filtres
 */
export async function getDatingProfiles(filters?: {
  city?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  userLocation?: { latitude: number; longitude: number };
  maxDistance?: number;
  limitCount?: number;
}): Promise<DatingProfile[]> {
  try {
    const profilesRef = collection(db, 'datingProfiles');
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    ];
    
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }
    
    const q = query(profilesRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let profiles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DatingProfile[];
    
    // Apply filters
    if (filters?.city) {
      profiles = profiles.filter(p => 
        p.location?.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    
    if (filters?.gender) {
      profiles = profiles.filter(p => p.gender === filters.gender);
    }
    
    if (filters?.minAge !== undefined) {
      profiles = profiles.filter(p => p.age >= filters.minAge!);
    }
    
    if (filters?.maxAge !== undefined) {
      profiles = profiles.filter(p => p.age <= filters.maxAge!);
    }
    
    // Calculate distances if user location provided
    if (filters?.userLocation) {
      profiles = profiles.map(p => {
        if (p.location) {
          const distance = calculateDistance(
            filters.userLocation!.latitude,
            filters.userLocation!.longitude,
            p.location.latitude,
            p.location.longitude
          );
          return { ...p, distance } as any;
        }
        return p;
      });
      
      // Filter by max distance
      if (filters.maxDistance) {
        profiles = profiles.filter(p => 
          (p as any).distance !== undefined && (p as any).distance <= filters.maxDistance!
        );
      }
      
      // Sort by distance
      profiles.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
    }
    
    return profiles;
  } catch (error) {
    console.error('Error getting dating profiles:', error);
    return [];
  }
}

/**
 * Recherche de profils dating
 */
export async function searchDatingProfiles(
  searchQuery: string,
  filters?: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    city?: string;
    limitCount?: number;
  }
): Promise<DatingProfile[]> {
  try {
    const profiles = await getDatingProfiles({
      ...filters,
      limitCount: filters?.limitCount || 50,
    });
    
    // Filter by search query (client-side)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return profiles.filter(p => 
        p.firstName.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.profession?.toLowerCase().includes(lowerQuery) ||
        p.interests?.some(i => i.toLowerCase().includes(lowerQuery))
      );
    }
    
    return profiles;
  } catch (error) {
    console.error('Error searching dating profiles:', error);
    return [];
  }
}

/**
 * Incrémente le nombre de vues d'un profil
 */
export async function incrementProfileViews(profileId: string): Promise<void> {
  try {
    const docRef = doc(db, 'datingProfiles', profileId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing profile views:', error);
  }
}

/**
 * Récupère les profils d'un fournisseur
 */
export async function getFournisseurDatingProfiles(fournisseurId: string): Promise<DatingProfile[]> {
  try {
    const profilesRef = collection(db, 'datingProfiles');
    const q = query(
      profilesRef,
      where('fournisseurId', '==', fournisseurId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DatingProfile[];
  } catch (error) {
    console.error('Error getting fournisseur dating profiles:', error);
    return [];
  }
}

/**
 * Calcule la distance entre deux points géographiques (en km)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
