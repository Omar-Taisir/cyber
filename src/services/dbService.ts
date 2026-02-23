import { db, auth } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

/** 
 * AEGIS_PRISM | Tactical Experience Service
 * Manages operational context for AI adaptation.
 * Persists to Firebase Firestore when authenticated.
 */

// Interface for operational memory entries
export interface TacticalExperience {
  type: string;
  target?: string;
  outcome: string;
  details: any;
  timestamp?: string;
}

const operational_buffer: TacticalExperience[] = [];

// TacticalDB provides a memory layer for the AI to learn from previous engagement outcomes
export const TacticalDB = {
  // Record a new experience
  recordExperience: async (exp: TacticalExperience) => {
    const enrichedExp = {
      ...exp,
      timestamp: new Date().toISOString()
    };

    operational_buffer.push(enrichedExp);
    if (operational_buffer.length > 50) operational_buffer.shift();

    // Persist to Firestore if logged in
    if (auth.currentUser) {
      try {
        const userRef = collection(db, 'users', auth.currentUser.uid, 'experiences');
        await addDoc(userRef, enrichedExp);
      } catch (err) {
        console.error("Failed to sync experience to Firestore:", err);
      }
    }
  },

  // Retrieve experiences
  getExperiences: (): TacticalExperience[] => {
    return [...operational_buffer];
  },

  // Load from Firestore
  syncFromCloud: async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'experiences'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const cloudExperiences = querySnapshot.docs.map(doc => doc.data() as TacticalExperience);

      // Update buffer with cloud data
      operational_buffer.length = 0;
      operational_buffer.push(...cloudExperiences.reverse());
    } catch (err) {
      console.error("Failed to sync from Firestore:", err);
    }
  }
};

export const TacticalMemory = {
  record: (event: string) => {
    console.debug(`[TACTICAL_MEMORY] ${event}`);
  }
};
