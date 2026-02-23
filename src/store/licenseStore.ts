import { create } from 'zustand';
import { collection, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { getDbInstance } from '../config/firebase';

type LicenseTier = 'free' | 'basic' | 'pro' | 'enterprise';

interface LicenseConfig {
  id: string;
  tier: LicenseTier;
  name: string;
  priceUSD: number;
  productQuota: number;
  features: string[];
}

interface FournisseurSubscription {
  id: string;
  fournisseurId: string;
  licenseTier: LicenseTier;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

interface ProductUsage {
  fournisseurId: string;
  currentCount: number;
  quota: number;
  lastUpdated: Date;
}

interface LicenseState {
  licenses: LicenseConfig[];
  currentSubscription: FournisseurSubscription | null;
  productUsage: ProductUsage | null;
  loading: boolean;
  
  fetchLicenses: () => Promise<void>;
  fetchSubscription: (fournisseurId: string) => Promise<void>;
  fetchProductUsage: (fournisseurId: string) => Promise<void>;
  checkQuota: () => boolean;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  licenses: [],
  currentSubscription: null,
  productUsage: null,
  loading: false,
  
  fetchLicenses: async () => {
    set({ loading: true });
    try {
      const db = getDbInstance();
      const snapshot = await getDocs(collection(db, 'licenses'));
      const licenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LicenseConfig[];
      set({ licenses, loading: false });
    } catch (error) {
      console.error('Error fetching licenses:', error);
      set({ loading: false });
    }
  },
  
  fetchSubscription: async (fournisseurId: string) => {
    set({ loading: true });
    try {
      const db = getDbInstance();
      const q = query(
        collection(db, 'subscriptions'),
        where('fournisseurId', '==', fournisseurId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        set({ 
          currentSubscription: {
            id: snapshot.docs[0].id,
            ...data,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
          } as FournisseurSubscription,
          loading: false 
        });
      } else {
        set({ currentSubscription: null, loading: false });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ loading: false });
    }
  },
  
  fetchProductUsage: async (fournisseurId: string) => {
    set({ loading: true });
    try {
      const db = getDbInstance();
      const docRef = doc(db, 'productUsage', fournisseurId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ 
          productUsage: {
            ...data,
            lastUpdated: data.lastUpdated?.toDate(),
          } as ProductUsage,
          loading: false 
        });
      } else {
        // Default free tier
        set({ 
          productUsage: {
            fournisseurId,
            currentCount: 0,
            quota: 5,
            lastUpdated: new Date(),
          },
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching product usage:', error);
      set({ loading: false });
    }
  },
  
  checkQuota: () => {
    const { productUsage } = get();
    if (!productUsage) return false;
    return productUsage.currentCount < productUsage.quota || productUsage.quota === -1;
  },
}));
