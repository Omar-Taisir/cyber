
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// We use environment variables with the user's provided values as fallbacks for convenience
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBSIccT78tfaAd8_FBbdFmNM4fzrSRdZ5o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "omar-80d17.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "omar-80d17",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "omar-80d17.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "701468604136",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:701468604136:web:eb4c75899f946045543b5d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E2EJ62754Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
